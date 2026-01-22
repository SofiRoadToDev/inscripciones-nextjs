'use client'

import { useState, useEffect } from 'react'
import { getNivelesAction } from '@/lib/actions/catalogo.actions'

export function useNiveles() {
    const [niveles, setNiveles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            try {
                const data = await getNivelesAction()
                setNiveles(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return { niveles, loading, error }
}
