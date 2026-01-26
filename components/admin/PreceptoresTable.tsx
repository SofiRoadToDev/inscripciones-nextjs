'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { PreceptorFormModal } from '@/components/admin/PreceptorFormModal';
import { eliminarPreceptorAction } from '@/lib/actions/preceptor.actions';
import { toast } from 'sonner';

interface Curso {
    id: string;
    curso: {
        id: string;
        nombre: string;
    };
}

interface Preceptor {
    id: string;
    nombre: string;
    apellido: string | null;
    dni: string | null;
    email: string;
    user_id: string;
    cursos: Curso[];
}

interface PreceptoresTableProps {
    preceptores: Preceptor[];
    cursos: Array<{ id: string; nombre: string }>;
}

export function PreceptoresTable({ preceptores, cursos }: PreceptoresTableProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPreceptor, setSelectedPreceptor] = useState<Preceptor | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleEdit = (preceptor: Preceptor) => {
        setSelectedPreceptor(preceptor);
        setIsModalOpen(true);
    };

    const handleDelete = async (preceptorId: string, nombre: string) => {
        if (!confirm(`¿Está seguro de eliminar al preceptor ${nombre}?`)) {
            return;
        }

        setIsDeleting(preceptorId);
        const result = await eliminarPreceptorAction(preceptorId);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Preceptor eliminado correctamente');
        }
        setIsDeleting(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPreceptor(null);
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gestión de Preceptores</h2>
                <Button onClick={() => setIsModalOpen(true)}>
                    Nuevo Preceptor
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Apellido</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>DNI</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Cursos Asignados</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {preceptores.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    No hay preceptores registrados
                                </TableCell>
                            </TableRow>
                        ) : (
                            preceptores.map((preceptor) => (
                                <TableRow key={preceptor.id}>
                                    <TableCell className="font-medium">{preceptor.apellido || '-'}</TableCell>
                                    <TableCell className="font-medium">{preceptor.nombre}</TableCell>
                                    <TableCell>{preceptor.dni || '-'}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{preceptor.email}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {preceptor.cursos.length === 0 ? (
                                                <span className="text-sm text-muted-foreground">
                                                    Sin cursos asignados
                                                </span>
                                            ) : (
                                                preceptor.cursos.map((c) => (
                                                    <Badge key={c.id} variant="secondary">
                                                        {c.curso.nombre}
                                                    </Badge>
                                                ))
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(preceptor)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(preceptor.id, preceptor.nombre)}
                                                disabled={isDeleting === preceptor.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <PreceptorFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                cursos={cursos}
                preceptor={selectedPreceptor}
            />
        </>
    );
}
