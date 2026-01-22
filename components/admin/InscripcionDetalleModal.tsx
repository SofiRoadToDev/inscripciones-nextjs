'use client';

import { useState } from 'react';
import {
    X,
    MapPin,
    Phone,
    HeartPulse,
    ShieldCheck,
    UserCircle2,
    BookOpen,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: any | null;
    onUpdateStatus: (id: string, state: 'aprobada' | 'rechazada', reason?: string) => Promise<void>;
}

export default function InscripcionDetalleModal({ isOpen, onClose, data, onUpdateStatus }: Props) {
    const [showRejectReason, setShowRejectReason] = useState(false);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !data) return null;

    const handleApprove = async () => {
        setIsSubmitting(true);
        await onUpdateStatus(data.id, 'aprobada');
        setIsSubmitting(false);
        onClose();
    };

    const handleReject = async () => {
        if (!showRejectReason) {
            setShowRejectReason(true);
            return;
        }
        if (!reason.trim()) return;
        setIsSubmitting(true);
        await onUpdateStatus(data.id, 'rechazada', reason);
        setIsSubmitting(false);
        setShowRejectReason(false);
        setReason('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="relative w-full max-w-2xl bg-neutral-50 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                {/* Header */}
                <div className="bg-white border-b border-primary-100 p-6 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-2xl font-display text-primary-900">Detalle de Inscripción</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-primary-500 font-medium tracking-tight">Expediente ID: {data.id.slice(0, 8)}</span>
                            <Badge className={cn("px-2 py-0 rounded-full text-[9px] font-black uppercase tracking-tighter",
                                data.estado === 'pendiente' ? 'bg-amber-100 text-amber-600' :
                                    data.estado === 'aprobada' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                            )}>
                                {data.estado}
                            </Badge>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-primary-50">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                    {/* Alumno Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-accent-600 font-bold uppercase tracking-widest text-sm border-b border-primary-100 pb-2">
                            <UserCircle2 className="w-4 h-4" />
                            Datos del Alumno
                        </div>
                        <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-primary-50 shadow-sm">
                            <div className="space-y-1">
                                <p className="text-[10px] text-primary-400 uppercase font-black">Apellido y Nombre</p>
                                <p className="font-semibold text-primary-900 uppercase">{data.alumno.apellido}, {data.alumno.nombre}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-primary-400 uppercase font-black">DNI / Pasaporte</p>
                                <p className="font-semibold text-primary-900">{data.alumno.dni}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-primary-400 uppercase font-black">Género</p>
                                <p className="text-primary-700 capitalize">{data.alumno.genero}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-primary-400 uppercase font-black">Fecha de Nacimiento</p>
                                <p className="text-primary-700">{format(new Date(data.alumno.fecha_nacimiento), 'dd/MM/yyyy', { locale: es })}</p>
                            </div>
                        </div>
                    </section>

                    {/* Académico Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-accent-600 font-bold uppercase tracking-widest text-sm border-b border-primary-100 pb-2">
                            <BookOpen className="w-4 h-4" />
                            Escolaridad
                        </div>
                        <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-primary-50 shadow-sm">
                            <div className="space-y-1">
                                <p className="text-[10px] text-primary-400 uppercase font-black">Nivel y Curso</p>
                                <p className="font-semibold text-primary-900">{data.nivel_codigo} - {data.curso?.nombre || 'Pendiente'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-primary-400 uppercase font-black">¿Repitente?</p>
                                <Badge variant={data.repite ? "destructive" : "outline"} className="text-[9px] uppercase font-bold">
                                    {data.repite ? 'SÍ' : 'NO'}
                                </Badge>
                            </div>
                        </div>
                    </section>

                    {/* Domicilio Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-accent-600 font-bold uppercase tracking-widest text-sm border-b border-primary-100 pb-2">
                            <MapPin className="w-4 h-4" />
                            Ubicación
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-primary-50 shadow-sm">
                            <p className="font-semibold text-primary-900">
                                {data.domicilio.calle} {data.domicilio.numero}
                                {data.domicilio.piso_depto && ` - ${data.domicilio.piso_depto}`}
                            </p>
                            <p className="text-primary-600 text-sm">
                                {data.domicilio.localidad?.nombre}, {data.domicilio.provincia?.nombre}
                            </p>
                        </div>
                    </section>

                    {/* Tutores Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-accent-600 font-bold uppercase tracking-widest text-sm border-b border-primary-100 pb-2">
                            <ShieldCheck className="w-4 h-4" />
                            Tutores
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {data.inscripciones_tutores?.map((rel: any, idx: number) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl border border-primary-50 shadow-sm relative overflow-hidden group">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-100 group-hover:bg-primary-500 transition-colors" />
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-primary-900 uppercase">{rel.tutor.apellido}, {rel.tutor.nombre}</p>
                                            <p className="text-[10px] text-accent-600 font-bold uppercase tracking-wider">{rel.vinculo}</p>
                                        </div>
                                        <Badge variant="secondary" className="text-[10px]">DNI {rel.tutor.dni}</Badge>
                                    </div>
                                    <div className="mt-4 flex items-center gap-3 text-sm text-primary-500">
                                        <Phone className="w-3 h-3" /> {rel.tutor.telefono}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Salud Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-accent-600 font-bold uppercase tracking-widest text-sm border-b border-primary-100 pb-2">
                            <HeartPulse className="w-4 h-4" />
                            Ficha Médica
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-primary-50 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-primary-600">Calendario de Vacunación Completo</p>
                                <Badge variant={data.ficha_salud.vacunacion_completa ? "outline" : "destructive"}>
                                    {data.ficha_salud.vacunacion_completa ? 'SÍ' : 'NO'}
                                </Badge>
                            </div>
                            {data.ficha_salud.alergias && (
                                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                                    <p className="text-[10px] text-red-500 font-black uppercase mb-1">Alergias Detectadas</p>
                                    <p className="text-sm text-red-800 font-medium">{data.ficha_salud.alergias}</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white border-t border-primary-100 p-6 space-y-4 shrink-0 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
                    {showRejectReason && (
                        <div className="animate-in slide-in-from-bottom-2 duration-300">
                            <p className="text-xs font-bold text-primary-900 uppercase mb-2">Motivo del Rechazo</p>
                            <Input
                                placeholder="Ej: Documentación incompleta, Falta vacante..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="border-rose-100 focus-visible:ring-rose-500"
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button
                            variant="ghost"
                            className={cn(
                                "flex-1 py-7 rounded-xl transition-all duration-300",
                                showRejectReason ? "bg-rose-600 text-white hover:bg-rose-700" : "text-rose-600 hover:bg-rose-50"
                            )}
                            onClick={handleReject}
                            disabled={isSubmitting || (showRejectReason && !reason.trim())}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : showRejectReason ? 'Confirmar Rechazo' : 'Rechazar'}
                        </Button>

                        {!showRejectReason && (
                            <Button
                                className="flex-1 py-7 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200 transition-all duration-300"
                                onClick={handleApprove}
                                disabled={isSubmitting || data.estado === 'aprobada'}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Aprobar Solicitud'}
                            </Button>
                        )}

                        {showRejectReason && (
                            <Button
                                variant="ghost"
                                className="px-6 py-7 text-primary-400"
                                onClick={() => {
                                    setShowRejectReason(false);
                                    setReason('');
                                }}
                            >
                                Cancelar
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
