import { forwardRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { numeroATexto } from '@/lib/utils/number-to-words';

interface Concepto {
    nombre: string;
    monto: number;
    cantidad?: number;
}

interface Props {
    id?: number | string;
    alumno: {
        nombre: string;
        apellido: string;
        dni: string;
    };
    pago: {
        fecha: string;
        importe_total: number;
        conceptos: Concepto[];
    };
}

const ComprobantePago = forwardRef<HTMLDivElement, Props>(({ id, alumno, pago }, ref) => {
    const safeFormat = (dateStr: string | null | undefined, formatStr: string, options?: any) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'N/A';
        return format(date, formatStr, options);
    };

    const normalizedId = id !== undefined && id !== null ? String(id) : '';
    const reciboId = normalizedId ? `SI-${normalizedId.padStart(8, '0')}` : 'SI-XXXXXXXX';

    return (
        <div ref={ref} className="bg-white text-black font-sans w-[800px] h-[500px] mx-auto border-2 border-black grid grid-cols-[200px_1fr] relative overflow-hidden shadow-none">
            {/* Sidebar con el color azul del diseño original */}
            <div className="bg-[#DBEAFE] p-6 flex flex-col items-center border-r-2 border-black">
                <div className="text-center mb-6 space-y-1">
                    <p className="font-bold text-sm tracking-tight">EET3107</p>
                    <p className="font-bold text-[10px] leading-tight uppercase">Juana Azurduy de Padilla</p>
                </div>

                <div className="relative w-28 h-28 mb-8">
                    <Image
                        src="/images/escudo.png"
                        alt="Escudo"
                        fill
                        className="object-contain"
                    />
                </div>

                <div className="text-center mt-10 space-y-2">
                    <p className="font-bold text-xs uppercase tracking-widest">Comprobante Nº</p>
                    <p className="font-mono text-xl font-black bg-white px-2 py-1 border border-black rounded shadow-sm">
                        {reciboId.split('-')[1]}
                    </p>
                    <p className="text-[10px] font-bold text-blue-800 opacity-60">SISTEMA SI</p>
                </div>
            </div>

            {/* Cuerpo principal con marca de agua */}
            <div className="p-8 flex flex-col relative bg-white">
                {/* Marca de agua (Watermark) con escala de grises al 10% */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none -z-0">
                    <div className="relative w-80 h-80 grayscale">
                        <Image
                            src="/images/escudo.png"
                            alt="Crest Watermark"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                <div className="relative z-10 flex flex-col h-full uppercase text-sm">
                    <h1 className="text-center text-xl font-black mb-10 tracking-tight border-b-2 border-black pb-4">
                        Comprobante de Aporte a Cooperadora Escolar
                    </h1>

                    <div className="text-right mb-8">
                        <p className="font-bold">
                            Salta, {safeFormat(pago.fecha, "d 'de' MMMM 'de' yyyy", { locale: es })}
                        </p>
                    </div>

                    <div className="space-y-6 mb-8">
                        <p className="flex items-baseline gap-2">
                            Recibí de <span className="font-black border-b border-dotted border-black flex-1 pb-0.5">{alumno.apellido}, {alumno.nombre}</span>
                        </p>
                        <p className="flex items-baseline gap-2">
                            DNI: <span className="font-black border-b border-dotted border-black w-32 pb-0.5">{alumno.dni}</span>
                        </p>
                        <p className="flex items-baseline gap-2 leading-relaxed">
                            la suma de <span className="font-black italic border-b border-dotted border-black flex-1 pb-0.5">{numeroATexto(pago.importe_total)} pesos</span>
                        </p>
                    </div>

                    <div className="mb-6 flex-1">
                        <p className="font-black mb-3 text-xs tracking-widest">En concepto de:</p>
                        <ul className="grid grid-cols-2 gap-x-8 gap-y-2 ml-4">
                            {pago.conceptos.map((c, i) => (
                                <li key={i} className="flex justify-between items-center border-b border-gray-100 pb-1">
                                    <span className="font-medium text-[12px]">• {c.nombre} {c.cantidad ? `(Cant: ${c.cantidad})` : ''}</span>
                                    {/*<span className="font-black tracking-tight">${c.monto.toLocaleString('es-AR')}</span>*/}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Fila inferior con el monto y la firma */}
                    <div className="flex justify-between items-end mt-auto pt-6 border-t-2 border-black">
                        <div className="bg-gray-50 border-2 border-black px-4 py-2 font-black italic">
                            <span className="text-xs mr-2">Son $</span>
                            <span className="text-2xl">{pago.importe_total.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="text-center w-64 pb-2">
                            <div className="border-t border-black pt-2">
                                <p className="text-[10px] font-black tracking-[0.2em]">Firma y Sello</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 0;
                    }
                    body {
                        background: white;
                    }
                }
            `}</style>
        </div>
    );
});

ComprobantePago.displayName = 'ComprobantePago';

export default ComprobantePago;

