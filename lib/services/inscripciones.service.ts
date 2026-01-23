import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { InscripcionCompleta } from '@/lib/types/inscripciones';

export class InscripcionesService {

    /**
     * Recupera una inscripción completa por su ID, incluyendo todas las relaciones anidadas
     * (Alumno, Domicilio completo, Tutores con sus domicilios, Ficha de Salud).
     */
    async getInscripcionById(id: string): Promise<InscripcionCompleta | null> {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

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
                            departamento:departamentos(nombre), 
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

        return data as InscripcionCompleta;
    }
}

export const inscripcionesService = new InscripcionesService();
