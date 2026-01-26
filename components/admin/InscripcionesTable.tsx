'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Eye,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Trash2,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    getInscripcionesAdmin,
    updateInscripcionStatus,
    getInscripcionDetalle,
    eliminarInscripcion
} from '@/lib/actions/admin.actions';
function DeleteConfirmDialog({ isOpen, onClose, onConfirm, alumnoName, hasPayments }: any) {
    const [deletePayments, setDeletePayments] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-primary-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-display text-center text-primary-900 mb-2">Eliminar Inscripción</h3>
                <p className="text-primary-500 text-center mb-8">
                    ¿Estás seguro que deseas eliminar la inscripción de <strong className="text-primary-900">{alumnoName}</strong>? Esta acción no se puede deshacer.
                </p>

                {hasPayments && (
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 mb-8 space-y-3">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="deletePayments"
                                checked={deletePayments}
                                onCheckedChange={(checked) => setDeletePayments(!!checked)}
                                className="mt-1 border-rose-300 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                            />
                            <div className="space-y-1">
                                <label htmlFor="deletePayments" className="text-sm font-bold text-rose-900 leading-none">
                                    Eliminar pagos asociados
                                </label>
                                <p className="text-xs text-rose-600 font-medium">
                                    Si no marcas esta opción, los registros de cobros se conservarán en el historial de tesorería.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 mt-4">
                    <Button variant="ghost" className="flex-1 py-6 rounded-xl text-primary-400" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        className="flex-1 py-6 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-200"
                        onClick={() => onConfirm(deletePayments)}
                    >
                        Eliminar Ahora
                    </Button>
                </div>
            </div>
        </div>
    );
}
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
    const [isRejectMode, setIsRejectMode] = useState(false);

    // Deletion state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [inscripcionToDelete, setInscripcionToDelete] = useState<any>(null);

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

    const handleOpenDetail = async (id: string, reject: boolean = false) => {
        setIsDetailLoading(true);
        setIsRejectMode(reject);
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

    const handleDelete = async (deletePayments: boolean) => {
        if (!inscripcionToDelete) return;
        const result = await eliminarInscripcion(inscripcionToDelete.id, deletePayments);
        if (result.success) {
            setIsDeleteDialogOpen(false);
            setInscripcionToDelete(null);
            fetchData();
        } else {
            alert('Error al eliminar: ' + result.error);
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
                                            {format(new Date(item.created_at), 'dd/MM/yyyy', { locale: es })}
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
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => handleOpenDetail(item.id)}
                                                    className="flex flex-col items-center justify-center h-16 w-14 rounded-xl hover:bg-primary-50 text-primary-400 hover:text-primary-600 transition-all gap-1 cursor-pointer"
                                                    disabled={isDetailLoading}
                                                >
                                                    <Eye className="w-4 h-4 shadow-sm" />
                                                    <span className="text-[9px] font-black uppercase tracking-tighter">Detalle</span>
                                                </button>

                                                <div className="flex bg-primary-50/50 p-1 rounded-2xl gap-0.5">
                                                    <button
                                                        onClick={() => onUpdateStatus(item.id, 'aprobada')}
                                                        className="flex flex-col items-center justify-center h-14 w-14 rounded-xl hover:bg-white text-emerald-500 hover:shadow-sm transition-all gap-1 disabled:opacity-30 cursor-pointer"
                                                        disabled={item.estado === 'aprobada'}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span className="text-[9px] font-black uppercase tracking-tighter">Aprobar</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenDetail(item.id, true)}
                                                        className="flex flex-col items-center justify-center h-14 w-14 rounded-xl hover:bg-white text-rose-500 hover:shadow-sm transition-all gap-1 disabled:opacity-30 cursor-pointer"
                                                        disabled={item.estado === 'rechazada'}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        <span className="text-[9px] font-black uppercase tracking-tighter">Rechazar</span>
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setInscripcionToDelete(item);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                    className="flex flex-col items-center justify-center h-16 w-14 rounded-xl hover:bg-rose-50 text-rose-300 hover:text-rose-600 transition-all gap-1 cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="text-[9px] font-black uppercase tracking-tighter">Borrar</span>
                                                </button>
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
                initialRejectMode={isRejectMode}
            />

            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setInscripcionToDelete(null);
                }}
                onConfirm={handleDelete}
                alumnoName={inscripcionToDelete ? `${inscripcionToDelete.alumno?.apellido}, ${inscripcionToDelete.alumno?.nombre}` : ''}
                hasPayments={true} // Por seguridad siempre consultamos si corresponde segun logica
            />
        </div>
    );
}
