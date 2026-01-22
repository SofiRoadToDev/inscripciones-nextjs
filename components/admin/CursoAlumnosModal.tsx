'use client';

import { useState, useEffect } from 'react';
import { X, Search, Loader2, AlertCircle, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getAlumnosByCurso } from '@/lib/actions/admin.actions';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    curso: any;
}

export default function CursoAlumnosModal({ isOpen, onClose, curso }: Props) {
    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isOpen && curso) {
            loadAlumnos();
        }
    }, [isOpen, curso]);

    const loadAlumnos = async () => {
        setLoading(true);
        const res = await getAlumnosByCurso(curso.id);
        if (res.data) setAlumnos(res.data);
        setLoading(false);
    };

    const filteredAlumnos = alumnos.filter(a => {
        const matchSearch = (a.alumno.nombre + ' ' + a.alumno.apellido + ' ' + a.alumno.dni).toLowerCase().includes(search.toLowerCase());
        return matchSearch;
    });

    if (!isOpen || !curso) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-md animate-in fade-in" onClick={onClose} />

            <div className="relative w-full max-w-3xl h-full sm:h-[80vh] bg-white sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-primary-50 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-display text-primary-900">Alumnos en Curso</h3>
                            <Badge className="bg-primary-900 text-white border-none">{curso.nombre}</Badge>
                        </div>
                        <p className="text-primary-500 text-sm mt-1">
                            {alumnos.length} estudiantes registrados en {curso.turno} • {curso.nivel_codigo}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Search */}
                <div className="p-6 bg-primary-50/30 border-b border-primary-50">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 w-4 h-4" />
                        <Input
                            placeholder="Buscar alumno en este curso..."
                            className="pl-12 bg-white border-primary-100 rounded-xl"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-primary-400">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="text-sm font-medium uppercase tracking-widest">Cargando nómina...</p>
                        </div>
                    ) : filteredAlumnos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-primary-300">
                            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-10 h-10" />
                            </div>
                            <p className="text-lg font-display">No se encontraron alumnos</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {filteredAlumnos.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-primary-50/50 rounded-2xl border border-primary-50 hover:bg-white hover:border-primary-200 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-400 group-hover:text-primary-600 transition-colors">
                                            <UserCircle2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary-900 uppercase">
                                                {item.alumno?.apellido}, {item.alumno?.nombre}
                                            </p>
                                            <p className="text-xs text-primary-500 font-mono tracking-wider">
                                                DNI: {item.alumno?.dni}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-black uppercase text-primary-400 border-primary-200 group-hover:bg-primary-900 group-hover:text-white group-hover:border-transparent transition-all">
                                        {item.repite ? 'Repitente' : 'Regular'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-primary-50 bg-white flex justify-end items-center sm:rounded-b-[2.5rem]">
                    <Button onClick={onClose} className="bg-primary-900 hover:bg-primary-800 text-white px-8 rounded-xl h-12 shadow-lg">
                        Cerrar Nómina
                    </Button>
                </div>
            </div>
        </div>
    );
}
