'use client'

import { useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { saludSchema, type SaludFormData } from '@/lib/validations/salud.schema'
import { formStorageService } from '@/lib/services/form-storage.service'
import {
    Stethoscope,
    Syringe,
    AlertCircle,
    Activity,
    Pill,
    ClipboardCheck,
    ChevronLeft,
    ChevronRight,
    Check,
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
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FichaSaludFormProps {
    onNext: (data: SaludFormData) => void
    onBack: () => void
    isSubmitting?: boolean
}

export default function FichaSaludForm({ onNext, onBack, isSubmitting = false }: FichaSaludFormProps) {
    const form = useForm<SaludFormData>({
        resolver: zodResolver(saludSchema),
        defaultValues: {
            enfermedad_cronica: '',
            alergias: '',
            discapacidad: '',
            medicamentos: '',
            vacunacion_completa: false,
            certificado_salud: false,
            cud: false,
            observaciones: '',
        },
    })

    const { reset, watch, handleSubmit } = form

    // Persistencia en localStorage
    useEffect(() => {
        const savedData = formStorageService.getTabData('fichaSalud')
        if (savedData) {
            reset(savedData)
        }
    }, [reset])

    useEffect(() => {
        const subscription = watch((value) => {
            formStorageService.saveTabData('fichaSalud', value)
        })
        return () => subscription.unsubscribe()
    }, [watch])

    const onFormSubmit: SubmitHandler<SaludFormData> = (data) => {
        onNext(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
                <Card className="border-neutral-200 shadow-sm overflow-hidden group transition-all hover:shadow-md">
                    <CardHeader className="bg-neutral-50 border-b border-neutral-100 flex flex-row items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <Stethoscope className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="font-display text-xl text-primary-900">
                                    Ficha de Salud
                                </CardTitle>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                                    Declaración jurada de antecedentes médicos
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Enfermedades Crónicas */}
                            <FormField
                                control={form.control}
                                name="enfermedad_cronica"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center gap-2 text-primary-800">
                                            <Activity className="w-4 h-4" />
                                            <FormLabel className="text-base">Enfermedades Crónicas</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describa si padece asma, diabetes, problemas cardíacos, etc. (O escriba 'Ninguna')"
                                                className="min-h-[100px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Alergias */}
                            <FormField
                                control={form.control}
                                name="alergias"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center gap-2 text-primary-800">
                                            <AlertCircle className="w-4 h-4" />
                                            <FormLabel className="text-base">Alergias</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Indique medicamentos, alimentos o elementos ambientales. (O escriba 'Ninguna')"
                                                className="min-h-[100px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Discapacidad */}
                            <FormField
                                control={form.control}
                                name="discapacidad"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center gap-2 text-primary-800">
                                            <Badge variant="outline" className="h-5 p-1 border-primary-500 text-primary-500">!</Badge>
                                            <FormLabel className="text-base">Discapacidad</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Detalle si posee alguna discapacidad o condición que requiera atención especial."
                                                className="min-h-[100px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Medicamentos */}
                            <FormField
                                control={form.control}
                                name="medicamentos"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center gap-2 text-primary-800">
                                            <Pill className="w-4 h-4" />
                                            <FormLabel className="text-base">Medicamentos</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Indique si recibe medicación de forma habitual y su administración."
                                                className="min-h-[100px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <hr className="border-neutral-100" />

                        {/* Vacunación y CUD */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-50 rounded-xl p-6 border border-neutral-100">
                            <FormField
                                control={form.control}
                                name="vacunacion_completa"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between space-y-0 gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-primary-800">
                                                <Syringe className="w-5 h-5" />
                                                <FormLabel className="text-[14px]">Esquema de Vacunación</FormLabel>
                                            </div>
                                            <FormDescription className="text-[11px] text-neutral-500 leading-tight">
                                                ¿Cuenta con todas las vacunas obligatorias?
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-green-600 scale-90"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cud"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between space-y-0 gap-4 border-l border-neutral-200 pl-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-primary-800">
                                                <ClipboardCheck className="w-5 h-5" />
                                                <FormLabel className="text-[14px]">Certificado CUD</FormLabel>
                                            </div>
                                            <FormDescription className="text-[11px] text-neutral-500 leading-tight">
                                                ¿Presentó el Certificado Único de Discapacidad?
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-blue-600 scale-90"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Observaciones Generales */}
                        <FormField
                            control={form.control}
                            name="observaciones"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <div className="flex items-center gap-2 text-primary-800">
                                        <ClipboardCheck className="w-4 h-4" />
                                        <FormLabel className="text-base">Observaciones Adicionales</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Cualquier otra información que considere relevante para el bienestar del alumno."
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

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
                        className="bg-primary-600 hover:bg-primary-700 text-white px-8 gap-2 shadow-lg shadow-primary-200 transition-all font-semibold"
                    >
                        {isSubmitting ? (
                            "Cargando..."
                        ) : (
                            <>
                                Siguiente
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
