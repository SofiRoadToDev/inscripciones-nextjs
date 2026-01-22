import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import type { UserProfile, Role } from './types';

/**
 * Obtiene el perfil del usuario autenticado
 * @returns UserProfile o null si no está autenticado o no tiene perfil
 */
export async function getUserProfile(): Promise<UserProfile | null> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data: profile } = await supabase
        .from('perfiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    return profile;
}

/**
 * Verifica si un usuario tiene acceso a un curso específico
 * @param userId - ID del usuario de Supabase Auth
 * @param cursoId - ID del curso a verificar
 * @returns true si tiene acceso, false en caso contrario
 */
export async function hasAccessToCurso(
    userId: string,
    cursoId: string
): Promise<boolean> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Obtener perfil del usuario
    const { data: profile } = await supabase
        .from('perfiles')
        .select('id, role')
        .eq('user_id', userId)
        .single();

    if (!profile) {
        return false;
    }

    // Los admins tienen acceso a todos los cursos
    if (profile.role === 'admin') {
        return true;
    }

    // Verificar si el preceptor tiene asignado este curso
    const { data: assignment } = await supabase
        .from('preceptor_cursos')
        .select('id')
        .eq('preceptor_id', profile.id)
        .eq('curso_id', cursoId)
        .single();

    return !!assignment;
}

/**
 * Obtiene todos los cursos asignados a un preceptor
 * @param preceptorId - ID del perfil del preceptor
 * @returns Array de IDs de cursos
 */
export async function getPreceptorCursos(
    preceptorId: string
): Promise<string[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: cursos } = await supabase
        .from('preceptor_cursos')
        .select('curso_id')
        .eq('preceptor_id', preceptorId);

    return cursos?.map((c) => c.curso_id) || [];
}

/**
 * Wrapper para Server Actions que requieren un rol específico
 * Lanza un error si el usuario no tiene el rol requerido
 */
export async function requireRole(role: Role): Promise<UserProfile> {
    const profile = await getUserProfile();

    if (!profile) {
        throw new Error('No autenticado');
    }

    if (profile.role !== role) {
        throw new Error(`Acceso denegado. Se requiere rol: ${role}`);
    }

    return profile;
}

/**
 * Wrapper para Server Actions que requieren que el usuario sea admin o preceptor
 */
export async function requireAuth(): Promise<UserProfile> {
    const profile = await getUserProfile();

    if (!profile) {
        throw new Error('No autenticado');
    }

    return profile;
}
