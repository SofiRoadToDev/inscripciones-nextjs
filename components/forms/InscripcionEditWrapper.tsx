'use client'

import { useEffect, useState } from 'react'
import { getInscripcionParaEditarAction } from '@/lib/actions/inscripcion.actions'
import { formStorageService } from '@/lib/services/form-storage.service'
import InscripcionTabs from '@/components/forms/InscripcionTabs'
import { Loader2 } from 'lucide-react'

interface InscripcionEditWrapperProps {
    id: string
}

export default function InscripcionEditWrapper({ id }: InscripcionEditWrapperProps) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadData() {
            try {
                const result = await getInscripcionParaEditarAction(id)
                if (result.success && result.data) {
                    // Limpiamos lo viejo y cargamos lo nuevo en el storage
                    formStorageService.clearFormData()

                    // Guardamos cada sección en el storage
                    if (result.data.alumno) formStorageService.saveTabData('alumno', result.data.alumno)
                    if (result.data.tutores) formStorageService.saveTabData('tutores', result.data.tutores)
                    if (result.data.fichaSalud) formStorageService.saveTabData('fichaSalud', result.data.fichaSalud)
                    if (result.data.inscripcion) formStorageService.saveTabData('inscripcion', result.data.inscripcion)

                    setLoading(false)
                } else {
                    setError(result.error || "No se pudieron cargar los datos.")
                }
            } catch (err) {
                setError("Ocurrió un error al cargar la inscripción.")
            }
        }

        loadData()
    }, [id])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                <p className="text-primary-900 font-medium">Cargando datos de inscripción...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-2xl max-w-2xl mx-auto my-12">
                <h2 className="text-2xl font-display text-rose-900 mb-2">Error</h2>
                <p className="text-rose-600 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors"
                >
                    Reintentar
                </button>
            </div>
        )
    }

    return <InscripcionTabs mode="edit" inscripcionId={id} />
}
