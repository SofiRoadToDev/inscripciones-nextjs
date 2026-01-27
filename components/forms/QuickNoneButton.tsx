import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface QuickNoneButtonProps {
    value: string;
    onChange: (val: string) => void;
}

export function QuickNoneButton({ value, onChange }: QuickNoneButtonProps) {
    const isNone = value === '' || value === 'Ninguna' || value === 'No posee';

    const handleToggle = () => {
        if (isNone) {
            // Si ya está vacío o marcado como 'ninguna', el usuario quizás quiere escribir algo. Lo dejamos vacío para que escriba.
            // Opcional: Podríamos no hacer nada, pero dejarlo vacío es un buen "reset".
            onChange('');
        } else {
            // Si tiene texto, lo borramos (estado "vacío" que el usuario pidió como 'None')
            onChange('');
        }
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className={`h-6 px-2 text-xs font-medium rounded-full transition-colors ${!value ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                }`}
        >
            {!value ? 'Ninguna / No posee' : 'Limpiar'}
        </Button>
    )
}
