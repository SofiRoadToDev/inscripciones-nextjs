'use client';

import { useState, useRef } from 'react';
import { X, CreditCard, Calendar, Loader2, Printer, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { registrarPago } from '@/lib/actions/admin.actions';
import ComprobantePago from './ComprobantePago';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    inscripcion: any;
    conceptos: any[];
    onSuccess: () => void;
}

export default function RegistrarPagoModal({ isOpen, onClose, inscripcion, conceptos, onSuccess }: Props) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [montoTotal, setMontoTotal] = useState<number>(0);
    const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
    const [observaciones, setObservaciones] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ultimoPago, setUltimoPago] = useState<any>(null);

    const printRef = useRef<HTMLDivElement>(null);

    if (!isOpen || !inscripcion) return null;

    const toggleConcepto = (id: string) => {
        if (!id) return;
        const newIds = selectedIds.includes(id)
            ? selectedIds.filter(i => i !== id)
            : [...selectedIds, id];

        setSelectedIds(newIds);

        // Auto-calculate total
        const total = newIds.reduce((acc, currentId) => {
            const c = conceptos.find(item => item.id === currentId);
            return acc + (c?.monto || 0);
        }, 0);
        setMontoTotal(total);
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
        if (!windowPrint) return;

        windowPrint.document.write('<html><head><title>Imprimir Comprobante</title>');
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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedIds.length === 0 || montoTotal <= 0) return;

        setIsSubmitting(true);
        const pagosData = selectedIds.map(id => ({
            conceptoId: id,
            monto: conceptos.find(c => c.id === id)?.monto || 0
        }));

        const result = await registrarPago({
            inscripcionId: inscripcion.id,
            pagos: pagosData,
            fechaPago: new Date(fecha).toISOString(),
            observaciones
        });

        if (result.success) {
            setUltimoPago({
                conceptos: selectedIds.map(id => ({
                    nombre: conceptos.find(c => c.id === id)?.nombre || '',
                    monto: conceptos.find(c => c.id === id)?.monto || 0,
                    cantidad: 1
                })),
                montoTotal: montoTotal,
                fecha: new Date(fecha).toISOString(),
                observaciones,
                nroRecibo: result.nroRecibo
            });
            onSuccess();
        } else {
            alert('Error al registrar pago: ' + result.error);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {ultimoPago ? (
                    <div className="p-10 space-y-8 text-center animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-display text-primary-900">¡Pago Registrado!</h3>
                            <p className="text-primary-500 mt-2">Se procesaron <strong>{ultimoPago.conceptos.length}</strong> conceptos por un total de <strong>${ultimoPago.montoTotal}</strong>.</p>
                        </div>

                        <div className="space-y-3 pt-4">
                            <Button
                                onClick={handlePrint}
                                className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95"
                            >
                                <Printer className="w-5 h-5" />
                                Imprimir Comprobante
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                className="w-full py-4 text-primary-400 font-bold hover:text-primary-600"
                            >
                                Cerrar Ventana
                            </Button>
                        </div>

                        {/* Hidden component for printing data collection */}
                        <div className="hidden">
                            <div ref={printRef} id="print-section">
                                <ComprobantePago
                                    id={ultimoPago.nroRecibo}
                                    alumno={inscripcion.alumno}
                                    pago={{
                                        fecha: ultimoPago.fecha,
                                        importe_total: ultimoPago.montoTotal,
                                        conceptos: ultimoPago.conceptos
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-8 border-b border-primary-50 flex justify-between items-center">
                            <h3 className="text-xl font-display text-primary-900">Registrar Pago</h3>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-primary-300 ml-1">Alumno</label>
                                <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-900 font-bold uppercase">
                                        {inscripcion.alumno.apellido[0]}{inscripcion.alumno.nombre[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-primary-900 uppercase">
                                            {inscripcion.alumno.apellido}, {inscripcion.alumno.nombre}
                                        </p>
                                        <p className="text-[10px] text-primary-400 font-mono">{inscripcion.alumno.dni}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-end ml-1 mb-1">
                                    <label className="text-[10px] font-black uppercase text-primary-300">Conceptos de Pago</label>
                                    <span className="text-[9px] font-bold text-accent-600 uppercase bg-accent-50 px-2 py-0.5 rounded-full">Selección Múltiple Habilitada</span>
                                </div>
                                <select
                                    className="w-full bg-primary-50 border-none rounded-2xl px-5 py-4 text-sm font-semibold text-primary-900 focus:ring-2 focus:ring-primary-500 appearance-none shadow-inner"
                                    value=""
                                    onChange={(e) => toggleConcepto(e.target.value)}
                                >
                                    <option value="">Añadir concepto...</option>
                                    {conceptos.filter(c => !selectedIds.includes(c.id)).map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre} (${c.monto})</option>
                                    ))}
                                </select>

                                {selectedIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3 p-1">
                                        {selectedIds.map(id => {
                                            const c = conceptos.find(item => item.id === id);
                                            return (
                                                <Badge
                                                    key={id}
                                                    variant="secondary"
                                                    className="bg-primary-100 text-primary-700 hover:bg-rose-100 hover:text-rose-700 cursor-pointer transition-colors px-3 py-1.5 rounded-xl border-none group"
                                                    onClick={() => toggleConcepto(id)}
                                                >
                                                    {c?.nombre} <span className="ml-1 opacity-50 group-hover:hidden">×</span>
                                                    <span className="hidden group-hover:inline ml-1">Quitar</span>
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-primary-300 ml-1">Monto Total ($)</label>
                                    <Input
                                        type="number"
                                        value={montoTotal}
                                        readOnly
                                        className="bg-primary-50 border-none rounded-2xl h-14 pl-6 text-lg font-display font-bold shadow-inner opacity-80 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-primary-300 ml-1">Fecha</label>
                                    <Input
                                        type="date"
                                        value={fecha}
                                        onChange={(e) => setFecha(e.target.value)}
                                        className="bg-primary-50 border-none rounded-2xl h-14 pl-6 shadow-inner"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-primary-300 ml-1">Observaciones / Notas</label>
                                <textarea
                                    className="w-full bg-primary-50 border-none rounded-2xl p-5 text-sm font-medium text-primary-900 focus:ring-2 focus:ring-primary-500 shadow-inner min-h-[100px]"
                                    placeholder="Ingrese anotaciones adicionales si es necesario..."
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-8 bg-primary-900 hover:bg-primary-800 text-white rounded-3xl mt-4 font-black uppercase tracking-widest gap-3 shadow-xl transition-all active:scale-95"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <><CreditCard className="w-5 h-5" /> Registrar Cobro</>}
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
