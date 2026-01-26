'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    crearPreceptorAction,
    actualizarPreceptorAction,
} from '@/lib/actions/preceptor.actions';
import { toast } from 'sonner';

const preceptorSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    apellido: z.string().min(3, 'El apellido debe tener al menos 3 caracteres'),
    dni: z.string().min(7, 'DNI inválido (mínimo 7 caracteres)'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
    cursoIds: z.array(z.string()).min(1, 'Debe asignar al menos un curso'),
});

type PreceptorFormData = z.infer<typeof preceptorSchema>;

interface Curso {
    id: string;
    nombre: string;
}

interface Preceptor {
    id: string;
    nombre: string;
    apellido: string | null;
    dni: string | null;
    email?: string;
    cursos: Array<{ id: string; curso: { id: string; nombre: string } }>;
}

interface PreceptorFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    cursos: Curso[];
    preceptor?: Preceptor | null;
}

export function PreceptorFormModal({
    isOpen,
    onClose,
    cursos,
    preceptor,
}: PreceptorFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!preceptor;

    const form = useForm<PreceptorFormData>({
        resolver: zodResolver(preceptorSchema),
        defaultValues: {
            nombre: '',
            apellido: '',
            dni: '',
            email: '',
            password: '',
            cursoIds: [],
        },
    });

    useEffect(() => {
        if (preceptor) {
            form.reset({
                nombre: preceptor.nombre,
                apellido: preceptor.apellido || '',
                dni: preceptor.dni || '',
                email: preceptor.email || '',
                password: '',
                cursoIds: preceptor.cursos.map((c) => c.curso.id),
            });
        } else {
            form.reset({
                nombre: '',
                apellido: '',
                dni: '',
                email: '',
                password: '',
                cursoIds: [],
            });
        }
    }, [preceptor, form]);

    const onSubmit = async (data: PreceptorFormData) => {
        setIsSubmitting(true);

        try {
            if (isEditing && preceptor) {
                // Actualizar preceptor completo
                const result = await actualizarPreceptorAction(
                    preceptor.id,
                    {
                        cursoIds: data.cursoIds,
                        nombre: data.nombre,
                        apellido: data.apellido,
                        dni: data.dni,
                        email: data.email,
                        password: data.password || undefined,
                    }
                );

                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success('Preceptor actualizado correctamente');
                    onClose();
                }
            } else {
                // Crear nuevo preceptor
                // Validación manual para campos requeridos solo en creación
                if (!data.email) {
                    form.setError('email', { message: 'El email es requerido' });
                    setIsSubmitting(false);
                    return;
                }
                if (!data.password) {
                    form.setError('password', { message: 'La contraseña es requerida' });
                    setIsSubmitting(false);
                    return;
                }

                const result = await crearPreceptorAction({
                    email: data.email,
                    password: data.password,
                    nombre: data.nombre,
                    apellido: data.apellido,
                    dni: data.dni,
                    cursoIds: data.cursoIds,
                });

                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success('Preceptor creado correctamente');
                    form.reset();
                    onClose();
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'Error al procesar la solicitud');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar Preceptor' : 'Nuevo Preceptor'}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="nombre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="apellido"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apellido</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="dni"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>DNI</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña'}</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cursoIds"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Cursos Asignados</FormLabel>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        {cursos.map((curso) => (
                                            <FormField
                                                key={curso.id}
                                                control={form.control}
                                                name="cursoIds"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(curso.id)}
                                                                onCheckedChange={(checked) => {
                                                                    const newValue = checked
                                                                        ? [...(field.value || []), curso.id]
                                                                        : field.value?.filter((id) => id !== curso.id) || [];
                                                                    field.onChange(newValue);
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">
                                                            {curso.nombre}
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
