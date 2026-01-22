'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { moverAlumnoAction } from '@/lib/actions/preceptor.actions';
import { toast } from 'sonner';

interface MoverAlumnoModalProps {
    isOpen: boolean;
    onClose: () => void;
    alumno: {
        id: string;
        nombre: string;
        apellido: string;
        cursoId: string;
    } | null;
    cursos: Array<{ id: string; nombre: string }>;
}

export function MoverAlumnoModal({
    isOpen,
    onClose,
    alumno,
    cursos,
}: MoverAlumnoModalProps) {
    const [nuevoCursoId, setNuevoCursoId] = useState<string>('');
    const [isPending, setIsPending] = useState(false);

    const handleMove = async () => {
        if (!alumno || !nuevoCursoId) return;

        if (nuevoCursoId === alumno.cursoId) {
            toast.error('El alumno ya está en este curso');
            return;
        }

        setIsPending(true);
        const result = await moverAlumnoAction(alumno.id, nuevoCursoId);
        setIsPending(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Alumno movido correctamente');
            onClose();
            setNuevoCursoId('');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Mover Alumno de Curso</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Alumno</Label>
                        <p className="text-sm font-semibold text-primary-900 bg-primary-50 p-2 rounded-lg">
                            {alumno?.apellido}, {alumno?.nombre}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="curso">Seleccionar Nuevo Curso</Label>
                        <Select
                            value={nuevoCursoId}
                            onValueChange={setNuevoCursoId}
                        >
                            <SelectTrigger id="curso">
                                <SelectValue placeholder="Seleccione un curso" />
                            </SelectTrigger>
                            <SelectContent>
                                {cursos
                                    .filter((c) => c.id !== alumno?.cursoId)
                                    .map((curso) => (
                                        <SelectItem key={curso.id} value={curso.id}>
                                            {curso.nombre}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground">
                            Solo se muestran los cursos bajo su responsabilidad.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button onClick={handleMove} disabled={!nuevoCursoId || isPending}>
                        {isPending ? 'Moviendo...' : 'Confirmar Movimiento'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
