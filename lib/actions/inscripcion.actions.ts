'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { FormData } from '@/lib/services/form-storage.service'
import { inscripcionesService } from '@/lib/services/inscripciones.service'

/**
 * Acción para registrar la inscripción completa en la base de datos
 */
export async function registrarInscripcionAction(allFormData: FormData) {
    try {
        const result = await inscripcionesService.createFullInscripcion(allFormData);

        if (!result.success) {
            return { success: false, error: result.error };
        }

        return { success: true, inscripcionId: result.id };
    } catch (error: any) {
        console.error('Error in registrarInscripcionAction:', error);
        return { success: false, error: "Error interno del servidor al procesar la inscripción." };
    }
}

/**
 * Verifica si un alumno ya está inscrito en un ciclo lectivo
 */
export async function verificarInscripcionExistenteAction(dni: string, cicloLectivo: string) {
    try {
        const exists = await inscripcionesService.checkExistingInscripcion(dni, cicloLectivo);
        return { success: true, exists };
    } catch (error) {
        console.error('Error in verificarInscripcionExistenteAction:', error);
        return { success: false, error: "No se pudo verificar la inscripción previa." };
    }
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
