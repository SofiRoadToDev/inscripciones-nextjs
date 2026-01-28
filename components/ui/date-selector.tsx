'use client'

import * as React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

/**
 * DateSelector Component
 *
 * Un selector de fecha adaptable compuesto por tres selects independientes (Día, Mes, Año).
 * Ideal para dispositivos móviles y formularios donde el datepicker nativo o de calendario es incómodo.
 *
 * Dependencias:
 * - @/components/ui/select (Shadcn UI)
 * - @/components/ui/label (Shadcn UI)
 */

interface DateSelectorProps {
    value?: string // Formato: YYYY-MM-DD
    onChange: (value: string) => void
    label?: string
    error?: string
    fromYear?: number // Año de inicio (por defecto: año actual - 100)
    toYear?: number   // Año de fin (por defecto: año actual)
}

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function DateSelector({
    value,
    onChange,
    label,
    error,
    fromYear,
    toYear
}: DateSelectorProps) {
    // Parsear valor inicial
    const initialDate = value ? new Date(value + 'T12:00:00') : null

    const [day, setDay] = React.useState<string>(initialDate ? initialDate.getDate().toString() : '')
    const [month, setMonth] = React.useState<string>(initialDate ? (initialDate.getMonth() + 1).toString() : '')
    const [year, setYear] = React.useState<string>(initialDate ? initialDate.getFullYear().toString() : '')

    // Generar opciones
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString())
    // Generar opciones de años
    const currentYear = new Date().getFullYear()
    const finalToYear = toYear || currentYear
    const finalFromYear = fromYear || (currentYear - 100)

    // Generar array de años desde el más reciente al más antiguo (o viceversa según se prefiera, aquí descendente)
    const years = Array.from(
        { length: finalToYear - finalFromYear + 1 },
        (_, i) => (finalToYear - i).toString()
    )

    React.useEffect(() => {
        if (day && month && year) {
            const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
            onChange(formattedDate)
        }
    }, [day, month, year, onChange])

    // Sincronizar si el valor externo cambia (ej: por búsqueda de DNI)
    React.useEffect(() => {
        if (value) {
            let date = new Date(value + 'T12:00:00')
            // Fallback for DD/MM/YYYY just in case
            if (isNaN(date.getTime()) && value.includes('/')) {
                const [d, m, y] = value.split('/')
                date = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T12:00:00`)
            }

            if (!isNaN(date.getTime())) {
                setDay(date.getDate().toString())
                setMonth((date.getMonth() + 1).toString())
                setYear(date.getFullYear().toString())
            }
        } else {
            setDay('')
            setMonth('')
            setYear('')
        }
    }, [value])

    return (
        <div className="space-y-2">
            {label && <Label className="text-sm font-medium text-neutral-700">{label}</Label>}
            <div className="grid grid-cols-3 gap-2">
                {/* Día */}
                <Select key={`day-${day}`} value={day || undefined} onValueChange={setDay}>
                    <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Día" />
                    </SelectTrigger>
                    <SelectContent>
                        {days.map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Mes */}
                <Select key={`month-${month}`} value={month || undefined} onValueChange={setMonth}>
                    <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Mes" />
                    </SelectTrigger>
                    <SelectContent>
                        {MESES.map((m, i) => (
                            <SelectItem key={m} value={(i + 1).toString()}>{m}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Año */}
                <Select key={`year-${year}`} value={year || undefined} onValueChange={setYear}>
                    <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map(y => (
                            <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    )
}
