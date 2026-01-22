import { getAlumnosPreceptorAction } from '@/lib/actions/preceptor.actions';
import { PreceptorAlumnosTable } from '@/components/preceptor/PreceptorAlumnosTable';
import { ShieldAlert } from 'lucide-react';

export default async function PreceptorAlumnosPage() {
    const result = await getAlumnosPreceptorAction();

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

    const { data: alumnos, misCursos } = result;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-primary-900 tracking-tight">Gestión de Alumnos</h1>
                <p className="text-primary-500 mt-1">Administra los alumnos inscriptos en tus cursos asignados.</p>
            </div>

            <PreceptorAlumnosTable alumnos={alumnos || []} cursos={misCursos || []} />
        </div>
    );
}
