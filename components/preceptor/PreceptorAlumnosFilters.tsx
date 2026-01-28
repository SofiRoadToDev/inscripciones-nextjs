'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface PreceptorAlumnosFiltersProps {
    cursos: Array<{ id: string; nombre: string }>;
}

export function PreceptorAlumnosFilters({ cursos }: PreceptorAlumnosFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    const cursoFilter = searchParams.get('cursoId') || 'all';
    const seguroFilter = searchParams.get('seguro') || 'all';
    const docFilter = searchParams.get('docRel') || 'all';
    const saludFilter = searchParams.get('salud') || 'all';
    const repiteFilter = searchParams.get('repitente') || 'all';

    const updateFilters = (updates: Record<string, string | number>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === 'all' || value === '') {
                params.delete(key);
            } else {
                params.set(key, value.toString());
            }
        });

        // Reiniciar a página 1 cuando cambian filtros
        if (!updates.page) params.set('page', '1');

        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            updateFilters({ search: searchTerm });
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre, apellido o DNI... (Enter)"
                    value={searchTerm}
                    onChange={handleSearch}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-9"
                />
            </div>

            <Select value={cursoFilter} onValueChange={(v) => updateFilters({ cursoId: v })}>
                <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filtrar por Curso" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los cursos</SelectItem>
                    {cursos.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                            {c.nombre}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={seguroFilter} onValueChange={(v) => updateFilters({ seguro: v })}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Estado de Seguro" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los seguros</SelectItem>
                    <SelectItem value="pago">Seguro Pagado</SelectItem>
                    <SelectItem value="pendiente">Seguro Pendiente</SelectItem>
                </SelectContent>
            </Select>

            <Select value={docFilter} onValueChange={(v) => updateFilters({ docRel: v })}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Documentación" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Ver Documentación</SelectItem>
                    <SelectItem value="completa">Completa</SelectItem>
                    <SelectItem value="pendiente">Incompleta</SelectItem>
                </SelectContent>
            </Select>

            <Select value={saludFilter} onValueChange={(v) => updateFilters({ salud: v })}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Salud/Inclusión" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas las condiciones</SelectItem>
                    <SelectItem value="cud">Con CUD</SelectItem>
                    <SelectItem value="discapacidad">Con Discapacidad</SelectItem>
                </SelectContent>
            </Select>

            <Select value={repiteFilter} onValueChange={(v) => updateFilters({ repitente: v })}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Condición Alumno" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los alumnos</SelectItem>
                    <SelectItem value="true">Repitentes</SelectItem>
                    <SelectItem value="false">No Repitentes</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
