'use client';

import { useState, useEffect } from 'react';
import {
    Settings,
    DollarSign,
    BookOpen,
    Plus,
    Trash2,
    Save,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    getConceptosPago,
    updateConceptoMonto,
    getCursos,
    createCurso,
    deleteCurso
} from '@/lib/actions/admin.actions';
import { getNivelesAction } from '@/lib/actions/catalogo.actions';
import { cn } from '@/lib/utils';

export default function ConfigPage() {
    const [conceptos, setConceptos] = useState<any[]>([]);
    const [cursos, setCursos] = useState<any[]>([]);
    const [niveles, setNiveles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    // Form states
    const [nuevoCurso, setNuevoCurso] = useState({ nombre: '', nivel: '' });
    const [isCreatingCurso, setIsCreatingCurso] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const [cRes, cuRes, nRes] = await Promise.all([
                getConceptosPago(),
                getCursos(),
                getNivelesAction()
            ]);

            if (cRes.data) setConceptos(cRes.data);
            if (cuRes.data) setCursos(cuRes.data);
            if (nRes) setNiveles(nRes);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleUpdateMonto = async (id: string, monto: number) => {
        setSavingId(id);
        const res = await updateConceptoMonto(id, monto);
        if (res.success) {
            // Updated successfully
        } else {
            alert('Error: ' + res.error);
        }
        setSavingId(null);
    };

    const handleCreateCurso = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoCurso.nombre || !nuevoCurso.nivel) return;

        setIsCreatingCurso(true);
        const res = await createCurso(nuevoCurso.nombre, nuevoCurso.nivel);
        if (res.success) {
            setNuevoCurso({ nombre: '', nivel: '' });
            const cuRes = await getCursos();
            if (cuRes.data) setCursos(cuRes.data);
        }
        setIsCreatingCurso(false);
    };

    const handleDeleteCurso = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar este curso?')) return;
        const res = await deleteCurso(id);
        if (res.success) {
            setCursos(cursos.filter(c => c.id !== id));
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-primary-500 font-medium">Cargando configuración...</p>
        </div>
    );

    return (
        <div className="space-y-12">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-display text-primary-900 tracking-tight">Panel de Configuración</h1>
                <p className="text-primary-500 mt-2 font-medium">Ajuste de montos referenciales y gestión académica.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* Conceptos Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-display text-primary-900">Aranceles y Seguros</h2>
                    </div>

                    <div className="bg-white border border-primary-100 rounded-[2rem] p-8 shadow-sm space-y-6">
                        <p className="text-sm text-primary-500 italic">
                            * El monto de inscripción es <strong>referencial</strong>. En el formulario de pago se cargará este valor por defecto pero podrá ser editado.
                        </p>

                        <div className="space-y-4">
                            {conceptos.map((concepto) => (
                                <div key={concepto.id} className="flex flex-col gap-2 p-4 rounded-2xl bg-primary-50/50 border border-primary-100 group transition-all hover:bg-white hover:shadow-md">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-primary-900">{concepto.nombre}</span>
                                        <Badge variant="outline" className="text-[10px] uppercase font-black text-primary-400">Ref. Actual</Badge>
                                    </div>
                                    <div className="flex gap-3 mt-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400">$</span>
                                            <Input
                                                type="number"
                                                defaultValue={concepto.monto}
                                                className="pl-8 bg-white border-primary-200"
                                                onBlur={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (val !== concepto.monto) handleUpdateMonto(concepto.id, val);
                                                }}
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-xl text-primary-400"
                                            disabled={savingId === concepto.id}
                                        >
                                            {savingId === concepto.id ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> : <Save className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Cursos Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-50 p-2 rounded-xl text-primary-600">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-display text-primary-900">Gestión de Cursos</h2>
                    </div>

                    <div className="bg-white border border-primary-100 rounded-[2rem] p-8 shadow-sm space-y-8">
                        {/* New Course Form */}
                        <form onSubmit={handleCreateCurso} className="flex flex-col sm:flex-row gap-3">
                            <Input
                                placeholder="Nombre (Ej: 1er Año B)"
                                value={nuevoCurso.nombre}
                                onChange={(e) => setNuevoCurso({ ...nuevoCurso, nombre: e.target.value })}
                                className="border-primary-100"
                                required
                            />
                            <select
                                className="bg-primary-50 border-none rounded-xl px-4 py-2 text-sm text-primary-900 focus:ring-2 focus:ring-primary-500 min-w-[120px]"
                                value={nuevoCurso.nivel}
                                onChange={(e) => setNuevoCurso({ ...nuevoCurso, nivel: e.target.value })}
                                required
                            >
                                <option value="">Nivel...</option>
                                {niveles.map(n => (
                                    <option key={n.codigo} value={n.codigo}>{n.codigo}</option>
                                ))}
                            </select>
                            <Button type="submit" className="bg-primary-900 hover:bg-primary-800 rounded-xl" disabled={isCreatingCurso}>
                                {isCreatingCurso ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            </Button>
                        </form>

                        {/* List */}
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {cursos.map(curso => (
                                <div key={curso.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-transparent hover:border-primary-100 transition-all hover:bg-white group">
                                    <div className="flex items-center gap-3">
                                        <Badge className="bg-primary-100 text-primary-700 hover:bg-primary-200 border-none">{curso.nivel_codigo}</Badge>
                                        <span className="font-semibold text-primary-900">{curso.nombre}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteCurso(curso.id)}
                                        className="text-primary-300 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
