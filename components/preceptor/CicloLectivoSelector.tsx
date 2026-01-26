'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';

export function CicloLectivoSelector({ defaultValue }: { defaultValue: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const years = [
        (new Date().getFullYear() + 1).toString(),
        new Date().getFullYear().toString(),
        (new Date().getFullYear() - 1).toString(),
        (new Date().getFullYear() - 2).toString(),
    ];

    const currentCiclo = searchParams.get('ciclo') || defaultValue;

    const handleValueChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('ciclo', value);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary-600 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Ciclo Lectivo:
            </span>
            <Select value={currentCiclo} onValueChange={handleValueChange}>
                <SelectTrigger className="w-[120px] bg-white border-primary-200 text-primary-900 font-bold focus:ring-primary-500">
                    <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                    {years.map((y) => (
                        <SelectItem key={y} value={y} className="font-medium text-primary-900">
                            {y}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
