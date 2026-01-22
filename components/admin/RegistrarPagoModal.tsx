'use client';

import { useState } from 'react';
import { X, CreditCard, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registrarPago } from '@/lib/actions/admin.actions';

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
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !inscripcion) return null;

    const handleConceptoChange = (id: string) => {
        setSelectedConcepto(id);
        const concepto = conceptos.find(c => c.id === id);
        if (concepto) {
            setMonto(concepto.monto.toString());
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedConcepto || !monto) return;

        setIsSubmitting(true);
        const result = await registrarPago({
            inscripcionId: inscripcion.id,
            conceptoId: selectedConcepto,
            monto: parseFloat(monto),
            fechaPago: new Date(fecha).toISOString()
        });

        if (result.success) {
            onSuccess();
            onClose();
        } else {
            alert('Error al registrar pago: ' + result.error);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-primary-50 flex justify-between items-center">
                    <h3 className="text-xl font-display text-primary-900">Registrar Pago</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-primary-400 uppercase">Alumno</label>
                        <p className="font-semibold text-primary-900 uppercase">
                            {inscripcion.alumno.apellido}, {inscripcion.alumno.nombre}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-primary-400 uppercase">Concepto</label>
                        <select
                            className="w-full bg-primary-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500"
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
                            <label className="text-[10px] font-bold text-primary-400 uppercase">Monto ($)</label>
                            <Input
                                type="number"
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                                className="bg-primary-50 border-none rounded-xl"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-primary-400 uppercase">Fecha</label>
                            <Input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                className="bg-primary-50 border-none rounded-xl"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-6 bg-primary-900 hover:bg-primary-800 text-white rounded-xl mt-4"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirmar Pago'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
