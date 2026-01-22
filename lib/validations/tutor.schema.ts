import { z } from 'zod'

export const tutorSchema = z.object({
    apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    dni: z.string()
        .regex(/^\d{7,8}$/, 'El DNI debe tener 7 u 8 dígitos')
        .transform(val => val.trim()),
    vinculo: z.string().min(2, 'El vínculo es obligatorio (Eje: Padre, Madre, Tutor Legal)'),
    telefono: z.string()
        .regex(/^[0-9\s\-\+\(\)]{7,20}$/, 'Teléfono inválido'),
    estudios: z.string().optional().or(z.literal('')),
    ocupacion: z.string().optional().or(z.literal('')),

    // Domicilio del tutor
    mismo_domicilio_alumno: z.boolean(),
    domicilio: z.object({
        calle: z.string().min(3, 'La calle es obligatoria'),
        numero: z.string().min(1, 'El número es obligatorio'),
        piso_depto: z.string().optional().or(z.literal('')),
        casa_lote: z.string().optional().or(z.literal('')),
        barrio_manzana_block: z.string().optional().or(z.literal('')),
        provincia_id: z.string().uuid('Debe seleccionar una provincia'),
        departamento_id: z.string().uuid('Debe seleccionar un departamento'),
        localidad_id: z.string().uuid('Debe seleccionar una localidad'),
    }).optional()
})

export const tutoresPageSchema = z.object({
    tutores: z.array(tutorSchema).min(1, 'Debe agregar al menos un tutor')
})

export type TutorFormData = z.infer<typeof tutorSchema>
export type TutoresPageFormData = z.infer<typeof tutoresPageSchema>
