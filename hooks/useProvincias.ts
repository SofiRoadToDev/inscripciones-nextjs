'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Provincia {
    id: string
    nombre: string
}

export function useProvincias() {
    const [provincias, setProvincias] = useState<Provincia[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchProvincias() {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('provincias')
                    .select('id, nombre')
                    .order('nombre')

                if (error) throw error

                setProvincias(data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar provincias')
            } finally {
                setLoading(false)
            }
        }

        fetchProvincias()
    }, [])

    return { provincias, loading, error }
}
