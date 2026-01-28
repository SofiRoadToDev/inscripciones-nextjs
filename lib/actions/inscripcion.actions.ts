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
 * Acción para actualizar una inscripción existente
 */
export async function actualizarInscripcionAction(id: string, allFormData: FormData) {
    try {
        const result = await inscripcionesService.updateFullInscripcion(id, allFormData);

        if (!result.success) {
            return { success: false, error: result.error };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error in actualizarInscripcionAction:', error);
        return { success: false, error: "Error interno del servidor al actualizar la inscripción." };
    }
}

/**
 * Obtiene una inscripción y la mapea al formato de formulario
 */
export async function getInscripcionParaEditarAction(id: string) {
    try {
        const inscripcion = await inscripcionesService.getInscripcionById(id);
        if (!inscripcion) {
            return { success: false, error: "No se encontró la inscripción." };
        }

        const formData = inscripcionesService.mapInscripcionToFormData(inscripcion);
        return { success: true, data: formData };
    } catch (error: any) {
        console.error('Error in getInscripcionParaEditarAction:', error);
        return { success: false, error: "Error al recuperar los datos para editar." };
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
