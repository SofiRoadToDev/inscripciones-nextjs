'use client';

import { useState, useEffect } from 'react';
import { X, Search, UserCheck, Loader2, Filter, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { getAlumnosSinCurso, asignarCursoMasivo } from '@/lib/actions/admin.actions';
import { differenceInYears } from 'date-fns';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    curso: any;
    onSuccess: () => void;
}

export default function AsignarAlumnosModal({ isOpen, onClose, curso, onSuccess }: Props) {
    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filtroGenero, setFiltroGenero] = useState('todos');
    const [filtroEdad, setFiltroEdad] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (isOpen && curso) {
            loadAlumnos();
            setSelectedIds([]);
            setShowConfirm(false);
        }
    }, [isOpen, curso]);

    const loadAlumnos = async () => {
        setLoading(true);
        const res = await getAlumnosSinCurso(curso.nivel_codigo);
        if (res.data) setAlumnos(res.data);
        setLoading(false);
    };

    const toggleAlumno = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleAsignar = async () => {
        setIsSubmitting(true);
        const res = await asignarCursoMasivo(selectedIds, curso.id);
        if (res.success) {
            onSuccess();
            onClose();
        } else {
            alert('Error: ' + res.error);
        }
        setIsSubmitting(false);
    };

    const filteredAlumnos = alumnos.filter(a => {
        const edad = differenceInYears(new Date(), new Date(a.alumno.fecha_nacimiento));
        const matchSearch = (a.alumno.nombre + ' ' + a.alumno.apellido + ' ' + a.alumno.dni).toLowerCase().includes(search.toLowerCase());
        const matchGenero = filtroGenero === 'todos' || a.alumno.genero === filtroGenero;
        const matchEdad = filtroEdad === '' || edad === parseInt(filtroEdad);
        return matchSearch && matchGenero && matchEdad;
    });

    if (!isOpen || !curso) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-md animate-in fade-in" onClick={onClose} />

            <div className="relative w-full max-w-4xl h-full sm:h-[85vh] bg-white sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-primary-50 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-display text-primary-900">Asignar Alumnos</h3>
                            <Badge className="bg-primary-900 text-white border-none">{curso.nombre}</Badge>
                        </div>
                        <p className="text-primary-500 text-sm mt-1">Nivel: {curso.nivel_codigo} • Turno: {curso.turno}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Filters */}
                <div className="p-6 bg-primary-50/30 border-b border-primary-50 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative col-span-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 w-4 h-4" />
                        <Input
                            placeholder="Buscar por DNI, Nombre o Apellido..."
                            className="pl-12 bg-white border-primary-100 rounded-xl"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-white border border-primary-100 rounded-xl px-4 py-2 text-sm text-primary-900"
                        value={filtroGenero}
                        onChange={(e) => setFiltroGenero(e.target.value)}
                    >
                        <option value="todos">Géneros</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                    </select>
                    <Input
                        type="number"
                        placeholder="Edad (ej: 13)"
                        className="bg-white border-primary-100 rounded-xl"
                        value={filtroEdad}
                        onChange={(e) => setFiltroEdad(e.target.value)}
                    />
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-primary-400">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="text-sm font-medium">Buscando alumnos aprobados sin curso...</p>
                        </div>
                    ) : filteredAlumnos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-primary-400 opacity-60">
                            <AlertCircle className="w-12 h-12" />
                            <p className="text-lg font-display">No hay alumnos disponibles para este nivel</p>
                        </div>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-[10px] font-black uppercase text-primary-400 tracking-tighter border-b border-primary-50 pb-4">
                                    <th className="p-4 text-left"><Checkbox
                                        checked={selectedIds.length === filteredAlumnos.length && filteredAlumnos.length > 0}
                                        onCheckedChange={(checked) => {
                                            if (checked) setSelectedIds(filteredAlumnos.map(a => a.id));
                                            else setSelectedIds([]);
                                        }}
                                    /></th>
                                    <th className="p-4 text-left">Alumno</th>
                                    <th className="p-4 text-left">DNI</th>
                                    <th className="p-4 text-left">Edad</th>
                                    <th className="p-4 text-left">Género</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAlumnos.map((item) => {
                                    const edad = differenceInYears(new Date(), new Date(item.alumno.fecha_nacimiento));
                                    return (
                                        <tr key={item.id} className="border-b border-primary-50 hover:bg-primary-50/50 transition-colors">
                                            <td className="p-4">
                                                <Checkbox
                                                    checked={selectedIds.includes(item.id)}
                                                    onCheckedChange={() => toggleAlumno(item.id)}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <span className="font-bold text-primary-900 uppercase">{item.alumno.apellido}, {item.alumno.nombre}</span>
                                            </td>
                                            <td className="p-4 text-sm text-primary-600 font-mono">{item.alumno.dni}</td>
                                            <td className="p-4 text-sm text-primary-600 font-medium">{edad} años</td>
                                            <td className="p-4">
                                                <Badge variant="outline" className="bg-primary-50 text-primary-600 text-[10px] border-none">{item.alumno.genero}</Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer / Actions */}
                <div className="p-8 border-t border-primary-50 bg-white flex justify-between items-center sm:rounded-b-[2.5rem]">
                    <p className="text-sm font-medium text-primary-500">
                        Seleccionados: <span className="text-primary-900 font-bold">{selectedIds.length}</span> alumnos
                    </p>
                    <div className="flex gap-4">
                        <Button variant="ghost" onClick={onClose} className="rounded-xl">Cancelar</Button>
                        <Button
                            disabled={selectedIds.length === 0 || isSubmitting}
                            onClick={() => setShowConfirm(true)}
                            className="bg-primary-900 hover:bg-primary-800 text-white px-8 rounded-xl gap-2 shadow-lg hover:shadow-xl transition-all"
                        >
                            <UserCheck className="w-4 h-4" />
                            Asignar al Curso
                        </Button>
                    </div>
                </div>

                {/* Confirm Overlay */}
                {showConfirm && (
                    <div className="absolute inset-0 z-[130] flex items-center justify-center p-6 backdrop-blur-sm bg-primary-900/10">
                        <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full space-y-6 text-center animate-in zoom-in-95 duration-200">
                            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-display text-primary-900">¿Confirmar Asignación?</h4>
                                <p className="text-sm text-primary-500">
                                    Se asignarán <span className="font-bold text-primary-900">{selectedIds.length}</span> alumnos al curso <span className="font-bold text-primary-900 uppercase">{curso.nombre}</span>.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 pt-2">
                                <Button onClick={handleAsignar} disabled={isSubmitting} className="bg-primary-900 py-6 rounded-xl">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Sí, confirmar asignación'}
                                </Button>
                                <Button variant="ghost" onClick={() => setShowConfirm(false)} className="rounded-xl">Volver</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
