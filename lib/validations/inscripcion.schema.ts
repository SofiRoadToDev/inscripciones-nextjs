import { z } from 'zod'

export const inscripcionSchema = z.object({
    nivel_codigo: z.string().min(1, "Debe seleccionar un nivel educativo"),
    ciclo_lectivo: z.string().min(1, "El ciclo lectivo es requerido"),
    repite: z.boolean(),
    materias_pendientes: z.string().optional().or(z.literal('')),
    escuela_procedencia: z.string().optional().or(z.literal('')),
})

export type InscripcionFormData = z.infer<typeof inscripcionSchema>
