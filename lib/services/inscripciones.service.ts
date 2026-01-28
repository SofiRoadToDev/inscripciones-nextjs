import { createAdminClient } from '@/lib/supabase/admin';
import { InscripcionCompleta } from '@/lib/types/inscripciones';

export class InscripcionesService {

    /**
     * Verifica si ya existe una inscripción para un alumno y ciclo lectivo específicos.
     */
    async checkExistingInscripcion(dni: string, cicloLectivo: string): Promise<boolean> {
        const supabase = createAdminClient();

        // Buscamos inscripciones que pertenezcan a un alumno con el DNI dado en el ciclo indicado
        const { data, error } = await supabase
            .from('inscripciones')
            .select(`
                id,
                alumnos!inner(dni)
            `)
            .eq('alumnos.dni', dni)
            .eq('ciclo_lectivo', cicloLectivo);

        if (error) {
            console.error('Error checking existing inscripcion:', error);
            return false;
        }

        return data.length > 0;
    }

    /**
     * Recupera una inscripción completa por su ID, incluyendo todas las relaciones anidadas
     * (Alumno, Domicilio completo, Tutores con sus domicilios, Ficha de Salud).
     */
    async getInscripcionById(id: string): Promise<InscripcionCompleta | null> {
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('inscripciones')
            .select(`
                *,
                alumno:alumnos(*),
                domicilio:domicilios(
                    *, 
                    provincia:provincias(nombre), 
                    departamento:departamentos(nombre), 
                    localidad:localidades(nombre)
                ),
                ficha_salud:fichas_salud(*),
                curso:cursos(*),
                inscripciones_tutores(
                    id,
                    vinculo,
                    tutor:tutores(
                        *,
                        domicilio:domicilios(
                            *, 
                            provincia:provincias(nombre), 
                            localidad:localidades(nombre)
                        )
                    )
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching inscripcion ${id}:`, error);
            return null;
        }

        return data as unknown as InscripcionCompleta;
    }

    /**
     * Crea una inscripción completa realizando todas las inserciones necesarias en las tablas relacionadas.
     */
    async createFullInscripcion(allFormData: any) {
        const supabase = createAdminClient();

        const { alumno, tutores: tutoresData, fichaSalud: salud, inscripcion } = allFormData;

        try {
            // 1. Crear Domicilio del Alumno
            const { data: domAlumno, error: errDom } = await (supabase
                .from('domicilios') as any)
                .insert({
                    calle: alumno.domicilio.calle,
                    numero: alumno.domicilio.numero,
                    piso_depto: alumno.domicilio.piso_depto || null,
                    casa_lote: alumno.domicilio.casa_lote || null,
                    barrio_manzana_block: alumno.domicilio.barrio_manzana_block || null,
                    provincia_id: alumno.domicilio.provincia_id,
                    departamento_id: alumno.domicilio.departamento_id,
                    localidad_id: alumno.domicilio.localidad_id
                })
                .select()
                .single();

            if (errDom) throw new Error(`Error en domicilio: ${errDom.message}`);

            // 2. Crear Alumno
            const { data: newAlumno, error: errAlum } = await supabase
                .from('alumnos')
                .insert({
                    apellido: alumno.apellido,
                    nombre: alumno.nombre,
                    dni: alumno.dni,
                    fecha_nacimiento: this._parseFecha(alumno.fecha_nacimiento),
                    nacionalidad: alumno.nacionalidad,
                    genero: alumno.genero,
                    email: alumno.email || null,
                    telefono: alumno.telefono || null,
                    foto_url: alumno.foto_url || null
                })
                .select()
                .single();

            if (errAlum) throw new Error(`Error en alumno: ${errAlum.message}`);

            // 3. Crear Ficha de Salud
            const { data: newSalud, error: errSalud } = await supabase
                .from('fichas_salud')
                .insert({
                    enfermedad_cronica: salud.enfermedad_cronica || null,
                    alergias: salud.alergias || null,
                    discapacidad: salud.discapacidad || null,
                    medicamentos: salud.medicamentos || null,
                    vacunacion_completa: salud.vacunacion_completa,
                    certificado_salud: salud.certificado_salud || false,
                    cud: salud.cud || false,
                    observaciones: salud.observaciones || null
                })
                .select()
                .single();

            if (errSalud) throw new Error(`Error en salud: ${errSalud.message}`);

            // 4. Crear Inscripción
            const { data: newInscripcion, error: errInsc } = await (supabase
                .from('inscripciones') as any)
                .insert({
                    alumno_id: newAlumno.id,
                    domicilio_id: domAlumno.id,
                    ficha_salud_id: newSalud.id,
                    ciclo_lectivo: inscripcion.ciclo_lectivo,
                    nivel_codigo: inscripcion.nivel_codigo,
                    repite: !!inscripcion.repite,
                    materias_pendientes: inscripcion.materias_pendientes || null,
                    escuela_procedencia: inscripcion.escuela_procedencia || null,
                    documentacion_completa: inscripcion.documentacion_completa || false,
                    observaciones: inscripcion.observaciones || null,
                    curso_id: null,
                    estado: 'pendiente'
                })
                .select()
                .single();

            if (errInsc) throw new Error(`Error en inscripción: ${errInsc.message}`);

            // 5. Procesar Tutores
            for (const t of tutoresData.tutores) {
                let tutorDomicilioId = domAlumno.id;

                if (!t.mismo_domicilio_alumno) {
                    const dom = t.domicilio;
                    const { data: domTutor, error: errDomT } = await (supabase
                        .from('domicilios') as any)
                        .insert({
                            calle: dom.calle,
                            numero: dom.numero,
                            piso_depto: dom.piso_depto || null,
                            casa_lote: dom.casa_lote || null,
                            barrio_manzana_block: dom.barrio_manzana_block || null,
                            provincia_id: dom.provincia_id,
                            departamento_id: dom.departamento_id,
                            localidad_id: dom.localidad_id
                        })
                        .select()
                        .single();

                    if (errDomT) throw new Error(`Error en domicilio tutor: ${errDomT.message}`);
                    tutorDomicilioId = domTutor.id;
                }

                // Crear Tutor
                const { data: newTutor, error: errTutor } = await supabase
                    .from('tutores')
                    .insert({
                        apellido: t.apellido,
                        nombre: t.nombre,
                        dni: t.dni,
                        estudios: t.estudios || null,
                        ocupacion: t.ocupacion || null,
                        telefono: t.telefono,
                        domicilio_id: tutorDomicilioId
                    })
                    .select()
                    .single();

                if (errTutor) throw new Error(`Error en tutor: ${errTutor.message}`);

                // Vincular Tutor con Inscripción
                const { error: errRel } = await supabase
                    .from('inscripciones_tutores')
                    .insert({
                        inscripcion_id: newInscripcion.id,
                        tutor_id: newTutor.id,
                        vinculo: t.vinculo
                    });

                if (errRel) throw new Error(`Error en vínculo tutor: ${errRel.message}`);
            }

            return { success: true, id: newInscripcion.id };

        } catch (error: any) {
            console.error('CRITICAL ERROR during inscripcion creation:', error);
            return { success: false, error: error.message };
        }
    }

    async updateFullInscripcion(id: string, allFormData: any) {
        const supabase = createAdminClient();
        const { alumno, tutores: tutoresData, fichaSalud: salud, inscripcion } = allFormData;

        try {
            // 1. Obtener IDs de registros relacionados actuales
            const { data: current, error: errFetch } = await supabase
                .from('inscripciones')
                .select('alumno_id, domicilio_id, ficha_salud_id')
                .eq('id', id)
                .single();

            if (errFetch || !current) throw new Error("No se encontró la inscripción a actualizar.");

            // 2. Actualizar Domicilio del Alumno
            const { error: errDom } = await supabase
                .from('domicilios')
                .update({
                    calle: alumno.domicilio.calle,
                    numero: alumno.domicilio.numero,
                    piso_depto: alumno.domicilio.piso_depto || null,
                    casa_lote: alumno.domicilio.casa_lote || null,
                    barrio_manzana_block: alumno.domicilio.barrio_manzana_block || null,
                    provincia_id: alumno.domicilio.provincia_id,
                    departamento_id: alumno.domicilio.departamento_id,
                    localidad_id: alumno.domicilio.localidad_id
                })
                .eq('id', current.domicilio_id);

            if (errDom) throw new Error(`Error actualizando domicilio: ${errDom.message}`);

            // 3. Actualizar Alumno
            const { error: errAlum } = await supabase
                .from('alumnos')
                .update({
                    apellido: alumno.apellido,
                    nombre: alumno.nombre,
                    dni: alumno.dni,
                    fecha_nacimiento: this._parseFecha(alumno.fecha_nacimiento),
                    nacionalidad: alumno.nacionalidad,
                    genero: alumno.genero,
                    email: alumno.email || null,
                    telefono: alumno.telefono || null,
                    foto_url: alumno.foto_url || null
                })
                .eq('id', current.alumno_id);

            if (errAlum) throw new Error(`Error actualizando alumno: ${errAlum.message}`);

            // 4. Actualizar Ficha de Salud
            const { error: errSalud } = await supabase
                .from('fichas_salud')
                .update({
                    enfermedad_cronica: salud.enfermedad_cronica || null,
                    alergias: salud.alergias || null,
                    discapacidad: salud.discapacidad || null,
                    medicamentos: salud.medicamentos || null,
                    vacunacion_completa: salud.vacunacion_completa,
                    certificado_salud: salud.certificado_salud || false,
                    cud: salud.cud || false,
                    observaciones: salud.observaciones || null
                })
                .eq('id', current.ficha_salud_id);

            if (errSalud) throw new Error(`Error actualizando salud: ${errSalud.message}`);

            // 5. Actualizar Inscripción
            const { error: errInsc } = await supabase
                .from('inscripciones')
                .update({
                    ciclo_lectivo: inscripcion.ciclo_lectivo,
                    nivel_codigo: inscripcion.nivel_codigo,
                    repite: !!inscripcion.repite,
                    materias_pendientes: inscripcion.materias_pendientes || null,
                    escuela_procedencia: inscripcion.escuela_procedencia || null,
                    documentacion_completa: inscripcion.documentacion_completa || false,
                    observaciones: inscripcion.observaciones || null
                })
                .eq('id', id);

            if (errInsc) throw new Error(`Error actualizando inscripción: ${errInsc.message}`);

            // 6. Procesar Tutores
            await supabase.from('inscripciones_tutores').delete().eq('inscripcion_id', id);

            for (const t of tutoresData.tutores) {
                let tutorDomicilioId = current.domicilio_id;

                if (!t.mismo_domicilio_alumno) {
                    const dom = t.domicilio;
                    const { data: domTutor, error: errDomT } = await (supabase
                        .from('domicilios') as any)
                        .insert({
                            calle: dom.calle,
                            numero: dom.numero,
                            piso_depto: dom.piso_depto || null,
                            casa_lote: dom.casa_lote || null,
                            barrio_manzana_block: dom.barrio_manzana_block || null,
                            provincia_id: dom.provincia_id,
                            departamento_id: dom.departamento_id,
                            localidad_id: dom.localidad_id
                        })
                        .select()
                        .single();

                    if (errDomT) throw new Error(`Error en domicilio tutor: ${errDomT.message}`);
                    tutorDomicilioId = domTutor.id;
                }

                const { data: existingTutor } = await supabase.from('tutores').select('id').eq('dni', t.dni).single();

                let tutorId;
                if (existingTutor) {
                    tutorId = existingTutor.id;
                    await supabase.from('tutores').update({
                        apellido: t.apellido,
                        nombre: t.nombre,
                        estudios: t.estudios || null,
                        ocupacion: t.ocupacion || null,
                        telefono: t.telefono,
                        domicilio_id: tutorDomicilioId
                    }).eq('id', tutorId);
                } else {
                    const { data: newTutor, error: errTutor } = await supabase
                        .from('tutores')
                        .insert({
                            apellido: t.apellido,
                            nombre: t.nombre,
                            dni: t.dni,
                            estudios: t.estudios || null,
                            ocupacion: t.ocupacion || null,
                            telefono: t.telefono,
                            domicilio_id: tutorDomicilioId
                        })
                        .select()
                        .single();
                    if (errTutor) throw new Error(`Error en nuevo tutor: ${errTutor.message}`);
                    tutorId = newTutor.id;
                }

                await supabase.from('inscripciones_tutores').insert({
                    inscripcion_id: id,
                    tutor_id: tutorId,
                    vinculo: t.vinculo
                });
            }

            return { success: true };

        } catch (error: any) {
            console.error('CRITICAL ERROR during inscripcion update:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Mapea un objeto InscripcionCompleta al formato que espera el FormData del frontend
     */
    mapInscripcionToFormData(inscripcion: InscripcionCompleta): any {
        return {
            alumno: {
                apellido: inscripcion.alumno.apellido,
                nombre: inscripcion.alumno.nombre,
                dni: inscripcion.alumno.dni,
                fecha_nacimiento: inscripcion.alumno.fecha_nacimiento, // Mantener YYYY-MM-DD para DateSelector
                nacionalidad: inscripcion.alumno.nacionalidad,
                genero: inscripcion.alumno.genero,
                email: inscripcion.alumno.email || '',
                telefono: inscripcion.alumno.telefono || '',
                domicilio: {
                    calle: inscripcion.domicilio?.calle,
                    numero: inscripcion.domicilio?.numero,
                    piso_depto: inscripcion.domicilio?.piso_depto || '',
                    casa_lote: inscripcion.domicilio?.casa_lote || '',
                    barrio_manzana_block: inscripcion.domicilio?.barrio_manzana_block || '',
                    provincia_id: inscripcion.domicilio?.provincia_id?.toString() || '',
                    departamento_id: inscripcion.domicilio?.departamento_id?.toString() || '',
                    localidad_id: inscripcion.domicilio?.localidad_id?.toString() || ''
                }
            },
            tutores: {
                tutores: (inscripcion.inscripciones_tutores || []).map(it => ({
                    apellido: it.tutor.apellido,
                    nombre: it.tutor.nombre,
                    dni: it.tutor.dni,
                    vinculo: it.vinculo,
                    telefono: it.tutor.telefono,
                    estudios: it.tutor.estudios || '',
                    ocupacion: it.tutor.ocupacion || '',
                    mismo_domicilio_alumno: it.tutor.domicilio_id === inscripcion.domicilio?.id,
                    domicilio: {
                        calle: it.tutor.domicilio?.calle,
                        numero: it.tutor.domicilio?.numero,
                        piso_depto: it.tutor.domicilio?.piso_depto || '',
                        casa_lote: it.tutor.domicilio?.casa_lote || '',
                        barrio_manzana_block: it.tutor.domicilio?.barrio_manzana_block || '',
                        provincia_id: it.tutor.domicilio?.provincia_id?.toString() || '',
                        departamento_id: it.tutor.domicilio?.departamento_id?.toString() || '',
                        localidad_id: it.tutor.domicilio?.localidad_id?.toString() || ''
                    }
                }))
            },
            fichaSalud: {
                enfermedad_cronica: inscripcion.ficha_salud.enfermedad_cronica || '',
                alergias: inscripcion.ficha_salud.alergias || '',
                discapacidad: inscripcion.ficha_salud.discapacidad || '',
                medicamentos: inscripcion.ficha_salud.medicamentos || '',
                vacunacion_completa: !!inscripcion.ficha_salud.vacunacion_completa,
                certificado_salud: !!inscripcion.ficha_salud.certificado_salud,
                cud: !!(inscripcion.ficha_salud as any).cud,
                observaciones: inscripcion.ficha_salud.observaciones || ''
            },
            inscripcion: {
                ciclo_lectivo: inscripcion.ciclo_lectivo,
                nivel_codigo: inscripcion.nivel_codigo?.toString() || '',
                repite: !!inscripcion.repite,
                materias_pendientes: inscripcion.materias_pendientes || '',
                escuela_procedencia: inscripcion.escuela_procedencia || '',
                documentacion_completa: !!inscripcion.documentacion_completa,
                observaciones: inscripcion.observaciones || ''
            }
        };
    }

    private _formatFechaParaForm(fechaStr: string): string {
        if (!fechaStr) return '';
        const d = new Date(fechaStr);
        if (isNaN(d.getTime())) return fechaStr;
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }

    private _parseFecha(fechaStr: string): string {
        if (!fechaStr) return '';
        if (fechaStr.includes('-')) return fechaStr;
        const [day, month, year] = fechaStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
}

export const inscripcionesService = new InscripcionesService();
