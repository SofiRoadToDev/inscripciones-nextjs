'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray, SubmitHandler, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tutoresPageSchema, type TutoresPageFormData } from '@/lib/validations/tutor.schema'
import { formStorageService } from '@/lib/services/form-storage.service'
import { useProvincias } from '@/hooks/useProvincias'
import { useDepartamentos } from '@/hooks/useDepartamentos'
import { useLocalidades } from '@/hooks/useLocalidades'
import { Plus, Trash2, ChevronLeft, ChevronRight, User, Home, Phone, Briefcase, GraduationCap } from 'lucide-react'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TutoresFormProps {
    onNext: () => void
    onBack: () => void
}

export default function TutoresForm({ onNext, onBack }: TutoresFormProps) {
    const { provincias } = useProvincias()

    const form = useForm<TutoresPageFormData>({
        resolver: zodResolver(tutoresPageSchema),
        defaultValues: {
            tutores: [
                {
                    apellido: '',
                    nombre: '',
                    dni: '',
                    vinculo: '',
                    telefono: '',
                    estudios: '',
                    ocupacion: '',
                    mismo_domicilio_alumno: true,
                    domicilio: {
                        calle: '',
                        numero: '',
                        piso_depto: '',
                        casa_lote: '',
                        barrio_manzana_block: '',
                        provincia_id: '',
                        departamento_id: '',
                        localidad_id: '',
                    }
                }
            ]
        },
    })

    const { control, handleSubmit, watch, reset } = form

    const { fields, append, remove } = useFieldArray({
        control,
        name: "tutores"
    })

    // Persistencia en localStorage
    useEffect(() => {
        const savedData = formStorageService.getTabData('tutores')
        if (savedData && savedData.tutores && savedData.tutores.length > 0) {
            reset(savedData)
        }
    }, [reset])

    useEffect(() => {
        const subscription = watch((value) => {
            formStorageService.saveTabData('tutores', value)
        })
        return () => subscription.unsubscribe()
    }, [watch])

    const onSubmit: SubmitHandler<TutoresPageFormData> = (data) => {
        onNext()
    }

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex flex-col gap-8">
                    {fields.map((field, index) => (
                        <TutorCard
                            key={field.id}
                            index={index}
                            remove={fields.length > 1 ? () => remove(index) : undefined}
                            form={form}
                            provincias={provincias}
                        />
                    ))}
                </div>

                {fields.length < 3 && (
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-16 border-dashed border-2 border-neutral-300 hover:border-primary-500 hover:bg-primary-50 text-neutral-600 hover:text-primary-700 transition-all rounded-xl gap-2"
                        onClick={() => append({
                            apellido: '',
                            nombre: '',
                            dni: '',
                            vinculo: '',
                            telefono: '',
                            estudios: '',
                            ocupacion: '',
                            mismo_domicilio_alumno: true,
                            domicilio: {
                                calle: '',
                                numero: '',
                                provincia_id: '',
                                departamento_id: '',
                                localidad_id: '',
                            }
                        } as any)}
                    >
                        <Plus className="w-5 h-5" />
                        Agregar otro tutor / contacto de emergencia
                    </Button>
                )}

                <div className="flex justify-between pt-8 border-t border-neutral-200">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onBack}
                        className="text-neutral-600 hover:text-neutral-900 gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                    </Button>
                    <Button
                        type="submit"
                        className="bg-primary-600 hover:bg-primary-700 text-white px-8 gap-2 shadow-lg shadow-primary-200 transition-all"
                    >
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </Form>
    )
}


function TutorCard({ index, remove, form, provincias }: {
    index: number,
    remove?: () => void,
    form: any,
    provincias: any[]
}) {
    const viveConAlumno = useWatch({
        control: form.control,
        name: `tutores.${index}.mismo_domicilio_alumno`
    })

    const selectedProvinciaId = useWatch({
        control: form.control,
        name: `tutores.${index}.domicilio.provincia_id`
    })

    const selectedDepartamentoId = useWatch({
        control: form.control,
        name: `tutores.${index}.domicilio.departamento_id`
    })

    const { departamentos, loading: loadingDepts } = useDepartamentos(selectedProvinciaId)
    const { localidades, loading: loadingLocs } = useLocalidades(selectedDepartamentoId)

    return (
        <Card className="border-neutral-200 shadow-sm overflow-hidden group transition-all hover:shadow-md">
            <CardHeader className="bg-neutral-50 border-b border-neutral-100 flex flex-row items-center justify-between py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                        {index + 1}
                    </div>
                    <div>
                        <CardTitle className="font-display text-xl text-primary-900">
                            Tutor / Responsable
                        </CardTitle>
                        <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                            Datos del responsable legal o contacto
                        </p>
                    </div>
                </div>
                {remove && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={remove}
                        className="text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                )}
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                {/* Datos Personales */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary-800 border-b border-primary-100 pb-2">
                        <User className="w-5 h-5" />
                        <h3 className="font-display text-lg">Información Personal</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name={`tutores.${index}.apellido`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Apellido</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Perez" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`tutores.${index}.nombre`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Juan Carlos" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                            control={form.control}
                            name={`tutores.${index}.dni`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>DNI</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Sin puntos" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`tutores.${index}.vinculo`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vínculo</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Padre">Padre</SelectItem>
                                            <SelectItem value="Madre">Madre</SelectItem>
                                            <SelectItem value="Tutor Legal">Tutor Legal</SelectItem>
                                            <SelectItem value="Abuelo/a">Abuelo/a</SelectItem>
                                            <SelectItem value="Otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`tutores.${index}.telefono`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono de Contacto</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                                            <Input className="pl-10" placeholder="+54 9 387 ..." {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Educación y Trabajo */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary-800 border-b border-primary-100 pb-2">
                        <Briefcase className="w-5 h-5" />
                        <h3 className="font-display text-lg">Educación y Ocupación</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name={`tutores.${index}.estudios`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nivel de Estudios</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="w-4 h-4 text-neutral-400" />
                                                    <SelectValue placeholder="Seleccione nivel" />
                                                </div>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Primario Incompleto">Primario Incompleto</SelectItem>
                                            <SelectItem value="Primario Completo">Primario Completo</SelectItem>
                                            <SelectItem value="Secundario Incompleto">Secundario Incompleto</SelectItem>
                                            <SelectItem value="Secundario Completo">Secundario Completo</SelectItem>
                                            <SelectItem value="Terciario/Universitario Incompleto">Terciario/Universitario Incompleto</SelectItem>
                                            <SelectItem value="Terciario/Universitario Completo">Terciario/Universitario Completo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`tutores.${index}.ocupacion`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ocupación / Profesión</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Empleado de comercio" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Domicilio */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-primary-100 pb-2">
                        <div className="flex items-center gap-2 text-primary-800">
                            <Home className="w-5 h-5" />
                            <h3 className="font-display text-lg">Domicilio</h3>
                        </div>
                        <FormField
                            control={form.control}
                            name={`tutores.${index}.mismo_domicilio_alumno`}
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 bg-primary-50 px-3 py-2 rounded-lg border border-primary-100 transition-colors hover:bg-primary-100">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-medium text-primary-900 cursor-pointer">
                                            Vive con el alumno
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>

                    {!viveConAlumno && (
                        <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="md:col-span-2">
                                    <FormField
                                        control={form.control}
                                        name={`tutores.${index}.domicilio.calle`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Calle</FormLabel>
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
                                    name={`tutores.${index}.domicilio.numero`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`tutores.${index}.domicilio.piso_depto`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Piso/Depto</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Opcional" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name={`tutores.${index}.domicilio.provincia_id`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Provincia</FormLabel>
                                            <Select
                                                onValueChange={(val) => {
                                                    field.onChange(val)
                                                    form.setValue(`tutores.${index}.domicilio.departamento_id`, '')
                                                    form.setValue(`tutores.${index}.domicilio.localidad_id`, '')
                                                }}
                                                value={field.value || ''}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {provincias.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`tutores.${index}.domicilio.departamento_id`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Departamento</FormLabel>
                                            <Select
                                                onValueChange={(val) => {
                                                    field.onChange(val)
                                                    form.setValue(`tutores.${index}.domicilio.localidad_id`, '')
                                                }}
                                                value={field.value || ''}
                                                disabled={!selectedProvinciaId || loadingDepts}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={loadingDepts ? "Cargando..." : "Seleccione"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {departamentos.map(d => (
                                                        <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`tutores.${index}.domicilio.localidad_id`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Localidad</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || ''}
                                                disabled={!selectedDepartamentoId || loadingLocs}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={loadingLocs ? "Cargando..." : "Seleccione"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {localidades.map(l => (
                                                        <SelectItem key={l.id} value={l.id}>{l.nombre}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {viveConAlumno && (
                        <div className="bg-neutral-50 border border-neutral-100 p-4 rounded-xl flex items-center gap-3 text-neutral-600">
                            <Badge variant="outline" className="bg-white text-primary-600 border-primary-100">Info</Badge>
                            <p className="text-sm">Se utilizará la misma dirección declarada para el alumno.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
