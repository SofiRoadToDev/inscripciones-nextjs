import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { alumnoSchema, type AlumnoFormData } from '@/lib/validations/alumno.schema'
import { formStorageService } from '@/lib/services/form-storage.service'
import { buscarAlumnoPorDniAction } from '@/lib/actions/alumno.actions'
import { useProvincias } from '@/hooks/useProvincias'
import { useDepartamentos } from '@/hooks/useDepartamentos'
import { useLocalidades } from '@/hooks/useLocalidades'
import { Search, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"

interface AlumnoFormProps {
    onNext: () => void
}

export default function AlumnoForm({ onNext }: AlumnoFormProps) {
    const { provincias, loading: loadingProvincias, error: errorProvincias } = useProvincias()

    const [searchDni, setSearchDni] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [searchInfo, setSearchInfo] = useState<{ type: 'success' | 'error', message: string } | null>(null)

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
    })

    const { watch, setValue, reset } = form

    const selectedProvinciaId = watch('domicilio.provincia_id')
    const { departamentos, loading: loadingDepartamentos } = useDepartamentos(selectedProvinciaId)

    const selectedDepartamentoId = watch('domicilio.departamento_id')
    const { localidades, loading: loadingLocalidades } = useLocalidades(selectedDepartamentoId)

    // Cargar datos desde localStorage al montar
    useEffect(() => {
        const savedData = formStorageService.getTabData('alumno')
        if (savedData) {
            form.reset(savedData)
        }
    }, [form, reset])

    // Guardar datos al cambiar cualquier campo
    useEffect(() => {
        const subscription = watch((value) => {
            formStorageService.saveTabData('alumno', value)
        })
        return () => subscription.unsubscribe()
    }, [watch])

    const handleSearch = async () => {
        if (!searchDni || searchDni.length < 7) {
            setSearchInfo({ type: 'error', message: 'Ingrese un DNI válido para buscar.' })
            return
        }

        setIsSearching(true)
        setSearchInfo(null)

        try {
            const data = await buscarAlumnoPorDniAction(searchDni)

            if (data) {
                // 1. Resetear el formulario actual con los datos del alumno
                reset(data.alumno)

                // 2. Poblar localStorage para las otras tabs
                if (data.tutores) formStorageService.saveTabData('tutores', { tutores: data.tutores })
                if (data.fichaSalud) formStorageService.saveTabData('fichaSalud', data.fichaSalud)

                setSearchInfo({
                    type: 'success',
                    message: `¡Alumno encontrado! Se han precargado los datos personales, de domicilio, salud y tutores.`
                })
            } else {
                setSearchInfo({ type: 'error', message: 'No se encontraron datos previos para este DNI.' })
            }
        } catch (error) {
            console.error('Search error:', error)
            setSearchInfo({ type: 'error', message: 'Error al buscar datos. Intente nuevamente.' })
        } finally {
            setIsSearching(false)
        }
    }

    const onSubmit = (data: AlumnoFormData) => {
        console.log('Alumno data:', data)
        onNext()
    }

    return (
        <div className="space-y-8">
            {/* Buscador de DNI */}
            <Card className="p-6 border-primary-100 bg-primary-50/30">
                <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                        <h3 className="text-lg font-semibold text-primary-900 font-display flex items-center gap-2">
                            <Search className="w-5 h-5 text-primary-500" />
                            ¿Ya se inscribió antes?
                        </h3>
                        <p className="text-sm text-neutral-600">
                            Ingrese el DNI para recuperar automáticamente los datos de años anteriores.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Input
                                placeholder="Ingrese DNI del alumno..."
                                value={searchDni}
                                onChange={(e) => setSearchDni(e.target.value)}
                                className="pl-4 pr-10"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            disabled={isSearching}
                            variant="secondary"
                            className="bg-primary-100 text-primary-700 hover:bg-primary-200 border-none"
                        >
                            {isSearching ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Search className="w-4 h-4 mr-2" />
                            )}
                            Buscar
                        </Button>
                    </div>

                    {searchInfo && (
                        <Alert variant={searchInfo.type === 'success' ? 'default' : 'destructive'}
                            className={searchInfo.type === 'success' ? 'border-primary-200 bg-white' : ''}>
                            {searchInfo.type === 'success' ? (
                                <CheckCircle2 className="h-4 w-4 text-primary-500" />
                            ) : (
                                <AlertCircle className="h-4 w-4" />
                            )}
                            <AlertTitle>{searchInfo.type === 'success' ? '¡Éxito!' : 'Aviso'}</AlertTitle>
                            <AlertDescription>{searchInfo.message}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </Card>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Identificación */}
                        <div className="space-y-6 md:col-span-2">
                            <h3 className="text-xl font-semibold text-primary-600 border-b pb-2 font-display">Identificación</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="apellido"
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
                                    name="nombre"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej: Juan" {...field} />
                                            </FormControl>
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
                                            <FormControl>
                                                <Input placeholder="Sin puntos" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="fecha_nacimiento"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de Nacimiento</FormLabel>
                                            <FormControl>
                                                <Input placeholder="dd/mm/aaaa" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="nacionalidad"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nacionalidad</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
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
                                            <Select onValueChange={field.onChange} value={field.value || "Masculino"}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione" />
                                                    </SelectTrigger>
                                                </FormControl>
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
                            </div>
                        </div>

                        {/* Contacto */}
                        <div className="space-y-6 md:col-span-2">
                            <h3 className="text-xl font-semibold text-primary-600 border-b pb-2 font-display">Contacto</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email (opcional)</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="ejemplo@correo.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="telefono"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Teléfono (opcional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej: 2991234567" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Domicilio */}
                        <div className="space-y-6 md:col-span-2">
                            <h3 className="text-xl font-semibold text-primary-600 border-b pb-2 font-display">Domicilio</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="md:col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="domicilio.calle"
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
                                    name="domicilio.numero"
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
                                    name="domicilio.piso_depto"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Piso/Depto</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="domicilio.casa_lote"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Casa/Lote</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="domicilio.barrio_manzana_block"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Barrio/Manzana/Block</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Provincia */}
                                <FormField
                                    control={form.control}
                                    name="domicilio.provincia_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Provincia</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value)
                                                    setValue('domicilio.departamento_id', '')
                                                    setValue('domicilio.localidad_id', '')
                                                }}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={loadingProvincias ? "Cargando..." : "Seleccione"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {provincias.map((p) => (
                                                        <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Departamento */}
                                <FormField
                                    control={form.control}
                                    name="domicilio.departamento_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Departamento</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value)
                                                    setValue('domicilio.localidad_id', '')
                                                }}
                                                value={field.value}
                                                disabled={!selectedProvinciaId || loadingDepartamentos}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={
                                                            loadingDepartamentos ? "Cargando..." :
                                                                (!selectedProvinciaId ? "Elija Provincia" : "Seleccione")
                                                        } />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {departamentos.map((d) => (
                                                        <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Localidad */}
                                <FormField
                                    control={form.control}
                                    name="domicilio.localidad_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Localidad</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={!selectedDepartamentoId || loadingLocalidades}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={
                                                            loadingLocalidades ? "Cargando..." :
                                                                (!selectedDepartamentoId ? "Elija Depto" : "Seleccione")
                                                        } />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {localidades.map((l) => (
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
                    </div>

                    <div className="flex justify-end pt-6">
                        <Button type="submit" size="lg" className="bg-primary-500 hover:bg-primary-600 text-white px-8">
                            Siguiente Paso
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
