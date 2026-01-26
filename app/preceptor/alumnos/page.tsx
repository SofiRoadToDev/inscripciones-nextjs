import { getAlumnosPreceptorAction } from '@/lib/actions/preceptor.actions';
import { PreceptorAlumnosTable } from '@/components/preceptor/PreceptorAlumnosTable';
import { ShieldAlert } from 'lucide-react';
import { CicloLectivoSelector } from '@/components/preceptor/CicloLectivoSelector';

export default async function PreceptorAlumnosPage(props: {
    searchParams: Promise<{
        ciclo?: string;
        search?: string;
        page?: string;
        cursoId?: string;
        seguro?: string;
        docRel?: string;
        salud?: string;
    }>
}) {
    const searchParams = await props.searchParams;
    const defaultYear = new Date().getFullYear().toString();
    const ciclo = searchParams.ciclo || defaultYear;

    const result = await getAlumnosPreceptorAction({
        ciclo,
        search: searchParams.search,
        page: Number(searchParams.page) || 1,
        cursoId: searchParams.cursoId,
        seguro: searchParams.seguro,
        docRel: searchParams.docRel,
        salud: searchParams.salud
    });

    if (result.error) {
        return (
            <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-red-800">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShieldAlert className="w-6 h-6" />
                    Error al cargar alumnos
                </h2>
                <p className="mt-2 text-red-600">{result.error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary-900 tracking-tight">Gestión de Alumnos</h1>
                    <p className="text-primary-500 mt-1">Administra los alumnos inscriptos en tus cursos asignados.</p>
                </div>
                <CicloLectivoSelector defaultValue={defaultYear} />
            </div>

            <PreceptorAlumnosTable
                alumnos={result.data || []}
                cursos={result.misCursos || []}
                total={result.total || 0}
                currentPage={result.page || 1}
                pageSize={result.pageSize || 15}
            />
        </div>
    );
}
