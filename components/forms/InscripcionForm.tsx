'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { inscripcionSchema, type InscripcionFormData } from '@/lib/validations/inscripcion.schema'
import { formStorageService } from '@/lib/services/form-storage.service'
import { verificarInscripcionExistenteAction } from '@/lib/actions/inscripcion.actions'
import { useNiveles } from '@/hooks/useNiveles'
import { useCursos } from '@/hooks/useCursos'
import {
    School,
    GraduationCap,
    Calendar,
    AlertTriangle,
    ChevronLeft,
    CheckCircle2
} from 'lucide-react'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface InscripcionFormProps {
    onSubmit: (data: InscripcionFormData) => void
    onBack: () => void
    isSubmitting?: boolean
    mode?: 'create' | 'edit'
}

export default function InscripcionForm({ onSubmit, onBack, isSubmitting = false, mode = 'create' }: InscripcionFormProps) {
    const currentYear = new Date().getFullYear().toString()
    const [localError, setLocalError] = useState<string | null>(null)

    const form = useForm<InscripcionFormData>({
        resolver: zodResolver(inscripcionSchema),
        defaultValues: {
            nivel_codigo: '',
            ciclo_lectivo: currentYear,
            repite: false,
            materias_pendientes: '',
            escuela_procedencia: '',
            documentacion_completa: false,
            observaciones: '',
        },
    })

    const { reset, watch } = form
    const repite = watch('repite')

    const { niveles, loading: loadingNiveles } = useNiveles()

    // Persistencia en localStorage
    useEffect(() => {
        const savedData = formStorageService.getTabData('inscripcion')
        if (savedData) {
            // Asegurar que los valores no sean undefined para evitar errores de controlled/uncontrolled
            reset({
                nivel_codigo: savedData.nivel_codigo || '',
                ciclo_lectivo: savedData.ciclo_lectivo || currentYear,
                repite: !!savedData.repite,
                materias_pendientes: savedData.materias_pendientes || '',
                escuela_procedencia: savedData.escuela_procedencia || '',
            })
        }
    }, [reset, currentYear])

    useEffect(() => {
        const subscription = watch((value) => {
            formStorageService.saveTabData('inscripcion', value)
        })
        return () => subscription.unsubscribe()
    }, [watch])

    const handleFinalSubmit = async (data: InscripcionFormData) => {
        setLocalError(null)

        try {
            // Buscamos el DNI del alumno en localStorage
            const savedAlumno = formStorageService.getTabData('alumno')
            if (!savedAlumno?.dni) {
                setLocalError("No se encontró el DNI del alumno para validar.")
                return
            }

            // Ultima verificación de duplicado (por si cambió el ciclo aquí)
            if (mode !== 'edit') {
                const check = await verificarInscripcionExistenteAction(savedAlumno.dni, data.ciclo_lectivo)

                if (check.success && check.exists) {
                    setLocalError(`El alumno ya posee una inscripción registrada para el ciclo ${data.ciclo_lectivo}.`)
                    return
                }
            }

            onSubmit(data)
        } catch (error) {
            setLocalError("Ocurrió un error al procesar la inscripción.")
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-8">
                <Card className="border-neutral-200 shadow-sm overflow-hidden group transition-all hover:shadow-md">
                    <CardHeader className="bg-neutral-50 border-b border-neutral-100 flex flex-row items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center text-accent-600">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="font-display text-xl text-primary-900">
                                    Datos de Inscripción
                                </CardTitle>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                                    Nivel, curso y antecedentes académicos
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Ciclo Lectivo */}
                            <FormField
                                control={form.control}
                                name="ciclo_lectivo"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2 mb-2 text-primary-800 font-medium">
                                            <Calendar className="w-4 h-4" />
                                            <FormLabel>Ciclo Lectivo</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input {...field} className="bg-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Nivel */}
                            <FormField
                                control={form.control}
                                name="nivel_codigo"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2 mb-2 text-primary-800 font-medium">
                                            <School className="w-4 h-4" />
                                            <FormLabel>Nivel Educativo</FormLabel>
                                        </div>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder={loadingNiveles ? "Cargando..." : "Seleccione Nivel"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {niveles.map((n) => (
                                                    <SelectItem key={n.codigo} value={n.codigo}>
                                                        {n.codigo} - {n.ciclo}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* Repite */}
                            <div className="space-y-6">
                                <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-100">
                                    <FormField
                                        control={form.control}
                                        name="repite"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between space-y-0">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-primary-800">
                                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                        <FormLabel className="text-base font-semibold">¿Es repitente?</FormLabel>
                                                    </div>
                                                    <FormDescription className="text-xs">
                                                        Marque si el alumno está recursando el año
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="data-[state=checked]:bg-amber-500"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Materias Pendientes (Condicional si repite o Secundario) */}
                                <FormField
                                    control={form.control}
                                    name="materias_pendientes"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-medium text-primary-800">Materias Pendientes / Previas</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Si posee materias de años anteriores sin aprobar, detállalas aquí. Deje en blanco si no aplica."
                                                    className="min-h-[100px] resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Escuela de Procedencia */}
                            <FormField
                                control={form.control}
                                name="escuela_procedencia"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center gap-2 text-primary-800 mb-2 font-medium">
                                            <School className="w-4 h-4" />
                                            <FormLabel>Escuela de Procedencia</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input
                                                placeholder="Nombre de la escuela anterior y localidad"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Indique de qué institución proviene el alumno si es su primer año en el colegio.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {localError && (
                    <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 border-3 border-amber-500 bg-amber-50 text-amber-900 shadow-lg">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="font-bold">Error de Validación</AlertTitle>
                        <AlertDescription className="font-medium">{localError}</AlertDescription>
                    </Alert>
                )}

                <div className="flex justify-between pt-8">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onBack}
                        disabled={isSubmitting}
                        className="text-neutral-600 hover:text-neutral-900 gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-accent-600 hover:bg-accent-700 text-white px-8 gap-2 shadow-lg shadow-accent-200 transition-all font-semibold"
                    >
                        {isSubmitting ? (
                            "Procesando..."
                        ) : (
                            <>
                                {mode === 'edit' ? 'Guardar Cambios' : 'Finalizar y Registrar Inscripción'}
                                <CheckCircle2 className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
