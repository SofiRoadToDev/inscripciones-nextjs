import { z } from 'zod'

export const saludSchema = z.object({
    enfermedad_cronica: z.string().optional().or(z.literal('')),
    alergias: z.string().optional().or(z.literal('')),
    discapacidad: z.string().optional().or(z.literal('')),
    medicamentos: z.string().optional().or(z.literal('')),
    vacunacion_completa: z.boolean(),
    observaciones: z.string().optional().or(z.literal('')),
})

export type SaludFormData = z.infer<typeof saludSchema>
