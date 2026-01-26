'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { eliminarAlumnoAction } from '@/lib/actions/preceptor.actions';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface EliminarAlumnoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    alumno: {
        inscripcionId: string; // Usamos el ID de la inscripción para eliminar
        nombre: string;
        apellido: string;
    } | null;
}

export function EliminarAlumnoDialog({ isOpen, onClose, alumno }: EliminarAlumnoDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!alumno) return;

        setIsDeleting(true);
        // Aquí llamamos a la acción de eliminar (que en realidad podría ser un borrado lógico o físico de la inscripción)
        const result = await eliminarAlumnoAction(alumno.inscripcionId);
        setIsDeleting(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Alumno eliminado del curso correctamente');
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Confirmar Eliminación
                    </DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro que deseas eliminar a <strong>{alumno?.apellido}, {alumno?.nombre}</strong> de este curso?
                        <br /><br />
                        <span className="block text-red-500 font-semibold bg-red-50 p-2 rounded text-xs border border-red-100">
                            Esta acción eliminará la inscripción, los pagos asociados y la ficha de salud registrada para este ciclo lectivo.
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isDeleting}>
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
