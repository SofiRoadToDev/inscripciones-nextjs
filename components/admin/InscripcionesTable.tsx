'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Eye,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    getInscripcionesAdmin,
    updateInscripcionStatus,
    getInscripcionDetalle
} from '@/lib/actions/admin.actions';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import InscripcionDetalleModal from './InscripcionDetalleModal';

const STATUS_COLORS: Record<string, string> = {
    pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
    aprobada: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rechazada: 'bg-rose-100 text-rose-700 border-rose-200',
};

export default function InscripcionesTable() {
    const [data, setData] = useState<any[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [estado, setEstado] = useState('todos');
    const [page, setPage] = useState(1);

    // Modal State
    const [selectedInscripcion, setSelectedInscripcion] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const result = await getInscripcionesAdmin({ search, estado, page });
        if (result.data) {
            setData(result.data);
            setCount(result.count || 0);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [search, estado, page]);

    const handleOpenDetail = async (id: string) => {
        setIsDetailLoading(true);
        const result = await getInscripcionDetalle(id);
        if (result.data) {
            setSelectedInscripcion(result.data);
            setIsModalOpen(true);
        }
        setIsDetailLoading(false);
    };

    const onUpdateStatus = async (id: string, newStatus: 'aprobada' | 'rechazada', reason?: string) => {
        const result = await updateInscripcionStatus(id, newStatus, reason);
        if (result.success) {
            await fetchData();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 w-4 h-4" />
                    <Input
                        placeholder="Buscar por DNI, Nombre o Apellido..."
                        className="pl-10 border-primary-100 focus-visible:ring-primary-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <select
                        className="bg-white border border-primary-100 rounded-lg px-4 py-2 text-sm text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="aprobada">Aprobadas</option>
                        <option value="rechazada">Rechazadas</option>
                    </select>
                    <Button variant="outline" className="gap-2 border-primary-100">
                        <Filter className="w-4 h-4" />
                        Más Filtros
                    </Button>
                </div>
            </div>

            <div className="bg-white border border-primary-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-primary-50/50 border-b border-primary-100">
                                <th className="px-6 py-4 text-xs font-bold text-accent-600 uppercase tracking-wider">Alumno</th>
                                <th className="px-6 py-4 text-xs font-bold text-accent-600 uppercase tracking-wider">DNI</th>
                                <th className="px-6 py-4 text-xs font-bold text-accent-600 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-xs font-bold text-accent-600 uppercase tracking-wider">Curso / Nivel</th>
                                <th className="px-6 py-4 text-xs font-bold text-accent-600 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-accent-600 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8">
                                            <div className="h-4 bg-primary-50 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-primary-500">
                                        No se encontraron inscripciones.
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-primary-50/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="font-semibold text-primary-900 uppercase">
                                                {item.alumno?.apellido}, {item.alumno?.nombre}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-primary-600 font-medium">
                                            {item.alumno?.dni}
                                        </td>
                                        <td className="px-6 py-5 text-primary-500 text-sm">
                                            {format(new Date(item.created_at), 'dd MMM, yyyy', { locale: es })}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-primary-900">{item.curso?.nombre || 'S/A'}</span>
                                                <span className="text-[10px] text-accent-600 uppercase font-bold">{item.nivel_codigo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Badge className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase", STATUS_COLORS[item.estado as keyof typeof STATUS_COLORS])}>
                                                {item.estado}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-primary-400 hover:text-primary-600"
                                                    onClick={() => handleOpenDetail(item.id)}
                                                    disabled={isDetailLoading}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <div className="flex border border-primary-100 rounded-lg p-0.5">
                                                    <button
                                                        onClick={() => onUpdateStatus(item.id, 'aprobada')}
                                                        className="p-1 hover:bg-emerald-50 text-emerald-500 rounded disabled:opacity-50"
                                                        disabled={item.estado === 'aprobada'}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenDetail(item.id)}
                                                        className="p-1 hover:bg-rose-50 text-rose-500 rounded disabled:opacity-50"
                                                        disabled={item.estado === 'rechazada'}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 bg-white border-t border-primary-50 flex items-center justify-between">
                    <p className="text-sm text-primary-500 font-medium">
                        Mostrando <span className="text-primary-900">{data.length}</span> de <span className="text-primary-900">{count}</span> inscripciones
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline" size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="border-primary-100"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline" size="sm"
                            disabled={page * 10 >= count}
                            onClick={() => setPage(p => p + 1)}
                            className="border-primary-100"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <InscripcionDetalleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedInscripcion}
                onUpdateStatus={onUpdateStatus}
            />
        </div>
    );
}
