'use client';

import { useState, useRef } from 'react';
import { X, CreditCard, Calendar, Loader2, Printer, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    const [selectedConcepto, setSelectedConcepto] = useState<string>('');
    const [monto, setMonto] = useState<string>('');
    const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
    const [observaciones, setObservaciones] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ultimoPago, setUltimoPago] = useState<any>(null);

    const printRef = useRef<HTMLDivElement>(null);

    if (!isOpen || !inscripcion) return null;

    const handleConceptoChange = (id: string) => {
        setSelectedConcepto(id);
        const concepto = conceptos.find(c => c.id === id);
        if (concepto) {
            setMonto(concepto.monto.toString());
        }
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
        if (!selectedConcepto || !monto) return;

        setIsSubmitting(true);
        const result = await registrarPago({
            inscripcionId: inscripcion.id,
            conceptoId: selectedConcepto,
            monto: parseFloat(monto),
            fechaPago: new Date(fecha).toISOString(),
            observaciones
        });

        if (result.success) {
            const concepto = conceptos.find(c => c.id === selectedConcepto);
            setUltimoPago({
                concepto: concepto?.nombre || '',
                monto: parseFloat(monto),
                fecha: new Date(fecha).toISOString(),
                observaciones
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
                            <p className="text-primary-500 mt-2">El cobro de <strong>{ultimoPago.concepto}</strong> por <strong>${ultimoPago.monto}</strong> se procesó correctamente.</p>
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
                                    alumno={inscripcion.alumno}
                                    curso={inscripcion.curso?.nombre}
                                    pago={ultimoPago}
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
                                <label className="text-[10px] font-black uppercase text-primary-300 ml-1">Concepto de Pago</label>
                                <select
                                    className="w-full bg-primary-50 border-none rounded-2xl px-5 py-4 text-sm font-semibold text-primary-900 focus:ring-2 focus:ring-primary-500 appearance-none shadow-inner"
                                    value={selectedConcepto}
                                    onChange={(e) => handleConceptoChange(e.target.value)}
                                    required
                                >
                                    <option value="">Seleccionar concepto...</option>
                                    {conceptos.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-primary-300 ml-1">Monto ($)</label>
                                    <Input
                                        type="number"
                                        value={monto}
                                        onChange={(e) => setMonto(e.target.value)}
                                        className="bg-primary-50 border-none rounded-2xl h-14 pl-6 text-lg font-display font-bold shadow-inner"
                                        required
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
