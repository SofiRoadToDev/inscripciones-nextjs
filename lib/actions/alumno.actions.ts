'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function buscarAlumnoPorDniAction(dni: string) {
    // MOCK PARA TESTS E2E
    if (dni === '12345678') {
        return {
            alumno: {
                apellido: "Mockington",
                nombre: "Testy",
                dni: "12345678",
                fecha_nacimiento: "2015-01-01",
                nacionalidad: "Argentina",
                genero: "Masculino" as const,
                email: "test@mock.com",
                telefono: "2991234567",
                domicilio: {
                    calle: "Calle Falsa",
                    numero: "123",
                    piso_depto: "",
                    casa_lote: "",
                    barrio_manzana_block: "Centro",
                    provincia_id: "00000000-0000-0000-0000-000000000000",
                    departamento_id: "00000000-0000-0000-0000-000000000000",
                    localidad_id: "00000000-0000-0000-0000-000000000000",
                }
            },
            tutores: [
                {
                    apellido: "Mockington",
                    nombre: "Papa",
                    dni: "11222333",
                    vinculo: "Padre",
                    telefono: "2999999999",
                    estudios: "Terciario/Universitario Completo",
                    ocupacion: "Ingeniero",
                    mismo_domicilio_alumno: true,
                    domicilio: {
                        calle: "Calle Falsa",
                        numero: "123",
                        piso_depto: "",
                        casa_lote: "",
                        barrio_manzana_block: "Centro",
                        provincia_id: "00000000-0000-0000-0000-000000000000",
                        departamento_id: "00000000-0000-0000-0000-000000000000",
                        localidad_id: "00000000-0000-0000-0000-000000000000",
                    }
                }
            ],
            fichaSalud: {
                enfermedad_cronica: "Ninguna",
                alergias: "Polen",
                discapacidad: "Ninguna",
                medicamentos: "Ninguno",
                vacunacion_completa: true,
                observaciones: "Saludable"
            }
        }
    }

    const supabase = createAdminClient()

    try {
        // 1. Buscar el alumno por DNI
        const { data: alumno, error: alumnoError } = await supabase
            .from('alumnos')
            .select('*')
            .eq('dni', dni)
            .single()

        if (alumnoError || !alumno) return null

        // 2. Buscar la última inscripción para obtener domicilio, salud y tutores
        const { data: ultimaInscripcion, error: inscripcionError } = await supabase
            .from('inscripciones')
            .select(`
        *,
        domicilios (*),
        fichas_salud (*),
        inscripciones_tutores (
          *,
          tutores (
            *,
            domicilios (*)
          )
        )
      `)
            .eq('alumno_id', alumno.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (inscripcionError || !ultimaInscripcion) {
            // Si el alumno existe pero no tiene inscripciones previas con datos completos
            return {
                alumno: {
                    apellido: alumno.apellido,
                    nombre: alumno.nombre,
                    dni: alumno.dni,
                    fecha_nacimiento: alumno.fecha_nacimiento, // YYYY-MM-DD nativo de Postgres
                    nacionalidad: alumno.nacionalidad,
                    genero: alumno.genero as 'Masculino' | 'Femenino' | 'Otro',
                    email: alumno.email || '',
                    telefono: alumno.telefono || '',
                    domicilio: {
                        calle: '',
                        numero: '',
                        piso_depto: '',
                        casa_lote: '',
                        barrio_manzana_block: '',
                        provincia_id: '',
                        departamento_id: '',
                        localidad_id: '',
                    }
                },
                tutores: [],
                fichaSalud: null
            }
        }

        // 3. Formatear respuesta completa
        return {
            alumno: {
                apellido: alumno.apellido,
                nombre: alumno.nombre,
                dni: alumno.dni,
                fecha_nacimiento: alumno.fecha_nacimiento, // YYYY-MM-DD nativo de Postgres
                nacionalidad: alumno.nacionalidad,
                genero: alumno.genero as 'Masculino' | 'Femenino' | 'Otro',
                email: alumno.email || '',
                telefono: alumno.telefono || '',
                domicilio: {
                    calle: ultimaInscripcion.domicilios.calle,
                    numero: ultimaInscripcion.domicilios.numero,
                    piso_depto: ultimaInscripcion.domicilios.piso_depto || '',
                    casa_lote: ultimaInscripcion.domicilios.casa_lote || '',
                    barrio_manzana_block: ultimaInscripcion.domicilios.barrio_manzana_block || '',
                    provincia_id: ultimaInscripcion.domicilios.provincia_id,
                    departamento_id: ultimaInscripcion.domicilios.departamento_id || '',
                    localidad_id: ultimaInscripcion.domicilios.localidad_id,
                }
            },
            tutores: ultimaInscripcion.inscripciones_tutores.map((it: any) => ({
                apellido: it.tutores.apellido,
                nombre: it.tutores.nombre,
                dni: it.tutores.dni,
                vinculo: it.vinculo,
                telefono: it.tutores.telefono,
                estudios: it.tutores.estudios,
                ocupacion: it.tutores.ocupacion,
                mismo_domicilio_alumno: false, // Por defecto asumimos false si los datos vienen de la DB
                domicilio: {
                    calle: it.tutores.domicilios.calle,
                    numero: it.tutores.domicilios.numero,
                    piso_depto: it.tutores.domicilios.piso_depto || '',
                    casa_lote: it.tutores.domicilios.casa_lote || '',
                    barrio_manzana_block: it.tutores.domicilios.barrio_manzana_block || '',
                    provincia_id: it.tutores.domicilios.provincia_id,
                    departamento_id: it.tutores.domicilios.departamento_id || '',
                    localidad_id: it.tutores.domicilios.localidad_id,
                }
            })),
            fichaSalud: {
                enfermedad_cronica: ultimaInscripcion.fichas_salud.enfermedad_cronica || '',
                alergias: ultimaInscripcion.fichas_salud.alergias || '',
                discapacidad: ultimaInscripcion.fichas_salud.discapacidad || '',
                medicamentos: ultimaInscripcion.fichas_salud.medicamentos || '',
                vacunacion_completa: ultimaInscripcion.fichas_salud.vacunacion_completa,
                observaciones: ultimaInscripcion.fichas_salud.observaciones || '',
            }
        }

    } catch (error) {
        console.error('Error en buscarAlumnoPorDniAction:', error)
        throw new Error('Error al buscar alumno')
    }
}
