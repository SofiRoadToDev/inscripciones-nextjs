'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, CreditCard, CheckCircle2, XCircle, ChevronLeft, ChevronRight, FileText, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getPagosAdmin, getConceptosPago } from '@/lib/actions/admin.actions';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import RegistrarPagoModal from './RegistrarPagoModal';
import { useRef } from 'react';
import FichaInscripcion from './FichaInscripcion';
import ComprobantePago from './ComprobantePago';

import { useSearchParams } from 'next/navigation';

export default function PagosTable() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<any[]>([]);
    const [conceptos, setConceptos] = useState<any[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [nivel, setNivel] = useState('todos');
    const [page, setPage] = useState(1);
    const ciclo = searchParams.get('ciclo') || new Date().getFullYear().toString();

    // Modal State
    const [selectedInscripcion, setSelectedInscripcion] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Refs for printing
    const fichaRef = useRef<HTMLDivElement>(null);
    const reciboRef = useRef<HTMLDivElement>(null);
    const [printData, setPrintData] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        const [pagosRes, conceptosRes] = await Promise.all([
            getPagosAdmin({ search, nivel, page, ciclo }),
            getConceptosPago()
        ]);

        if (pagosRes.data) {
            setData(pagosRes.data);
            setCount(pagosRes.count || 0);
        }
        if (conceptosRes.data) setConceptos(conceptosRes.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [search, nivel, page, ciclo]);

    const handlePrint = (type: 'ficha' | 'recibo', item: any) => {
        setPrintData(item);

        // Timeout to ensure state update and ref availability
        setTimeout(() => {
            const ref = type === 'ficha' ? fichaRef : reciboRef;
            const printContent = ref.current;
            if (!printContent) return;

            const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900');
            if (!windowPrint) return;

            windowPrint.document.write('<html><head><title>Imprimir</title>');
            windowPrint.document.write('<script src="https://cdn.tailwindcss.com"></script>');
            windowPrint.document.write('</head><body>');
            windowPrint.document.write(printContent.innerHTML);
            windowPrint.document.write('</body></html>');
            windowPrint.document.close();

            setTimeout(() => {
                windowPrint.focus();
                windowPrint.print();
                windowPrint.close();
            }, 500);
        }, 100);
    };

    const getPaymentStatus = (inscripcion: any, tipo: 'matricula' | 'seguro') => {
        const pagosHead = inscripcion.pagos || [];
        // Extract all details from all payments
        const allDetails = pagosHead.flatMap((p: any) => p.detalles || []);

        if (tipo === 'matricula') {
            const d = allDetails.find((d: any) =>
                d.concepto.nombre.toLowerCase().includes('matrícula') ||
                d.concepto.nombre.toLowerCase().includes('matricula')
            );
            return d ? { pagado: true, monto: d.monto, nombre: d.concepto.nombre } : null;
        } else {
            const d = allDetails.find((d: any) => d.concepto.nombre.toLowerCase().includes('seguro'));
            return d ? { pagado: true, monto: d.monto, nombre: d.concepto.nombre } : null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 w-4 h-4" />
                    <Input
                        placeholder="Buscar por DNI, Nombre o Nº Recibo..."
                        className="pl-10 border-primary-100"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <select
                        className="bg-white border border-primary-100 rounded-lg px-4 py-2 text-sm"
                        value={nivel}
                        onChange={(e) => setNivel(e.target.value)}
                    >
                        <option value="todos">Todos los niveles</option>
                    </select>
                </div>
            </div>

            <div className="bg-white border border-primary-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-primary-50/50 border-b border-primary-100 text-[10px] font-black uppercase tracking-widest text-primary-400">
                                <th className="px-6 py-4">Alumno</th>
                                <th className="px-6 py-4">Curso</th>
                                <th className="px-6 py-4">Comprobante</th>
                                <th className="px-6 py-4">Matrícula</th>
                                <th className="px-6 py-4">Seguro</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-primary-50 rounded" /></td>
                                    </tr>
                                ))
                            ) : (
                                data.map((item) => {
                                    const matricula = getPaymentStatus(item, 'matricula');
                                    const seguro = getPaymentStatus(item, 'seguro');
                                    const tienePagos = (item.pagos && item.pagos.length > 0);

                                    return (
                                        <tr key={item.id} className="hover:bg-primary-50/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="font-semibold text-primary-900 uppercase">{item.alumno.apellido}, {item.alumno.nombre}</div>
                                                <div className="text-[10px] text-primary-400 font-bold tracking-tighter">DNI: {item.alumno.dni}</div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-primary-600">
                                                {item.curso?.nombre || 'S/A'}
                                            </td>
                                            <td className="px-6 py-5">
                                                {item.pagos?.map((p: any) => (
                                                    <div key={p.id} className="text-[10px] font-mono font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-100 mb-1 w-fit">
                                                        SI-{String(p.nro_recibo).padStart(8, '0')}
                                                    </div>
                                                ))}
                                            </td>
                                            <td className="px-6 py-5">
                                                {matricula?.pagado ? (
                                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] uppercase font-black">Pagado ${matricula.monto}</Badge>
                                                ) : (
                                                    <Badge className="bg-amber-50 text-amber-700 border-amber-100 text-[9px] uppercase font-black">Pendiente</Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                {seguro?.pagado ? (
                                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] uppercase font-black">Pagado</Badge>
                                                ) : (
                                                    <Badge className="bg-amber-50 text-amber-700 border-amber-100 text-[9px] uppercase font-black">Pendiente</Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-14 w-14 flex flex-col items-center justify-center text-primary-400 hover:text-primary-700 hover:bg-primary-100/50 gap-1 cursor-pointer"
                                                        onClick={() => handlePrint('ficha', item)}
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        <span className="text-[9px] uppercase font-bold">Ficha</span>
                                                    </Button>

                                                    {tienePagos && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-14 w-14 flex flex-col items-center justify-center text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 gap-1 cursor-pointer"
                                                            onClick={() => handlePrint('recibo', item)}
                                                        >
                                                            <Receipt className="w-4 h-4" />
                                                            <span className="text-[9px] uppercase font-bold">Recibo</span>
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-14 w-14 flex flex-col items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-100 gap-1 cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedInscripcion(item);
                                                            setIsModalOpen(true);
                                                        }}
                                                    >
                                                        <CreditCard className="w-4 h-4" />
                                                        <span className="text-[9px] uppercase font-bold">Cobrar</span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-white border-t border-primary-50 flex items-center justify-between">
                    <p className="text-sm text-primary-500 font-medium">
                        <span className="text-primary-900">{count}</span> alumnos registrados
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)} className="border-primary-100">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" disabled={page * 10 >= count} onClick={() => setPage(page + 1)} className="border-primary-100">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <RegistrarPagoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                inscripcion={selectedInscripcion}
                conceptos={conceptos}
                onSuccess={fetchData}
            />

            {/* Hidden printable components */}
            <div className="hidden">
                {printData && (
                    <>
                        <div ref={fichaRef}>
                            <FichaInscripcion data={printData} />
                        </div>
                        <div ref={reciboRef}>
                            {(() => {
                                // For simplicity in this table view, we print the LAST payment made
                                const lastPago = printData.pagos && printData.pagos.length > 0
                                    ? printData.pagos[0] // Since they are ordered by date in action
                                    : null;

                                if (!lastPago) return null;

                                return (
                                    <ComprobantePago
                                        id={lastPago.nro_recibo}
                                        alumno={printData.alumno}
                                        pago={{
                                            fecha: lastPago.fecha_pago || new Date().toISOString(),
                                            importe_total: lastPago.monto_total,
                                            conceptos: lastPago.detalles.map((d: any) => ({
                                                nombre: d.concepto.nombre,
                                                monto: d.monto,
                                                cantidad: 1
                                            }))
                                        }}
                                    />
                                );
                            })()}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
