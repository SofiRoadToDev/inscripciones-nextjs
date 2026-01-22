'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { requireRole, hasAccessToCurso } from '@/lib/auth';

/**
 * Crea un nuevo preceptor con usuario en Supabase Auth
 */
export async function crearPreceptorAction(params: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    dni: string;
    cursoIds: string[];
}) {
    try {
        // Validar que el usuario actual sea admin
        await requireRole('admin');

        const adminClient = createAdminClient();

        // 1. Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
            email: params.email,
            password: params.password,
            email_confirm: true,
        });

        if (authError || !authData.user) {
            return { error: authError?.message || 'Error al crear usuario' };
        }

        // 2. Crear perfil de preceptor
        const { data: profile, error: profileError } = await adminClient
            .from('perfiles')
            .insert({
                user_id: authData.user.id,
                role: 'preceptor',
                nombre: params.nombre,
                apellido: params.apellido,
                dni: params.dni,
            })
            .select()
            .single();

        if (profileError || !profile) {
            // Rollback: eliminar usuario de Auth
            await adminClient.auth.admin.deleteUser(authData.user.id);
            return { error: profileError?.message || 'Error al crear perfil' };
        }

        // 3. Asignar cursos
        if (params.cursoIds.length > 0) {
            const asignaciones = params.cursoIds.map((cursoId) => ({
                preceptor_id: profile.id,
                curso_id: cursoId,
            }));

            const { error: cursosError } = await adminClient
                .from('preceptor_cursos')
                .insert(asignaciones);

            if (cursosError) {
                // Rollback: eliminar perfil y usuario
                await adminClient.from('perfiles').delete().eq('id', profile.id);
                await adminClient.auth.admin.deleteUser(authData.user.id);
                return { error: cursosError.message };
            }
        }

        revalidatePath('/admin/preceptores');
        return { success: true, data: profile };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * Actualiza los cursos asignados a un preceptor
 */
export async function actualizarCursosPreceptorAction(
    preceptorId: string,
    cursoIds: string[]
) {
    try {
        await requireRole('admin');

        const adminClient = createAdminClient();

        // 1. Eliminar asignaciones actuales
        await adminClient
            .from('preceptor_cursos')
            .delete()
            .eq('preceptor_id', preceptorId);

        // 2. Insertar nuevas asignaciones
        if (cursoIds.length > 0) {
            const asignaciones = cursoIds.map((cursoId) => ({
                preceptor_id: preceptorId,
                curso_id: cursoId,
            }));

            const { error } = await adminClient
                .from('preceptor_cursos')
                .insert(asignaciones);

            if (error) {
                return { error: error.message };
            }
        }

        revalidatePath('/admin/preceptores');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * Elimina un preceptor (soft delete del perfil y usuario de Auth)
 */
export async function eliminarPreceptorAction(preceptorId: string) {
    try {
        await requireRole('admin');

        const adminClient = createAdminClient();

        // 1. Obtener user_id del perfil
        const { data: profile } = await adminClient
            .from('perfiles')
            .select('user_id')
            .eq('id', preceptorId)
            .single();

        if (!profile) {
            return { error: 'Preceptor no encontrado' };
        }

        // 2. Eliminar asignaciones de cursos
        await adminClient
            .from('preceptor_cursos')
            .delete()
            .eq('preceptor_id', preceptorId);

        // 3. Eliminar perfil
        const { error: profileError } = await adminClient
            .from('perfiles')
            .delete()
            .eq('id', preceptorId);

        if (profileError) {
            return { error: profileError.message };
        }

        // 4. Eliminar usuario de Auth
        const { error: authError } = await adminClient.auth.admin.deleteUser(
            profile.user_id
        );

        if (authError) {
            return { error: authError.message };
        }

        revalidatePath('/admin/preceptores');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * Obtiene todos los preceptores con sus cursos asignados
 */
export async function getPreceptoresAction() {
    try {
        await requireRole('admin');

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { data, error } = await supabase
            .from('perfiles')
            .select(`
                id,
                nombre,
                apellido,
                dni,
                user_id,
                role,
                created_at,
                cursos:preceptor_cursos(
                    id,
                    curso:cursos(id, nombre)
                )
            `)
            .eq('role', 'preceptor')
            .order('apellido', { ascending: true });

        if (error) {
            return { error: error.message };
        }

        return { data };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * Mueve un alumno de un curso a otro (validando permisos de preceptor)
 */
export async function moverAlumnoAction(
    inscripcionId: string,
    nuevoCursoId: string
) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // Obtener usuario actual
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'No autenticado' };
        }

        // Obtener inscripción actual
        const { data: inscripcion } = await supabase
            .from('inscripciones')
            .select('curso_id')
            .eq('id', inscripcionId)
            .single();

        if (!inscripcion) {
            return { error: 'Inscripción no encontrada' };
        }

        // Validar que el preceptor tenga acceso al curso origen
        const hasAccessOrigen = await hasAccessToCurso(user.id, inscripcion.curso_id);
        if (!hasAccessOrigen) {
            return { error: 'No tiene permiso sobre el curso de origen' };
        }

        // Validar que el preceptor tenga acceso al curso destino
        const hasAccessDestino = await hasAccessToCurso(user.id, nuevoCursoId);
        if (!hasAccessDestino) {
            return { error: 'No tiene permiso sobre el curso de destino' };
        }

        // Realizar el movimiento
        const { error } = await supabase
            .from('inscripciones')
            .update({
                curso_id: nuevoCursoId,
                updated_at: new Date().toISOString(),
            })
            .eq('id', inscripcionId);

        if (error) {
            return { error: error.message };
        }

        revalidatePath('/preceptor');
        revalidatePath('/preceptor/alumnos');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * Obtiene estadísticas resumidas para el dashboard del preceptor
 */
export async function getPreceptorStats() {
    try {
        const profile = await requireRole('preceptor');
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // 1. Obtener los IDs de los cursos asignados al preceptor
        const { data: asignaciones } = await supabase
            .from('preceptor_cursos')
            .select('curso_id')
            .eq('preceptor_id', profile.id);

        const cursoIds = asignaciones?.map((a) => a.curso_id) || [];

        if (cursoIds.length === 0) {
            return {
                data: {
                    totalAlumnos: 0,
                    alumnosConSeguro: 0,
                    alumnosSinSeguro: 0,
                    porcentajeSeguro: 0,
                    cursosStats: []
                }
            };
        }

        // 2. Obtener inscripciones aprobadas de esos cursos junto con sus pagos
        const { data: inscripciones, error } = await supabase
            .from('inscripciones')
            .select(`
                id,
                curso_id,
                cursos(nombre),
                pagos:pagos_inscripcion(
                    pagado,
                    concepto:conceptos_pago(nombre)
                )
            `)
            .in('curso_id', cursoIds)
            .eq('estado', 'aprobada');

        if (error) return { error: error.message };

        // 3. Procesar estadísticas
        let totalAlumnos = inscripciones.length;
        let alumnosConSeguro = 0;
        const cursosMap = new Map<string, { nombre: string, total: number, conSeguro: number }>();

        inscripciones.forEach((ins: any) => {
            const cursoId = ins.curso_id;
            const cursoNombre = ins.cursos?.nombre || 'Desconocido';

            if (!cursosMap.has(cursoId)) {
                cursosMap.set(cursoId, { nombre: cursoNombre, total: 0, conSeguro: 0 });
            }

            const cursoData = cursosMap.get(cursoId)!;
            cursoData.total++;

            // Verificar si tiene el concepto de "Seguro" pagado
            const tieneSeguro = ins.pagos?.some((p: any) =>
                p.concepto?.nombre?.toLowerCase().includes('seguro') && p.pagado
            );

            if (tieneSeguro) {
                alumnosConSeguro++;
                cursoData.conSeguro++;
            }
        });

        return {
            data: {
                totalAlumnos,
                alumnosConSeguro,
                alumnosSinSeguro: totalAlumnos - alumnosConSeguro,
                porcentajeSeguro: totalAlumnos > 0 ? Math.round((alumnosConSeguro / totalAlumnos) * 100) : 0,
                cursosStats: Array.from(cursosMap.values())
            }
        };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * Obtiene la lista de alumnos de los cursos asignados al preceptor
 */
export async function getAlumnosPreceptorAction() {
    try {
        const profile = await requireRole('preceptor');
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // 1. Obtener los cursos asignados
        const { data: asignaciones } = await supabase
            .from('preceptor_cursos')
            .select(`
                curso_id,
                curso:cursos(id, nombre)
            `)
            .eq('preceptor_id', profile.id);

        const cursoIds = asignaciones?.map((a) => a.curso_id) || [];
        const misCursos = asignaciones?.map((a: any) => ({
            id: a.curso.id,
            nombre: a.curso.nombre
        })) || [];

        if (cursoIds.length === 0) {
            return { data: [], misCursos: [] };
        }

        // 2. Obtener alumnos de esos cursos a través de la relación con la tabla alumnos
        const { data, error } = await supabase
            .from('inscripciones')
            .select(`
                id,
                curso_id,
                estado,
                alumno:alumnos(
                    nombre,
                    apellido,
                    dni
                ),
                curso:cursos(id, nombre),
                pagos:pagos_inscripcion(
                    id,
                    pagado,
                    concepto:conceptos_pago(nombre)
                )
            `)
            .in('curso_id', cursoIds)
            .eq('estado', 'aprobada');

        if (error) return { error: error.message };

        // 3. Formatear datos para la tabla y ordenar manualmente por apellido
        const alumnos = data.map((ins: any) => {
            const tieneSeguro = ins.pagos?.some((p: any) =>
                p.concepto?.nombre?.toLowerCase().includes('seguro') && p.pagado
            );

            return {
                id: ins.id,
                nombre: ins.alumno?.nombre || 'S/N',
                apellido: ins.alumno?.apellido || 'S/N',
                dni: ins.alumno?.dni || '-',
                cursoId: ins.curso_id,
                cursoNombre: ins.curso?.nombre || 'S/N',
                tieneSeguro
            };
        }).sort((a, b) => a.apellido.localeCompare(b.apellido));

        return { data: alumnos, misCursos };
    } catch (error: any) {
        return { error: error.message };
    }
}
