'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import AlumnoForm from './AlumnoForm'
import TutoresForm from './TutoresForm'
import FichaSaludForm from './FichaSaludForm'
import InscripcionForm from './InscripcionForm'
import { registrarInscripcionAction } from '@/lib/actions/inscripcion.actions'
import { formStorageService } from '@/lib/services/form-storage.service'
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function InscripcionTabs() {
    const [activeTab, setActiveTab] = useState('alumno')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleFinalSubmit = async () => {
        setIsSubmitting(true)
        setError(null)

        try {
            const allData = formStorageService.getAllFormData()

            // Validaciones básicas de que todos los tabs tienen datos
            if (!allData.alumno || !allData.tutores || !allData.fichaSalud || !allData.inscripcion) {
                throw new Error("Por favor complete todos los pasos del formulario antes de finalizar.")
            }

            const result = await registrarInscripcionAction(allData)

            if (result.success) {
                setSuccess(true)
                formStorageService.clearFormData()
            } else {
                setError(result.error || "Ocurrió un error inesperado al registrar la inscripción.")
            }
        } catch (err: any) {
            setError(err.message)
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
                    <h2 className="font-display text-4xl text-primary-900 italic">¡Inscripción Exitosa!</h2>
                    <p className="text-lg text-neutral-600 max-w-md mx-auto">
                        Los datos han sido registrados correctamente en nuestro sistema. El colegio se pondrá en contacto pronto.
                    </p>
                    <div className="pt-8">
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-primary-600 hover:bg-primary-700 text-white gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Nueva Inscripción
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto py-18">
            <div className="mb-12">
                <h1 className="font-display text-display text-primary-900 text-4xl mb-4">
                    Formulario de Inscripción
                </h1>
                <p className="text-lg text-neutral-800">
                    Siga los pasos para formalizar la inscripción del ciclo lectivo {new Date().getFullYear()}
                </p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-8 animate-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                    <TabsTrigger value="alumno" className="font-sans">
                        1. Alumno
                    </TabsTrigger>
                    <TabsTrigger value="tutores" className="font-sans">
                        2. Tutores
                    </TabsTrigger>
                    <TabsTrigger value="salud" className="font-sans">
                        3. Salud
                    </TabsTrigger>
                    <TabsTrigger value="inscripcion" className="font-sans">
                        4. Inscripción
                    </TabsTrigger>
                </TabsList>

                <Card className="p-8">
                    <TabsContent value="alumno" className="mt-0">
                        <AlumnoForm onNext={() => setActiveTab('tutores')} />
                    </TabsContent>

                    <TabsContent value="tutores" className="mt-0">
                        <TutoresForm
                            onNext={() => setActiveTab('salud')}
                            onBack={() => setActiveTab('alumno')}
                        />
                    </TabsContent>

                    <TabsContent value="salud" className="mt-0">
                        <FichaSaludForm
                            onNext={() => setActiveTab('inscripcion')}
                            onBack={() => setActiveTab('tutores')}
                        />
                    </TabsContent>

                    <TabsContent value="inscripcion" className="mt-0">
                        <InscripcionForm
                            onSubmit={handleFinalSubmit}
                            onBack={() => setActiveTab('salud')}
                            isSubmitting={isSubmitting}
                        />
                    </TabsContent>
                </Card>
            </Tabs>
        </div>
    )
}
