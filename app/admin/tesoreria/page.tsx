import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import PagosTable from '@/components/admin/PagosTable';
import { CreditCard, Wallet, TrendingUp, Users, Calendar } from 'lucide-react';
import { CicloLectivoSelector } from '@/components/preceptor/CicloLectivoSelector';

export default async function TesoreriaPage(props: { searchParams: Promise<{ ciclo?: string }> }) {
    const searchParams = await props.searchParams;
    const defaultYear = new Date().getFullYear().toString();
    const ciclo = searchParams.ciclo || defaultYear;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Stats: Recaudación diaria (filtrada por ciclo de la inscripción)
    const { data: dailyStats } = await supabase
        .from('pagos')
        .select('monto_total, inscripciones!inner(ciclo_lectivo)')
        .eq('inscripciones.ciclo_lectivo', ciclo)
        .gte('created_at', today.toISOString());

    const totalRecaudadoHoy = (dailyStats as any[] | null)?.reduce((acc: number, curr: any) => acc + Number(curr.monto_total), 0) || 0;

    const { count: totalPagos } = await supabase
        .from('pagos')
        .select('*, inscripciones!inner(ciclo_lectivo)', { count: 'exact', head: true })
        .eq('inscripciones.ciclo_lectivo', ciclo);

    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-display text-primary-900 tracking-tight">Tesorería y Caja</h1>
                    <p className="text-primary-500 mt-2 font-medium">Gestión de cobros de matrículas y seguros escolares.</p>
                </div>
                <CicloLectivoSelector defaultValue={defaultYear} />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Wallet className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-primary-400 tracking-widest">Recaudación Hoy</p>
                        <p className="text-2xl font-display text-primary-900">${totalRecaudadoHoy.toLocaleString('es-AR')}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
                    <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                        <TrendingUp className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-primary-400 tracking-widest">Cobros Realizados</p>
                        <p className="text-2xl font-display text-primary-900">{totalPagos || 0}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
                    <div className="w-14 h-14 bg-accent-50 rounded-2xl flex items-center justify-center text-accent-600">
                        <CreditCard className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-primary-400 tracking-widest">Métodos de Cobro</p>
                        <p className="text-2xl font-display text-primary-900">Efectivo / Transf.</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-primary-50/30 p-1 rounded-[2.5rem] border border-primary-100">
                <div className="bg-white rounded-[2.25rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center text-white">
                            <Users className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-display text-primary-900">Estado de Pagos por Alumno</h3>
                    </div>
                    <PagosTable />
                </div>
            </div>
        </div>
    );
}
