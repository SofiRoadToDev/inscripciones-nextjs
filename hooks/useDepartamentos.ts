'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Departamento {
    id: string
    nombre: string
    provincia_id: string
}

export function useDepartamentos(provinciaId: string | null) {
    const [departamentos, setDepartamentos] = useState<Departamento[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!provinciaId) {
            setDepartamentos([])
            return
        }

        async function fetchDepartamentos() {
            setLoading(true)
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('departamentos')
                    .select('id, nombre, provincia_id')
                    .eq('provincia_id', provinciaId as string)
                    .order('nombre')

                if (error) throw error

                setDepartamentos(data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar departamentos')
            } finally {
                setLoading(false)
            }
        }

        fetchDepartamentos()
    }, [provinciaId])

    return { departamentos, loading, error }
}
