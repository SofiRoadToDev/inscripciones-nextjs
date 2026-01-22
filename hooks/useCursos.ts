'use client'

import { useState, useEffect } from 'react'
import { getCursosAction } from '@/lib/actions/catalogo.actions'

export function useCursos(nivelCodigo?: string) {
    const [cursos, setCursos] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!nivelCodigo) {
            setCursos([])
            return
        }

        async function load() {
            setLoading(true)
            try {
                const data = await getCursosAction(nivelCodigo)
                setCursos(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [nivelCodigo])

    return { cursos, loading, error }
}
