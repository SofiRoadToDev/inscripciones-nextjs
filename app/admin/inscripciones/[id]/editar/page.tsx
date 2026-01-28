import InscripcionEditWrapper from "@/components/forms/InscripcionEditWrapper"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditarInscripcionPage({ params }: PageProps) {
    const { id } = await params

    return (
        <div className="container mx-auto px-4">
            <InscripcionEditWrapper id={id} />
        </div>
    )
}
