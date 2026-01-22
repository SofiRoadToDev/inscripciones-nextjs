import { getPreceptoresAction } from '@/lib/actions/preceptor.actions';
import { getCursos } from '@/lib/actions/admin.actions';
import { PreceptoresTable } from '@/components/admin/PreceptoresTable';
import { redirect } from 'next/navigation';

export default async function PreceptoresPage() {
    const [preceptoresResult, cursosResult] = await Promise.all([
        getPreceptoresAction(),
        getCursos(),
    ]);

    if (preceptoresResult.error || cursosResult.error) {
        return (
            <div className="container mx-auto py-8">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <h2 className="text-lg font-bold">Error al cargar la página</h2>
                    <p>Precedores: {JSON.stringify(preceptoresResult.error)}</p>
                    <p>Cursos: {JSON.stringify(cursosResult.error)}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <PreceptoresTable
                preceptores={preceptoresResult.data || []}
                cursos={cursosResult.data || []}
            />
        </div>
    );
}
