import { createAdminClient } from '@/lib/supabase/admin';
import { InscripcionCompleta } from '@/lib/types/inscripciones';

export class InscripcionesService {

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

    private _parseFecha(fechaStr: string): string {
        if (!fechaStr) return '';
        if (fechaStr.includes('-')) return fechaStr;
        const [day, month, year] = fechaStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
}

export const inscripcionesService = new InscripcionesService();
