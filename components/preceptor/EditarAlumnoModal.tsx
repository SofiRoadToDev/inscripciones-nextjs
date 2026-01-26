'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { alumnoSchema, type AlumnoFormData } from '@/lib/validations/alumno.schema';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useProvincias } from '@/hooks/useProvincias';
import { useDepartamentos } from '@/hooks/useDepartamentos';
import { useLocalidades } from '@/hooks/useLocalidades';
import { getAlumnoDetalleAction, updateAlumnoAction } from '@/lib/actions/preceptor.actions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface EditarAlumnoModalProps {
    isOpen: boolean;
    onClose: () => void;
    alumnoId: string | null;
}

export function EditarAlumnoModal({ isOpen, onClose, alumnoId }: EditarAlumnoModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<AlumnoFormData>({
        resolver: zodResolver(alumnoSchema),
        defaultValues: {
            apellido: '',
            nombre: '',
            dni: '',
            fecha_nacimiento: '',
            nacionalidad: 'Argentina',
            genero: 'Masculino',
            email: '',
            telefono: '',
            domicilio: {
                calle: '',
                numero: '',
                piso_depto: '',
                casa_lote: '',
                barrio_manzana_block: '',
                provincia_id: '',
                departamento_id: '',
                localidad_id: '',
            },
        },
    });

    const { watch, reset, setValue } = form;
    const selectedProvinciaId = watch('domicilio.provincia_id');
    const selectedDepartamentoId = watch('domicilio.departamento_id');

    const { provincias } = useProvincias();
    const { departamentos } = useDepartamentos(selectedProvinciaId);
    const { localidades } = useLocalidades(selectedDepartamentoId);

    // Cargar datos del alumno al abrir el modal
    useEffect(() => {
        if (isOpen && alumnoId) {
            const loadData = async () => {
                setIsLoading(true);
                const result = await getAlumnoDetalleAction(alumnoId);

                if (result.error || !result.data) {
                    toast.error('Error al cargar datos del alumno');
                    onClose();
                    return;
                }

                const al = result.data;
                const dom = al.domicilio;

                // Formatear fecha para el input (asumiendo formato dd/mm/yyyy del schema)
                // Dependiendo de cómo venga de la BD (YYYY-MM-DD), hay que transformar.
                // Supongamos que viene ISO YYYY-MM-DD
                let fechaNac = '';
                if (al.fecha_nacimiento) {
                    const [y, m, d] = al.fecha_nacimiento.split('-');
                    fechaNac = `${d}/${m}/${y}`;
                }

                reset({
                    apellido: al.apellido,
                    nombre: al.nombre,
                    dni: al.dni,
                    fecha_nacimiento: fechaNac,
                    nacionalidad: al.nacionalidad,
                    genero: al.genero as any,
                    email: al.email || '',
                    telefono: al.telefono || '',
                    domicilio: {
                        calle: dom?.calle || '',
                        numero: dom?.numero || '',
                        piso_depto: dom?.piso_depto || '',
                        casa_lote: dom?.casa_lote || '',
                        barrio_manzana_block: dom?.barrio_manzana_block || '',
                        provincia_id: dom?.provincia_id || '',
                        departamento_id: dom?.departamento_id || '',
                        localidad_id: dom?.localidad_id || '',
                    },
                });

                setIsLoading(false);
            };

            loadData();
        }
    }, [isOpen, alumnoId, reset, onClose]);

    const onSubmit = async (data: AlumnoFormData) => {
        if (!alumnoId) return;
        setIsSaving(true);
        const result = await updateAlumnoAction(alumnoId, data);
        setIsSaving(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Alumno actualizado correctamente');
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Datos del Alumno</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                            {/* Datos Personales */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="apellido"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Apellido</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="nombre"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dni"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>DNI</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="fecha_nacimiento"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha Nacimiento (dd/mm/aaaa)</FormLabel>
                                            <FormControl><Input placeholder="dd/mm/aaaa" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="genero"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Género</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Masculino">Masculino</SelectItem>
                                                    <SelectItem value="Femenino">Femenino</SelectItem>
                                                    <SelectItem value="Otro">Otro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="telefono"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Teléfono</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Domicilio */}
                            <div className="space-y-4 border-t pt-4">
                                <h3 className="font-semibold text-primary-900">Domicilio</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="domicilio.calle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Calle</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="domicilio.numero"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Número</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* Provincia, Depto, Localidad */}
                                    <FormField
                                        control={form.control}
                                        name="domicilio.provincia_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Provincia</FormLabel>
                                                <Select onValueChange={(val) => {
                                                    field.onChange(val);
                                                    setValue('domicilio.departamento_id', '');
                                                    setValue('domicilio.localidad_id', '');
                                                }} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {provincias.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="domicilio.departamento_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Departamento</FormLabel>
                                                <Select onValueChange={(val) => {
                                                    field.onChange(val);
                                                    setValue('domicilio.localidad_id', '');
                                                }} value={field.value} disabled={!selectedProvinciaId}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {departamentos.map(d => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="domicilio.localidad_id"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel>Localidad</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDepartamentoId}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {localidades.map(l => <SelectItem key={l.id} value={l.id}>{l.nombre}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
