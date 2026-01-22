'use client';

import { forwardRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
    alumno: {
        nombre: string;
        apellido: string;
        dni: string;
    };
    curso: string;
    pago: {
        concepto: string;
        monto: number;
        fecha: string;
        observaciones: string;
    };
}

const ComprobantePago = forwardRef<HTMLDivElement, Props>(({ alumno, curso, pago }, ref) => {
    // Reemplazar "Matrícula" por "Aporte Inscripción" como pidió el usuario
    const conceptoLabel = pago.concepto.toLowerCase().includes('matrícula') || pago.concepto.toLowerCase().includes('matricula')
        ? 'Aporte Inscripción'
        : pago.concepto;

    const safeFormat = (dateStr: string | null | undefined, formatStr: string, options?: any) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'N/A';
        return format(date, formatStr, options);
    };

    return (
        <div ref={ref} className="p-10 bg-white text-black font-sans max-w-[800px] mx-auto border-2 border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-primary-900 pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-tight">Comprobante de Pago</h1>
                    <p className="text-sm text-gray-500">Sistema de Inscripciones Online</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold uppercase text-gray-400">Fecha de Emisión</p>
                    <p className="font-semibold">{safeFormat(pago.fecha, "PPP", { locale: es })}</p>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-8">
                {/* Alumno Info */}
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Apellido y Nombre del Alumno</label>
                        <p className="text-lg font-bold uppercase border-b border-gray-100 pb-1">{alumno.apellido}, {alumno.nombre}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">DNI</label>
                        <p className="text-lg font-bold border-b border-gray-100 pb-1">{alumno.dni}</p>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Curso / División</label>
                    <p className="text-lg font-bold uppercase border-b border-gray-100 pb-1">{curso || 'SIN ASIGNAR'}</p>
                </div>

                {/* Concepto e Importe */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500 font-medium tracking-tight uppercase">Concepto</span>
                        <span className="text-gray-500 font-medium tracking-tight uppercase">Importe</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                        <span className="text-xl font-bold uppercase">{conceptoLabel}</span>
                        <span className="text-3xl font-black font-mono">${pago.monto.toLocaleString('es-AR')}</span>
                    </div>
                </div>

                {/* Observaciones */}
                <div className="space-y-2 pt-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Observaciones</label>
                    <div className="min-h-[80px] p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-600 italic">
                        {pago.observaciones || 'Sin observaciones adicionales.'}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 flex justify-between items-end border-t border-gray-100 pt-8">
                <div className="text-[10px] text-gray-400 max-w-[300px]">
                    <p>Este documento es un comprobante de pago válido para trámites internos institucionales.</p>
                </div>
                <div className="text-center w-[200px]">
                    <div className="border-t border-gray-900 pt-2 text-[10px] font-bold uppercase">
                        Firma y Sello Responsable
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-section, #print-section * {
                        visibility: visible;
                    }
                    #print-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
});

ComprobantePago.displayName = 'ComprobantePago';

export default ComprobantePago;
