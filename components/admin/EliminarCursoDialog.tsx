'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    deleteCurso,
    getAlumnosByCurso,
    getCursos,
    moverAlumnosCurso,
    eliminarAlumnosCurso
} from '@/lib/actions/admin.actions';
import { toast } from 'sonner';
import { AlertTriangle, Users } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EliminarCursoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    curso: {
        id: string;
        nombre: string;
    } | null;
    onSuccess: (id: string) => void;
}

export function EliminarCursoDialog({ isOpen, onClose, curso, onSuccess }: EliminarCursoDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [checking, setChecking] = useState(false);
    const [alumnosCount, setAlumnosCount] = useState(0);
    const [option, setOption] = useState<'none' | 'move' | 'delete'>('none');
    const [targetCursoId, setTargetCursoId] = useState('');
    const [cursosDisponibles, setCursosDisponibles] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && curso) {
            const check = async () => {
                setChecking(true);
                setOption('none');
                setTargetCursoId('');

                // 1. Contar alumnos
                const alRes = await getAlumnosByCurso(curso.id);
                const count = alRes.data?.length || 0;
                setAlumnosCount(count);

                // 2. Si hay alumnos, cargar otros cursos para mover
                if (count > 0) {
                    const curRes = await getCursos();
                    if (curRes.data) {
                        setCursosDisponibles(curRes.data.filter((c: any) => c.id !== curso.id));
                    }
                }
                setChecking(false);
            };
            check();
        }
    }, [isOpen, curso]);

    const handleDelete = async () => {
        if (!curso) return;
        setIsDeleting(true);

        try {
            if (alumnosCount > 0) {
                if (option === 'move') {
                    if (!targetCursoId) {
                        toast.error('Seleccione un curso de destino');
                        setIsDeleting(false);
                        return;
                    }
                    const resMove = await moverAlumnosCurso(curso.id, targetCursoId);
                    if (resMove.error) throw new Error(resMove.error);
                } else if (option === 'delete') {
                    const resDelAlu = await eliminarAlumnosCurso(curso.id);
                    if (resDelAlu.error) throw new Error(resDelAlu.error);
                } else {
                    toast.error('Debe seleccionar una acción para los alumnos');
                    setIsDeleting(false);
                    return;
                }
            }

            // Finalmente eliminar el curso
            const result = await deleteCurso(curso.id);

            if (result.success) {
                toast.success('Curso eliminado correctamente');
                onSuccess(curso.id);
                onClose();
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast.error('Error: ' + error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const hasAlumnos = alumnosCount > 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Eliminar Curso
                    </DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro que deseas eliminar el curso <strong>{curso?.nombre}</strong>?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {checking ? (
                        <p className="text-sm text-muted-foreground text-center">Verificando alumnos inscritos...</p>
                    ) : hasAlumnos ? (
                        <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                <Users className="w-5 h-5 text-amber-600 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-amber-900 text-sm">Curso con Alumnos</h4>
                                    <p className="text-amber-700 text-xs mt-1">
                                        Se encontraron <strong>{alumnosCount} alumnos</strong> inscritos en este curso.
                                        Para eliminar el curso, primero debes decidir qué hacer con ellos.
                                    </p>
                                </div>
                            </div>

                            <RadioGroup value={option} onValueChange={(v: any) => setOption(v)}>
                                <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                                    <RadioGroupItem value="move" id="r-move" />
                                    <Label htmlFor="r-move" className="flex-1 cursor-pointer font-medium">Mover alumnos a otro curso</Label>
                                </div>

                                {option === 'move' && (
                                    <div className="pl-6 pt-1">
                                        <Select value={targetCursoId} onValueChange={setTargetCursoId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar curso destino..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cursosDisponibles.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.nombre} ({c.turno})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="flex items-center space-x-2 border border-red-100 bg-red-50/30 p-3 rounded-lg hover:bg-red-50 cursor-pointer">
                                    <RadioGroupItem value="delete" id="r-delete" className="text-red-600 border-red-600" />
                                    <Label htmlFor="r-delete" className="flex-1 cursor-pointer font-medium text-red-700">Eliminar inscripciones de alumnos</Label>
                                </div>
                                {option === 'delete' && (
                                    <p className="pl-6 text-xs text-red-600">
                                        * Se borrarán permanentemente las inscripciones, pagos y legajos asociados a este curso.
                                    </p>
                                )}
                            </RadioGroup>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">
                            No hay alumnos inscritos. El curso se puede eliminar de forma segura.
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isDeleting}>
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting || checking || (hasAlumnos && option === 'none') || (hasAlumnos && option === 'move' && !targetCursoId)}
                    >
                        {isDeleting ? 'Eliminando...' : hasAlumnos ? 'Confirmar Acción y Eliminar' : 'Eliminar Curso'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
