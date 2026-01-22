'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Localidad {
    id: string
    nombre: string
    departamento_id: string | null
}

export function useLocalidades(departamentoId: string | null) {
    const [localidades, setLocalidades] = useState<Localidad[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!departamentoId) {
            setLocalidades([])
            return
        }

        async function fetchLocalidades() {
            setLoading(true)
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('localidades')
                    .select('id, nombre, departamento_id')
                    .eq('departamento_id', departamentoId as string)
                    .order('nombre')

                if (error) throw error

                setLocalidades(data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar localidades')
            } finally {
                setLoading(false)
            }
        }

        fetchLocalidades()
    }, [departamentoId])

    return { localidades, loading, error }
}
