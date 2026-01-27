import { z } from 'zod'

export const alumnoSchema = z.object({
    // Identificación
    apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    dni: z.string()
        .regex(/^\d{7,8}$/, 'El DNI debe tener 7 u 8 dígitos')
        .transform(val => val.trim()),
    fecha_nacimiento: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
    nacionalidad: z.string().min(2, 'La nacionalidad es obligatoria'),
    genero: z.enum(['Masculino', 'Femenino', 'Otro']),
    foto_url: z.string().optional(),

    // Contacto
    email: z.string()
        .email('Email inválido')
        .optional()
        .or(z.literal('')),
    telefono: z.string()
        .regex(/^[0-9\s\-\+\(\)]{7,20}$/, 'Teléfono inválido')
        .optional()
        .or(z.literal('')),

    // Domicilio
    domicilio: z.object({
        calle: z.string().min(3, 'La calle es obligatoria'),
        numero: z.string().min(1, 'El número es obligatorio'),
        piso_depto: z.string().optional().or(z.literal('')),
        casa_lote: z.string().optional().or(z.literal('')),
        barrio_manzana_block: z.string().optional().or(z.literal('')),
        provincia_id: z.string().uuid('Debe seleccionar una provincia'),
        departamento_id: z.string().uuid('Debe seleccionar un departamento'),
        localidad_id: z.string().uuid('Debe seleccionar una localidad'),
    })
})

export type AlumnoFormData = z.infer<typeof alumnoSchema>
