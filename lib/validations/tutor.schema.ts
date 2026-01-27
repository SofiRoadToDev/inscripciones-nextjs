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
        calle: z.string().optional().or(z.literal('')),
        numero: z.string().optional().or(z.literal('')),
        piso_depto: z.string().optional().or(z.literal('')),
        casa_lote: z.string().optional().or(z.literal('')),
        barrio_manzana_block: z.string().optional().or(z.literal('')),
        provincia_id: z.string().optional().or(z.literal('')),
        departamento_id: z.string().optional().or(z.literal('')),
        localidad_id: z.string().optional().or(z.literal('')),
    }).optional()
}).superRefine((data, ctx) => {
    if (!data.mismo_domicilio_alumno && data.domicilio) {
        if (!data.domicilio.calle || data.domicilio.calle.length < 3) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La calle es obligatoria", path: ['domicilio', 'calle'] });
        }
        if (!data.domicilio.numero || data.domicilio.numero.length < 1) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El número es obligatorio", path: ['domicilio', 'numero'] });
        }
        if (!data.domicilio.provincia_id || data.domicilio.provincia_id === '') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe seleccionar una provincia", path: ['domicilio', 'provincia_id'] });
        }
        if (!data.domicilio.departamento_id || data.domicilio.departamento_id === '') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe seleccionar un departamento", path: ['domicilio', 'departamento_id'] });
        }
        if (!data.domicilio.localidad_id || data.domicilio.localidad_id === '') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe seleccionar una localidad", path: ['domicilio', 'localidad_id'] });
        }
    }
})

export const tutoresPageSchema = z.object({
    tutores: z.array(tutorSchema).min(1, 'Debe agregar al menos un tutor')
})

export type TutorFormData = z.infer<typeof tutorSchema>
export type TutoresPageFormData = z.infer<typeof tutoresPageSchema>
