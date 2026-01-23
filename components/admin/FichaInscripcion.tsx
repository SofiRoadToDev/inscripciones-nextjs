'use client';

import { forwardRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { InscripcionCompleta } from '@/lib/types/inscripciones';

interface Props {
    data: InscripcionCompleta;
}

const FichaInscripcion = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
    if (!data) return null;

    const {
        alumno,
        domicilio,
        inscripciones_tutores,
        ficha_salud,
        nivel_codigo,
        curso,
        repite,
        created_at,
        ciclo_lectivo
    } = data;

    const safeFormat = (dateStr: string | null | undefined, formatStr: string, options?: any) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'N/A';
        return format(date, formatStr, options);
    };

    return (
        <div ref={ref} className="bg-white text-black font-serif p-12 w-[800px] mx-auto min-h-[1100px] relative border border-gray-100 shadow-none print:shadow-none print:p-8">
            {/* Header / Logo Section */}
            <div className="flex justify-between items-start mb-10">
                <div className="flex gap-4">
                    {/* Recuadro para Foto */}
                    <div className="w-32 h-32 border-2 border-black flex items-center justify-center bg-gray-50">
                        <span className="text-xs font-bold text-gray-300 transform -rotate-45">FOTO 4x4</span>
                    </div>

                    <div className="flex flex-col justify-center gap-1">
                        <h1 className="text-xl font-black uppercase leading-tight font-sans">EET Nº 3107</h1>
                        <h2 className="text-sm font-bold uppercase text-gray-700 font-sans">Juana Azurduy de Padilla</h2>
                        <div className="mt-2 text-[10px] font-black tracking-widest bg-black text-white px-2 py-0.5 w-fit">
                            FICHA DE INSCRIPCIÓN {ciclo_lectivo}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <p className="text-sm font-bold">
                        Fecha: {safeFormat(new Date().toISOString(), "dd/MM/yyyy")}
                    </p>
                    <div className="relative w-16 h-16 mt-1">
                        <Image
                            src="/images/escudo.png"
                            alt="Escudo"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>

            {/* Alumno Information Section */}
            <div className="space-y-4 mb-8">
                <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold uppercase">Apellido y Nombre:</span>
                    <span className="flex-1 border-b border-black font-black uppercase text-base pb-0.5">{alumno.apellido}, {alumno.nombre}</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold uppercase">Documento:</span>
                    <span className="w-48 border-b border-black font-black text-base pb-0.5">{alumno.dni}</span>
                    <span className="text-sm font-bold uppercase ml-4">Fecha de nacimiento:</span>
                    <span className="flex-1 border-b border-black font-black text-base pb-0.5">{safeFormat(alumno.fecha_nacimiento, "dd/MM/yyyy")}</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold uppercase">Nivel de Inscripción:</span>
                    <span className="flex-1 border-b border-black font-black uppercase text-base pb-0.5">{nivel_codigo}</span>
                </div>
                {/* Lugar de Nacimiento Box (Dotted as per draft) */}
                <div className="border-2 border-gray-300 border-dashed p-3 mt-4">
                    <span className="text-xs font-bold text-gray-500 italic">
                        Lugar de nacimiento: (país, provincia, departamento, localidad)
                    </span>
                    <p className="font-black uppercase text-sm mt-1">
                        {alumno.nacionalidad || 'Argentina'}
                    </p>
                </div>
            </div>

            {/* Information Boxes */}
            <div className="space-y-6">
                {/* 1. TUTORES */}
                <div className="border-2 border-black p-4 relative pt-6">
                    <span className="absolute top-0 left-4 -translate-y-1/2 bg-white px-2 text-sm font-black tracking-widest uppercase">
                        TUTORES
                    </span>
                    <div className="space-y-4">
                        {inscripciones_tutores?.map((rel: any, idx: number) => (
                            <div key={idx} className={idx > 0 ? "pt-4 border-t border-gray-100" : ""}>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-xs font-bold uppercase underline decoration-1">{rel.vinculo}:</span>
                                    <span className="flex-1 border-b border-black font-black uppercase text-sm">{rel.tutor.apellido}, {rel.tutor.nombre}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-[10px] font-bold uppercase">Documento:</span>
                                        <span className="flex-1 border-b border-black font-black text-xs">{rel.tutor.dni}</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-[10px] font-bold uppercase">Teléfono:</span>
                                        <span className="flex-1 border-b border-black font-black text-xs">{rel.tutor.telefono}</span>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <span className="text-[10px] font-bold uppercase">Domicilio:</span>
                                    <span className="flex-1 border-b border-black font-black text-xs uppercase">
                                        {rel.tutor.domicilio?.calle} {rel.tutor.domicilio?.numero}, {rel.tutor.domicilio?.localidad?.nombre} ({rel.tutor.domicilio?.provincia?.nombre})
                                    </span>
                                </div>
                            </div>
                        ))}
                        {!inscripciones_tutores?.length && (
                            <div className="h-20 flex items-center justify-center border border-dashed border-gray-200 text-gray-300 italic text-xs">
                                Sin tutores registrados
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. FICHA DE SALUD */}
                <div className="border-2 border-black p-4 relative pt-6 min-h-[140px]">
                    <span className="absolute top-0 left-4 -translate-y-1/2 bg-white px-2 text-sm font-black tracking-widest uppercase">
                        FICHA DE SALUD
                    </span>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-xs">
                        <div className="flex items-center gap-2 border-b pb-1">
                            <span className="font-bold uppercase">Vacunación Completa:</span>
                            <span className="font-black">{ficha_salud.vacunacion_completa ? 'SÍ' : 'NO'}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="font-bold uppercase block mb-1">Alergias / Condiciones:</span>
                            <p className="italic border-b border-dotted border-black pb-1 min-h-[1rem]">
                                {ficha_salud.alergias || ficha_salud.enfermedad_cronica || 'Ninguna registrada.'}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <span className="font-bold uppercase block mb-1">Observaciones Salud:</span>
                            <p className="italic border-b border-dotted border-black pb-1 min-h-[1rem]">
                                {ficha_salud.observaciones || '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. INSCRIPCIÓN */}
                <div className="border-2 border-black p-4 relative pt-6">
                    <span className="absolute top-0 left-4 -translate-y-1/2 bg-white px-2 text-sm font-black tracking-widest uppercase">
                        INSCRIPCIÓN
                    </span>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-xs">
                        <div className="flex items-center gap-2 border-b pb-1">
                            <span className="font-bold uppercase">Curso Asignado:</span>
                            <span className="font-black">{curso?.nombre || 'S/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 border-b pb-1">
                            <span className="font-bold uppercase">Condición:</span>
                            <span className="font-black">{repite ? 'REPITENTE' : 'INGRESANTE'}</span>
                        </div>
                        <div className="flex items-center gap-2 border-b pb-1 col-span-2">
                            <span className="font-bold uppercase">Estado Documentación:</span>
                            <span className="font-black">COMPLETA</span>
                        </div>
                        {data.materias_pendientes && (
                            <div className="col-span-2">
                                <span className="font-bold uppercase block mb-1">Materias Previas:</span>
                                <p className="italic border-b border-dotted border-black pb-1 min-h-[1rem]">
                                    {data.materias_pendientes}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Signatures */}
            <div className="absolute bottom-16 left-12 right-12 flex justify-between items-end invisible print:visible">
                <div className="w-64 text-center">
                    <div className="border-t-2 border-black pt-2">
                        <p className="text-xs font-black uppercase tracking-tighter">FIRMA DEL TUTOR</p>
                        <p className="text-[10px] text-gray-400 font-bold">DNI:</p>
                    </div>
                </div>
                <div className="w-64 text-center">
                    <div className="border-t-2 border-black pt-2">
                        <p className="text-xs font-black uppercase tracking-tighter">FIRMA DEL ALUMNO</p>
                        <p className="text-[10px] text-gray-400 font-bold">Aclaración</p>
                    </div>
                </div>
            </div>

            {/* Disclaimer / Non-printable footer logic */}
            <div className="mt-auto pt-20 flex justify-between items-end print:hidden">
                <div className="w-64 text-center border-t border-gray-300 pt-2 opacity-30">
                    <p className="text-[10px] font-bold uppercase">Espacio para Firma del Tutor</p>
                </div>
                <div className="w-64 text-center border-t border-gray-300 pt-2 opacity-30">
                    <p className="text-[10px] font-bold uppercase">Espacio para Firma del Alumno</p>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: portrait;
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

FichaInscripcion.displayName = 'FichaInscripcion';

export default FichaInscripcion;
