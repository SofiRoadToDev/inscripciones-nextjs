'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { FormData } from '@/lib/services/form-storage.service'

/**
 * Acción para registrar la inscripción completa en la base de datos
 */
export async function registrarInscripcionAction(allFormData: FormData) {
    const supabase = createAdminClient()

    const { alumno, tutores: tutoresData, fichaSalud: salud, inscripcion } = allFormData

    // Preparar tutores para el procedure (aplanar domicilio si es necesario)
    const tutoresAplanados = tutoresData.tutores.map((t: any) => {
        const mismoDomicilio = t.mismo_domicilio_alumno
        const dom = mismoDomicilio ? alumno.domicilio : t.domicilio

        return {
            apellido: t.apellido,
            nombre: t.nombre,
            dni: t.dni,
            estudios: t.estudios,
            ocupacion: t.ocupacion,
            telefono: t.telefono,
            vinculo: t.vinculo,
            domicilio_calle: dom.calle,
            domicilio_numero: dom.numero,
            domicilio_piso_depto: dom.piso_depto || null,
            domicilio_casa_lote: dom.casa_lote || null,
            domicilio_barrio: dom.barrio_manzana_block || null,
            domicilio_provincia_id: dom.provincia_id,
            domicilio_departamento: dom.departamento,
            domicilio_localidad_id: dom.localidad_id
        }
    })

    // Llamar al stored procedure
    const { data, error } = await supabase.rpc('crear_inscripcion_completa', {
        p_alumno_apellido: alumno.apellido,
        p_alumno_nombre: alumno.nombre,
        p_alumno_dni: alumno.dni,
        p_alumno_fecha_nacimiento: parseFecha(alumno.fecha_nacimiento),
        p_alumno_nacionalidad: alumno.nacionalidad,
        p_alumno_genero: alumno.genero,
        p_alumno_foto_url: alumno.foto_url || null,
        p_alumno_email: alumno.email || null,
        p_alumno_telefono: alumno.telefono || null,

        p_domicilio_calle: alumno.domicilio.calle,
        p_domicilio_numero: alumno.domicilio.numero,
        p_domicilio_piso_depto: alumno.domicilio.piso_depto || null,
        p_domicilio_casa_lote: alumno.domicilio.casa_lote || null,
        p_domicilio_barrio: alumno.domicilio.barrio_manzana_block || null,
        p_domicilio_provincia_id: alumno.domicilio.provincia_id,
        p_domicilio_departamento: alumno.domicilio.departamento,
        p_domicilio_localidad_id: alumno.domicilio.localidad_id,

        p_ciclo_lectivo: inscripcion.ciclo_lectivo,
        p_curso_id: null as any,
        p_nivel_codigo: inscripcion.nivel_codigo,
        p_repite: inscripcion.repite,
        p_materias_pendientes: inscripcion.materias_pendientes || null,
        p_escuela_procedencia_id: (inscripcion.escuela_procedencia_id && inscripcion.escuela_procedencia_id !== 'nueva')
            ? inscripcion.escuela_procedencia_id
            : null,

        p_enfermedad_cronica: salud.enfermedad_cronica || null,
        p_alergias: salud.alergias || null,
        p_discapacidad: salud.discapacidad || null,
        p_medicamentos: salud.medicamentos || null,
        p_vacunacion_completa: salud.vacunacion_completa,
        p_observaciones: salud.observaciones || null,

        p_tutores: tutoresAplanados
    })

    if (error) {
        console.error('Error en RPC crear_inscripcion_completa:', error)
        return { success: false, error: error.message }
    }

    return { success: true, inscripcionId: data }
}

/**
 * Parsea fecha de DD/MM/YYYY a YYYY-MM-DD para Postgres
 */
function parseFecha(fechaStr: string): string {
    if (!fechaStr) return ''
    if (fechaStr.includes('-')) return fechaStr // YYYY-MM-DD
    const [day, month, year] = fechaStr.split('/')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}
