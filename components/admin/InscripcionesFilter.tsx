'use client';

import { useState, useEffect } from 'react';
import { Search, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';

interface InscripcionesFilterProps {
    onFilterChange: (filters: { search: string; estado: string }) => void;
    initialSearch?: string;
    initialEstado?: string;
}

export default function InscripcionesFilter({
    onFilterChange,
    initialSearch = '',
    initialEstado = 'todos'
}: InscripcionesFilterProps) {
    const [search, setSearch] = useState(initialSearch);
    const [estado, setEstado] = useState(initialEstado);
    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        onFilterChange({ search: debouncedSearch, estado });
    }, [debouncedSearch, estado, onFilterChange]);

    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
            <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 w-4 h-4" />
                <Input
                    placeholder="Buscar por DNI, Nombre o Apellido..."
                    className="pl-10 border-primary-100 focus-visible:ring-primary-500 bg-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                        <XCircle className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
                <select
                    className="bg-white border border-primary-100 rounded-lg px-4 py-2 text-sm text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                >
                    <option value="todos">Todos los estados</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="aprobada">Aprobadas</option>
                    <option value="rechazada">Rechazadas</option>
                </select>
            </div>
        </div>
    );
}
