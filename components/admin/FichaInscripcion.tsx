'use client';

import { forwardRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
    data: any;
}

const FichaInscripcion = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
    if (!data) return null;

    const { alumno, domicilio, inscripciones_tutores, ficha_salud, nivel_codigo, curso, repite, created_at } = data;

    const safeFormat = (dateStr: string | null | undefined, formatStr: string, options?: any) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'N/A';
        return format(date, formatStr, options);
    };

    return (
        <div ref={ref} className="p-12 bg-white text-black font-sans max-w-[800px] mx-auto border border-gray-100 print:p-8 print:border-0">
            {/* Header / Logo */}
            <div className="flex justify-between items-start border-b-2 border-primary-900 pb-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-primary-900">Ficha de Inscripción</h1>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Ciclo Lectivo 2024</p>
                </div>
                <div className="text-right">
                    <div className="bg-primary-900 text-white px-4 py-2 rounded-lg font-mono text-xs mb-1">
                        EXP #{(data.id || '').slice(0, 8).toUpperCase()}
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Fecha de Carga</p>
                    <p className="text-xs font-bold">{safeFormat(created_at, "PPP", { locale: es })}</p>
                </div>
            </div>

            <div className="space-y-10">
                {/* 1. DATOS DEL ALUMNO */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary-600 mb-4 bg-primary-50 px-3 py-1 inline-block rounded">
                        01. Datos del Alumno
                    </h2>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                        <div className="border-b-2 border-gray-100 flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Apellido y Nombre</span>
                            <span className="text-sm font-bold uppercase py-1">{alumno.apellido}, {alumno.nombre}</span>
                        </div>
                        <div className="border-b-2 border-gray-100 flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">DNI</span>
                            <span className="text-sm font-bold py-1">{alumno.dni}</span>
                        </div>
                        <div className="border-b-2 border-gray-100 flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Fecha de Nacimiento</span>
                            <span className="text-sm font-bold py-1">{safeFormat(alumno.fecha_nacimiento, "dd/MM/yyyy")}</span>
                        </div>
                        <div className="border-b-2 border-gray-100 flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Género</span>
                            <span className="text-sm font-bold py-1 capitalize">{alumno.genero}</span>
                        </div>
                    </div>
                </section>

                {/* 2. DATOS ACADÉMICOS */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary-600 mb-4 bg-primary-50 px-3 py-1 inline-block rounded">
                        02. Información Académica
                    </h2>
                    <div className="grid grid-cols-3 gap-8">
                        <div className="border-b-2 border-gray-100 flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Nivel</span>
                            <span className="text-sm font-bold uppercase py-1">{nivel_codigo}</span>
                        </div>
                        <div className="border-b-2 border-gray-100 flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Curso Asignado</span>
                            <span className="text-sm font-bold py-1">{curso?.nombre || 'PENDIENTE'}</span>
                        </div>
                        <div className="border-b-2 border-gray-100 flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Condición</span>
                            <span className="text-sm font-bold py-1">{repite ? 'REPITENTE' : 'INGRESANTE'}</span>
                        </div>
                    </div>
                </section>

                {/* 3. DOMICILIO */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary-600 mb-4 bg-primary-50 px-3 py-1 inline-block rounded">
                        03. Domicilio Actual
                    </h2>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-2 border-b-2 border-gray-100 flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Calle y Número</span>
                            <span className="text-sm font-bold py-1">{domicilio.calle} {domicilio.numero}</span>
                        </div>
                        <div className="border-b-2 border-gray-100 flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Piso/Depto</span>
                            <span className="text-sm font-bold py-1">{domicilio.piso_depto || '-'}</span>
                        </div>
                        <div className="border-b-2 border-gray-100 flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Localidad</span>
                            <span className="text-sm font-bold py-1">{domicilio.localidad?.nombre}</span>
                        </div>
                    </div>
                </section>

                {/* 4. TUTORES / RESPONSABLES */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary-600 mb-4 bg-primary-50 px-3 py-1 inline-block rounded">
                        04. Responsables Legales
                    </h2>
                    <div className="space-y-6">
                        {inscripciones_tutores?.map((rel: any, idx: number) => (
                            <div key={idx} className="grid grid-cols-4 gap-4 pb-4 border-b border-gray-50">
                                <div className="col-span-2 flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{rel.vinculo}</span>
                                    <span className="text-sm font-bold uppercase">{rel.tutor.apellido}, {rel.tutor.nombre}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">DNI</span>
                                    <span className="text-sm font-medium">{rel.tutor.dni}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Teléfono</span>
                                    <span className="text-sm font-medium">{rel.tutor.telefono}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. SALUD */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary-600 mb-4 bg-primary-50 px-3 py-1 inline-block rounded">
                        05. Información de Salud
                    </h2>
                    <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="text-sm font-medium">¿Posee Calendario de Vacunación Completo?</span>
                            <span className="text-xs font-black uppercase">{ficha_salud.vacunacion_completa ? 'SÍ' : 'NO'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">Alergias o Condiciones Médicas</span>
                            <p className="text-sm italic text-gray-600">
                                {ficha_salud.alergias || 'No se registran condiciones particulares.'}
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            <div className="mt-20 grid grid-cols-2 gap-20">
                <div className="border-t border-black pt-4 text-center">
                    <p className="text-[10px] font-black uppercase">Firma del Padre/Madre/Tutor</p>
                    <p className="text-[10px] text-gray-400">Aclaración y DNI</p>
                </div>
                <div className="border-t border-black pt-4 text-center">
                    <p className="text-[10px] font-black uppercase">Sello y Firma Institucional</p>
                    <p className="text-[10px] text-gray-400">Recepción de Secretaría</p>
                </div>
            </div>
        </div>
    );
});

FichaInscripcion.displayName = 'FichaInscripcion';

export default FichaInscripcion;
