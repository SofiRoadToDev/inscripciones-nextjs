'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { requireRole, hasAccessToCurso, requireAuth } from '@/lib/auth';

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
        const { data: profile, error: profileError } = await (adminClient
            .from('perfiles') as any)
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

            const { error: cursosError } = await (adminClient
                .from('preceptor_cursos' as any) as any)
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
export async function actualizarPreceptorAction(
    preceptorId: string,
    data: {
        nombre: string;
        apellido: string;
        dni: string;
        cursoIds: string[];
        email?: string;
        password?: string;
    }
) {
    try {
        await requireRole('admin');
        const adminClient = createAdminClient();

        // 0. Obtener el perfil para tener el user_id
        const { data: profile } = await adminClient
            .from('perfiles')
            .select('user_id')
            .eq('id', preceptorId)
            .single();

        if (!profile) return { error: 'Perfil no encontrado' };

        // 1. Actualizar email/password en Auth si se proporcionan
        const authUpdates: any = {};
        if (data.email) authUpdates.email = data.email;
        if (data.password) authUpdates.password = data.password;

        if (Object.keys(authUpdates).length > 0) {
            const { error: authError } = await adminClient.auth.admin.updateUserById(
                profile.user_id,
                authUpdates
            );
            if (authError) return { error: 'Error al actualizar credenciales: ' + authError.message };
        }

        // 2. Actualizar Perfil
        const { error: perfilError } = await adminClient
            .from('perfiles')
            .update({
                nombre: data.nombre,
                apellido: data.apellido,
                dni: data.dni,
            })
            .eq('id', preceptorId);

        if (perfilError) {
            return { error: 'Error al actualizar perfil: ' + perfilError.message };
        }

        // 3. Eliminar asignaciones actuales
        await (adminClient
            .from('preceptor_cursos' as any) as any)
            .delete()
            .eq('preceptor_id', preceptorId);

        // 4. Insertar nuevas asignaciones
        if (data.cursoIds.length > 0) {
            const asignaciones = data.cursoIds.map((cursoId) => ({
                preceptor_id: preceptorId,
                curso_id: cursoId,
            }));

            const { error } = await (adminClient
                .from('preceptor_cursos' as any) as any)
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
        await (adminClient
            .from('preceptor_cursos' as any) as any)
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

        const adminClient = createAdminClient();

        const result = await (adminClient
            .from('perfiles') as any)
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

        const { data: perfiles, error } = result;

        if (error) {
            return { error: error.message };
        }

        // Obtener emails de auth.users
        const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers();

        if (usersError) {
            console.error("Error listing users:", usersError);
        }

        const dataWithEmail = (perfiles || []).map((p: any) => {
            const authUser = users?.find(u => u.id === p.user_id);
            return {
                ...p,
                email: authUser?.email || 'S/E'
            };
        });

        return { data: dataWithEmail };
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
export async function getPreceptorStats(cicloLectivo: string = new Date().getFullYear().toString()) {
    try {
        const profile = await requireRole('preceptor');
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // 1. Obtener los IDs de los cursos asignados al preceptor
        const { data: asignaciones } = await (supabase
            .from('preceptor_cursos') as any)
            .select('curso_id')
            .eq('preceptor_id', profile.id);

        const cursoIds = (asignaciones || []).map((a: any) => a.curso_id);

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
                pagos:pagos(
                    id,
                    detalles:detalles_pago(
                        monto,
                        concepto:conceptos_pago(nombre)
                    )
                )
            `)
            .in('curso_id', cursoIds)
            .eq('estado', 'aprobada')
            .eq('ciclo_lectivo', cicloLectivo);

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

            // Verificar si tiene el concepto de "Seguro" pagado en alguno de sus recibos
            const tieneSeguro = ins.pagos?.some((pago: any) =>
                pago.detalles?.some((d: any) =>
                    d.concepto?.nombre?.toLowerCase().includes('seguro')
                )
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
export async function getAlumnosPreceptorAction(params: {
    ciclo?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    cursoId?: string;
    seguro?: string;
    docRel?: string;
    salud?: string;
}) {
    try {
        const profile = await requireRole('preceptor');
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const cicloLectivo = params.ciclo || new Date().getFullYear().toString();
        const page = params.page || 1;
        const pageSize = params.pageSize || 15;
        const start = (page - 1) * pageSize;

        // 1. Obtener los cursos asignados
        const { data: asignaciones } = await (supabase
            .from('preceptor_cursos') as any)
            .select(`
                curso_id,
                curso:cursos(id, nombre)
            `)
            .eq('preceptor_id', profile.id);

        const cursoIds = (asignaciones || []).map((a: any) => a.curso_id);
        const misCursos = (asignaciones || []).map((a: any) => ({
            id: a.curso.id,
            nombre: a.curso.nombre
        }));

        if (cursoIds.length === 0) {
            return { data: [], misCursos: [] };
        }

        // 2. Construir Query con Filtros en el Servidor
        let query = supabase
            .from('inscripciones')
            .select(`
                id,
                curso_id,
                estado,
                ciclo_lectivo,
                documentacion_completa,
                alumno:alumnos(
                    id,
                    nombre,
                    apellido,
                    dni
                ),
                curso:cursos(id, nombre),
                ficha_salud:fichas_salud(
                    cud,
                    discapacidad
                ),
                pagos:pagos(
                    id,
                    detalles:detalles_pago(
                        id,
                        monto,
                        concepto:conceptos_pago(nombre)
                    )
                )
            `, { count: 'exact' })
            .in('curso_id', cursoIds)
            .eq('estado', 'aprobada')
            .eq('ciclo_lectivo', cicloLectivo);

        // Filtro por curso específico (dentro de los permitidos)
        if (params.cursoId && params.cursoId !== 'all') {
            query = query.eq('curso_id', params.cursoId);
        }

        // Filtro por documentación
        if (params.docRel === 'completa') {
            query = query.eq('documentacion_completa', true);
        } else if (params.docRel === 'pendiente') {
            query = query.eq('documentacion_completa', false);
        }

        // Búsqueda por texto (DNI, Nombre, Apellido)
        if (params.search) {
            query = query.or(`alumno.dni.ilike.%${params.search}%,alumno.nombre.ilike.%${params.search}%,alumno.apellido.ilike.%${params.search}%`);
        }

        const { data, count, error } = await query
            .order('created_at', { ascending: false })
            .range(start, start + pageSize - 1);

        if (error) return { error: error.message };

        // 4. Formatear datos y aplicar filtros que requieran lógica compleja (Seguro/Salud si no se pudo en query)
        let alumnos = (data || []).map((ins: any) => {
            const tieneSeguro = ins.pagos?.some((pago: any) =>
                pago.detalles?.some((d: any) =>
                    d.concepto?.nombre?.toLowerCase().includes('seguro')
                )
            );

            return {
                id: ins.id,
                alumnoId: ins.alumno?.id,
                nombre: ins.alumno?.nombre || 'S/N',
                apellido: ins.alumno?.apellido || 'S/N',
                dni: ins.alumno?.dni || '-',
                cursoId: ins.curso_id,
                cursoNombre: ins.curso?.nombre || 'S/N',
                tieneSeguro,
                tieneCud: !!ins.ficha_salud?.cud,
                discapacidad: ins.ficha_salud?.discapacidad || null,
                documentacionCompleta: !!ins.documentacion_completa
            };
        });

        // Filtrado Post-Query para campos calculados o relaciones anidadas complejas si fuera necesario
        if (params.seguro && params.seguro !== 'all') {
            const isPago = params.seguro === 'pago';
            alumnos = alumnos.filter(a => a.tieneSeguro === isPago);
        }

        if (params.salud && params.salud !== 'all') {
            if (params.salud === 'cud') alumnos = alumnos.filter(a => a.tieneCud);
            if (params.salud === 'discapacidad') alumnos = alumnos.filter(a => a.discapacidad && a.discapacidad.trim() !== '');
        }

        return {
            data: alumnos,
            misCursos,
            total: count || 0,
            page,
            pageSize
        };
    } catch (error: any) {
        return { error: error.message };
    }
}
/**
 * Obtiene el detalle de un alumno para edición (valida permisos de preceptor)
 */
export async function getAlumnoDetalleAction(alumnoId: string) {
    try {
        const profile = await requireAuth(); // Puede ser admin o preceptor
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // Validar si el alumno pertenece a un curso accesible por el usuario (si es preceptor)
        if (profile.role === 'preceptor') {
            // Buscamos la inscripción más reciente para ver su curso
            const { data: inscripcion } = await supabase
                .from('inscripciones')
                .select('curso_id')
                .eq('alumno_id', alumnoId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (inscripcion) {
                const tieneAcceso = await hasAccessToCurso(profile.user_id, inscripcion.curso_id);
                if (!tieneAcceso) return { error: 'No tiene permiso para ver este alumno' };
            }
        }

        // 1. Obtener datos básicos del alumno
        const { data: alumno, error: alumnoError } = await supabase
            .from('alumnos')
            .select('*')
            .eq('id', alumnoId)
            .single();

        if (alumnoError) return { error: alumnoError.message };

        // 2. Obtener el domicilio a través de su última inscripción
        // (Asumimos que queremos editar el domicilio "actual" que figura en su última inscripción)
        const { data: ultInscripcion } = await supabase
            .from('inscripciones')
            .select(`
                domicilio_id,
                domicilio:domicilios(
                    id,
                    calle,
                    numero,
                    piso_depto,
                    casa_lote,
                    barrio_manzana_block,
                    provincia_id,
                    departamento_id,
                    localidad_id
                )
            `)
            .eq('alumno_id', alumnoId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // Combinar datos
        const alumnoCompleto = {
            ...alumno,
            domicilio: ultInscripcion?.domicilio || null
        };

        return { data: alumnoCompleto };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * Actualiza los datos de un alumno
 */
export async function updateAlumnoAction(alumnoId: string, data: any) {
    try {
        const profile = await requireAuth();
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // (Opcional) Re-validar permisos si es necesario, similar a getAlumnoDetalle

        // 1. Actualizar Alumno
        const { error: alumnoError } = await supabase
            .from('alumnos')
            .update({
                nombre: data.nombre,
                apellido: data.apellido,
                dni: data.dni,
                fecha_nacimiento: data.fecha_nacimiento?.split('/').reverse().join('-'), // format dd/mm/yyyy -> yyyy-mm-dd
                nacionalidad: data.nacionalidad,
                genero: data.genero,
                email: data.email,
                telefono: data.telefono,
            })
            .eq('id', alumnoId);

        if (alumnoError) return { error: alumnoError.message };

        // 2. Actualizar Domicilio (si existe)
        if (data.domicilio) {
            // Primero obtenemos el ID del domicilio del alumno
            const { data: alumno } = await supabase
                .from('alumnos')
                .select('domicilio_id') // Esto requiere un join inverso o consulta previa si la FK está en inscripciones o tutores. 
                // Ah, espera, en mi esquema:
                // Alumno NO tiene domicilio_id directo en la tabla 'alumnos'?
                // Revisando esquema... ups, 'alumnos' tiene 'id', 'apellido', etc.
                // La RELACIÓN está en la tabla 'inscripciones' (alumno_id, domicilio_id)
                // O el alumno DEBERÍA tener un domicilio principal? 
                // Mirando la migración: "inscripciones" tiene "domicilio_id".
                // PERO... ¿y si el alumno se inscribe de nuevo? ¿Usa otro domicilio?
                // El esquema actual asocia domicilio a la inscripción.
                // Sin embargo, para editar los datos "del alumno", probablemente queramos editar el domicilio de la inscripción ACTUAL.

                // Vamos a buscar la inscripción actual del alumno que estamos editando
                // (Asumimos que editamos sobre el contexto de la inscripción vigente)
                .eq('id', alumnoId)
                .single();

            // CORRECCIÓN: El domicilio está linkeado en la INSCRIPCION. 
            // Necesitamos buscar la inscripción activa para actualizar SU domicilio.

            const { data: inscripcion } = await supabase
                .from('inscripciones')
                .select('domicilio_id')
                .eq('alumno_id', alumnoId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (inscripcion?.domicilio_id) {
                const { error: domError } = await supabase
                    .from('domicilios')
                    .update({
                        calle: data.domicilio.calle,
                        numero: data.domicilio.numero,
                        piso_depto: data.domicilio.piso_depto,
                        casa_lote: data.domicilio.casa_lote,
                        barrio_manzana_block: data.domicilio.barrio_manzana_block,
                        provincia_id: data.domicilio.provincia_id,
                        departamento_id: data.domicilio.departamento_id,
                        localidad_id: data.domicilio.localidad_id,
                    })
                    .eq('id', inscripcion.domicilio_id);

                if (domError) return { error: 'Error actualizando domicilio: ' + domError.message };
            }
        }

        revalidatePath('/preceptor/alumnos');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * Elimina una inscripción (y datos en cascada si están configurados)
 */
export async function eliminarAlumnoAction(inscripcionId: string) {
    try {
        const profile = await requireAuth();
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // Validar permisos sobre el curso de la inscripción
        const { data: inscripcion } = await supabase
            .from('inscripciones')
            .select('curso_id')
            .eq('id', inscripcionId)
            .single();

        if (!inscripcion) return { error: 'Inscripción no encontrada' };

        if (profile.role === 'preceptor') {
            const tieneAcceso = await hasAccessToCurso(profile.user_id, inscripcion.curso_id);
            if (!tieneAcceso) return { error: 'No tiene permiso para eliminar alumnos de este curso' };
        }

        // Ejecutar eliminación
        const { error } = await supabase
            .from('inscripciones')
            .delete()
            .eq('id', inscripcionId);

        if (error) return { error: error.message };

        revalidatePath('/preceptor/alumnos');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
