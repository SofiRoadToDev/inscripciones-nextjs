'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import AlumnoForm from './AlumnoForm'
import TutoresForm from './TutoresForm'
import FichaSaludForm from './FichaSaludForm'
import InscripcionForm from './InscripcionForm'
import { registrarInscripcionAction, actualizarInscripcionAction } from '@/lib/actions/inscripcion.actions'
import { formStorageService } from '@/lib/services/form-storage.service'
import { CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface InscripcionTabsProps {
    mode?: 'create' | 'edit'
    inscripcionId?: string
}

export default function InscripcionTabs({ mode = 'create', inscripcionId }: InscripcionTabsProps) {
    const [activeTab, setActiveTab] = useState('alumno')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [resetKey, setResetKey] = useState(0)

    const router = useRouter()

    const handleNewInscripcion = () => {
        setSuccess(false)
        setActiveTab('alumno')
        setResetKey(prev => prev + 1)
        formStorageService.clearFormData()
    }

    const returnToHome = () => {
        if (mode === 'edit') {
            router.push('/admin/inscripciones')
        } else {
            router.push('/')
        }
    }

    const handleFinalSubmit = async () => {
        setIsSubmitting(true)
        setError(null)

        try {
            const allData = formStorageService.getAllFormData()

            // Validación básica de pasos completos
            if (!allData.alumno || !allData.tutores || !allData.fichaSalud || !allData.inscripcion) {
                throw new Error("Por favor complete todos los pasos del formulario antes de finalizar.")
            }

            let result;
            if (mode === 'edit' && inscripcionId) {
                result = await actualizarInscripcionAction(inscripcionId, allData)
            } else {
                result = await registrarInscripcionAction(allData)
            }

            console.log('🚀 Resultado:', result)

            if (result.success) {
                setSuccess(true)
                if (mode !== 'edit') {
                    formStorageService.clearFormData()
                }
            } else {
                setError(result.error || "Ocurrió un error inesperado al procesar la inscripción.")
            }
        } catch (err: any) {
            console.error('❌ Error capturado en handleFinalSubmit:', err)
            setError(err.message || "Ocurrió un fallo en la conexión con el servidor.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (success) {
        return (
            <div className="w-full max-w-2xl mx-auto py-18 animate-in fade-in zoom-in duration-500">
                <Card className="p-12 text-center space-y-6 border-accent-100 shadow-2xl shadow-accent-50">
                    <div className="w-20 h-20 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="font-display text-4xl text-primary-900 italic">
                        {mode === 'edit' ? '¡Cambios Guardados!' : '¡Inscripción Exitosa!'}
                    </h2>
                    <p className="text-lg text-neutral-600 max-w-md mx-auto">
                        {mode === 'edit'
                            ? 'La información de la inscripción ha sido actualizada correctamente.'
                            : 'Los datos han sido registrados correctamente en nuestro sistema. El colegio se pondrá en contacto pronto.'}
                    </p>
                    <div className="pt-8">
                        <Button
                            onClick={returnToHome}
                            className="cursor-pointer bg-primary-500 hover:bg-primary-600 text-white gap-2"
                        >
                            {mode === 'edit' ? <ArrowLeft className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                            {mode === 'edit' ? 'Volver al Panel' : 'Volver a la página principal'}
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="w-full max-w-5xl mx-auto py-8">
            {error && (
                <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2 border-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error en el proceso</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Tabs value={activeTab} className="space-y-6">
                <TabsList className="grid grid-cols-4 w-full h-auto p-1 bg-neutral-100 rounded-xl">
                    <TabsTrigger value="alumno" disabled={activeTab !== 'alumno'} className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        1. Alumno
                    </TabsTrigger>
                    <TabsTrigger value="tutores" disabled={activeTab !== 'tutores'} className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        2. Tutores
                    </TabsTrigger>
                    <TabsTrigger value="salud" disabled={activeTab !== 'salud'} className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        3. Salud
                    </TabsTrigger>
                    <TabsTrigger value="inscripcion" disabled={activeTab !== 'inscripcion'} className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        4. Finalizar
                    </TabsTrigger>
                </TabsList>

                <Card className="p-8">
                    <div key={resetKey}>
                        <TabsContent value="alumno" className="mt-0">
                            <AlumnoForm mode={mode} onNext={() => setActiveTab('tutores')} />
                        </TabsContent>

                        <TabsContent value="tutores" className="mt-0">
                            <TutoresForm
                                mode={mode}
                                onNext={() => setActiveTab('salud')}
                                onBack={() => setActiveTab('alumno')}
                            />
                        </TabsContent>

                        <TabsContent value="salud" className="mt-0">
                            <FichaSaludForm
                                mode={mode}
                                onNext={() => setActiveTab('inscripcion')}
                                onBack={() => setActiveTab('tutores')}
                            />
                        </TabsContent>

                        <TabsContent value="inscripcion" className="mt-0">
                            <InscripcionForm
                                mode={mode}
                                onSubmit={handleFinalSubmit}
                                onBack={() => setActiveTab('salud')}
                                isSubmitting={isSubmitting}
                            />
                        </TabsContent>
                    </div>
                </Card>
            </Tabs>
        </div>
    )
}
