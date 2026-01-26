import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import InscripcionesTable from '@/components/admin/InscripcionesTable';
import { Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { CicloLectivoSelector } from '@/components/preceptor/CicloLectivoSelector';

export default async function AdminDashboard(props: { searchParams: Promise<{ ciclo?: string }> }) {
    const searchParams = await props.searchParams;
    const defaultYear = new Date().getFullYear().toString();
    const ciclo = searchParams.ciclo || defaultYear;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/admin/login');
    }

    // Fetch quick stats filtered by cycle
    const { count: total } = await supabase.from('inscripciones').select('*', { count: 'exact', head: true }).eq('ciclo_lectivo', ciclo);
    const { count: pendientes } = await supabase.from('inscripciones').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente').eq('ciclo_lectivo', ciclo);
    const { count: aprobadas } = await supabase.from('inscripciones').select('*', { count: 'exact', head: true }).eq('estado', 'aprobada').eq('ciclo_lectivo', ciclo);

    const stats = [
        { name: 'Total Solicitudes', value: total || 0, icon: Users, color: 'text-primary-600', bg: 'bg-primary-50' },
        { name: 'Pendientes', value: pendientes || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { name: 'Aprobadas', value: aprobadas || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-display font-display text-primary-900 text-4xl leading-tight">Gestión de Inscripciones</h1>
                    <p className="text-primary-600">Supervise y gestione las solicitudes de ingreso al ciclo lectivo.</p>
                </div>
                <CicloLectivoSelector defaultValue={defaultYear} />
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="p-6 bg-white border border-primary-100 rounded-2xl shadow-sm flex items-center gap-5">
                        <div className={`${stat.bg} ${stat.color} p-4 rounded-xl`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-primary-500 uppercase tracking-wider">{stat.name}</p>
                            <p className="text-3xl font-bold text-primary-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Table Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-heading font-display text-primary-800">Listado Maestro</h2>
                    <div className="text-sm text-accent-600 font-bold uppercase tracking-widest bg-accent-50 px-3 py-1 rounded-full">
                        Solicitudes Recientes
                    </div>
                </div>
                <InscripcionesTable />
            </div>
        </div>
    );
}
