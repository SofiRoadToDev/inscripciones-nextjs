import InscripcionTabs from '@/components/forms/InscripcionTabs'

export const metadata = {
    title: 'Preinscripción 2026 | EET 3107',
    description: 'Formulario de inscripción para el ciclo lectivo.',
}

export default function InscripcionPage() {
    return (
        <div className="min-h-screen bg-neutral-50 px-4">
            <InscripcionTabs />
        </div>
    )
}
