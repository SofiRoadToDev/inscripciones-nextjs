'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function getNivelesAction() {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('niveles')
        .select('*')
        .order('nivel', { ascending: true })

    if (error) throw new Error(error.message)
    return data
}

export async function getCursosAction(nivelCodigo?: string) {
    const supabase = createAdminClient()
    let query = supabase
        .from('cursos')
        .select('*')
        .order('nombre', { ascending: true })

    if (nivelCodigo) {
        query = query.eq('nivel_codigo', nivelCodigo)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)
    return data
}

export async function getEscuelasAction() {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('escuelas_procedencia')
        .select('*')
        .order('nombre', { ascending: true })

    if (error) throw new Error(error.message)
    return data
}
