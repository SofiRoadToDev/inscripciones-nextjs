import { getPreceptorStats } from '@/lib/actions/preceptor.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShieldCheck, ShieldAlert, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CicloLectivoSelector } from '@/components/preceptor/CicloLectivoSelector';

export default async function PreceptorDashboardPage(props: { searchParams: Promise<{ ciclo?: string }> }) {
    const searchParams = await props.searchParams;
    const defaultYear = new Date().getFullYear().toString();
    const ciclo = searchParams.ciclo || defaultYear;
    const result = await getPreceptorStats(ciclo);

    if (result.error) {
        return (
            <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-red-800">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShieldAlert className="w-6 h-6" />
                    Error de Acceso
                </h2>
                <p className="mt-2 text-red-600">{result.error}</p>
            </div>
        );
    }

    const stats = result.data;

    if (!stats || stats.totalAlumnos === 0 && stats.cursosStats.length === 0) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900 tracking-tight">Dashboard del Preceptor</h1>
                        <p className="text-primary-500 mt-1">Resumen operativo de tus cursos asignados.</p>
                    </div>
                    <CicloLectivoSelector defaultValue={defaultYear} />
                </div>
                <Card className="border-primary-100 shadow-sm p-12 text-center">
                    <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-primary-400" />
                    </div>
                    <CardTitle className="text-xl text-primary-900">Sin cursos asignados</CardTitle>
                    <p className="text-primary-500 mt-2">No tienes cursos bajo tu responsabilidad actualmente.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary-900 tracking-tight">Dashboard del Preceptor</h1>
                    <p className="text-primary-500 mt-1">Resumen operativo de tus cursos asignados.</p>
                </div>
                <CicloLectivoSelector defaultValue={defaultYear} />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-primary-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-primary-600 uppercase tracking-wider">Total Alumnos</CardTitle>
                        <Users className="w-5 h-5 text-primary-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary-900">{stats.totalAlumnos}</div>
                        <p className="text-xs text-primary-400 mt-1">En todos tus cursos</p>
                    </CardContent>
                </Card>

                <Card className="border-primary-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-primary-600 uppercase tracking-wider">Seguro Pagado</CardTitle>
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary-900">{stats.alumnosConSeguro}</div>
                        <p className="text-xs text-green-600 mt-1 font-semibold">Cumplimiento del {stats.porcentajeSeguro}%</p>
                    </CardContent>
                </Card>

                <Card className="border-primary-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-primary-600 uppercase tracking-wider">Seguro Pendiente</CardTitle>
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary-900">{stats.alumnosSinSeguro}</div>
                        <p className="text-xs text-red-500 mt-1">Requiere atención</p>
                    </CardContent>
                </Card>

                <Card className="border-primary-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-primary-600 uppercase tracking-wider">Cursos Asignados</CardTitle>
                        <BarChart className="w-5 h-5 text-primary-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary-900">{stats.cursosStats.length}</div>
                        <p className="text-xs text-primary-400 mt-1">Cursos bajo gestión</p>
                    </CardContent>
                </Card>
            </div>

            {/* Courses Table */}
            <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden border-b-0">
                <div className="p-6 border-b border-primary-50 bg-neutral-50/50 flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-lg text-primary-900">Desglose por Curso</h2>
                        <p className="text-xs text-primary-500">Métricas detalladas de cada grado asignado.</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs uppercase tracking-wider text-primary-600 bg-primary-50/50">
                            <tr>
                                <th className="px-6 py-4 font-bold">Curso</th>
                                <th className="px-6 py-4 font-bold text-center">Total Alumnos</th>
                                <th className="px-6 py-4 font-bold text-center">Seguro Pagado</th>
                                <th className="px-6 py-4 font-bold text-right">% Seguro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary-50">
                            {stats.cursosStats.map((curso: any) => (
                                <tr key={curso.nombre} className="hover:bg-primary-50/30 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-primary-900">{curso.nombre}</td>
                                    <td className="px-6 py-4 text-center text-primary-600 font-medium">{curso.total}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold",
                                            curso.conSeguro === curso.total
                                                ? "bg-green-100 text-green-700"
                                                : curso.conSeguro > 0
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "bg-red-100 text-red-700"
                                        )}>
                                            {curso.conSeguro} / {curso.total}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <div className="w-24 bg-neutral-100 rounded-full h-2 hidden sm:block overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-500",
                                                        Math.round((curso.conSeguro / curso.total) * 100) === 100 ? "bg-green-500" : "bg-primary-500"
                                                    )}
                                                    style={{ width: `${Math.round((curso.conSeguro / curso.total) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-bold text-primary-900 min-w-[3rem]">
                                                {Math.round((curso.conSeguro / curso.total) * 100)}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
