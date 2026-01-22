'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { loginSchema, LoginInput } from '@/lib/validations/auth.schema';
import { redirect } from 'next/navigation';

export async function loginAction(data: LoginInput) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Validar esquema
    const result = loginSchema.safeParse(data);
    if (!result.success) {
        return { error: 'Datos inválidos' };
    }

    const { email, password } = result.data;

    // 2. Verificar bloqueo de intentos (Seguridad)
    const { data: attempt } = await supabase
        .from('login_attempts')
        .select('count, locked_until')
        .eq('email', email)
        .single();

    if (attempt?.locked_until && new Date(attempt.locked_until) > new Date()) {
        const minutesLeft = Math.ceil((new Date(attempt.locked_until).getTime() - new Date().getTime()) / 60000);
        return { error: `Cuenta bloqueada temporalmente. Intente en ${minutesLeft} minutos.` };
    }

    // 3. Intento de Login
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        // Registrar intento fallido
        if (attempt) {
            const newCount = (attempt.count || 0) + 1;
            const lockedUntil = newCount >= 3 ? new Date(Date.now() + 15 * 60000).toISOString() : null; // Bloqueo de 15 min

            await supabase
                .from('login_attempts')
                .update({ count: newCount, locked_until: lockedUntil, timestamp: new Date().toISOString() })
                .eq('email', email);
        } else {
            await supabase
                .from('login_attempts')
                .insert({ email, count: 1 });
        }

        return { error: 'Credenciales inválidas' };
    }

    // 4. Éxito: Limpiar intentos fallidos
    await supabase.from('login_attempts').delete().eq('email', email);

    redirect('/admin');
}

export async function logoutAction() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.signOut();
    redirect('/admin/login');
}
