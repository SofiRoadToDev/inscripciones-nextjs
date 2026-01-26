'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MoveHorizontal, Search, ShieldCheck, ShieldAlert, Pencil, Trash2, Eye, FileCheck, Accessibility, Loader2 } from 'lucide-react';
import { MoverAlumnoModal } from './MoverAlumnoModal';
import { EditarAlumnoModal } from './EditarAlumnoModal';
import { EliminarAlumnoDialog } from './EliminarAlumnoDialog';
import InscripcionDetalleModal from '@/components/admin/InscripcionDetalleModal';
import { getInscripcionDetalle } from '@/lib/actions/admin.actions';
import { toast } from 'sonner';

interface Alumno {
    id: string; // ID de inscripción
    alumnoId?: string; // ID real del alumno
    nombre: string;
    apellido: string;
    dni: string;
    cursoId: string;
    cursoNombre: string;
    tieneSeguro: boolean;
    tieneCud: boolean;
    discapacidad: string | null;
    documentacionCompleta: boolean;
}

interface PreceptorAlumnosTableProps {
    alumnos: Alumno[];
    cursos: Array<{ id: string; nombre: string }>;
}

export function PreceptorAlumnosTable({ alumnos, cursos }: PreceptorAlumnosTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [cursoFilter, setCursoFilter] = useState('all');
    const [seguroFilter, setSeguroFilter] = useState('all');
    const [docFilter, setDocFilter] = useState('all');
    const [saludFilter, setSaludFilter] = useState('all');
    const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);

    // Estados para modales
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailData, setDetailData] = useState<any>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    const filteredAlumnos = alumnos.filter((a) => {
        const matchesSearch =
            a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.dni.includes(searchTerm);

        const matchesCurso = cursoFilter === 'all' || a.cursoId === cursoFilter;

        const matchesSeguro =
            seguroFilter === 'all' ||
            (seguroFilter === 'pago' && a.tieneSeguro) ||
            (seguroFilter === 'pendiente' && !a.tieneSeguro);

        const matchesDoc =
            docFilter === 'all' ||
            (docFilter === 'completa' && a.documentacionCompleta) ||
            (docFilter === 'pendiente' && !a.documentacionCompleta);

        const matchesSalud =
            saludFilter === 'all' ||
            (saludFilter === 'cud' && a.tieneCud) ||
            (saludFilter === 'discapacidad' && a.discapacidad && a.discapacidad.trim() !== '');

        return matchesSearch && matchesCurso && matchesSeguro && matchesDoc && matchesSalud;
    });

    const handleMoveClick = (alumno: Alumno) => {
        setSelectedAlumno(alumno);
        setIsMoveModalOpen(true);
    };

    const handleEditClick = (alumno: Alumno) => {
        setSelectedAlumno(alumno);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (alumno: Alumno) => {
        setSelectedAlumno(alumno);
        setIsDeleteModalOpen(true);
    };

    const handleViewDetail = async (id: string) => {
        try {
            setIsLoadingDetail(true);
            const { data, error } = await getInscripcionDetalle(id);
            if (error) throw new Error(error);
            setDetailData(data);
            setIsDetailModalOpen(true);
        } catch (error: any) {
            toast.error("Error al cargar el detalle: " + error.message);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, apellido o DNI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={cursoFilter} onValueChange={setCursoFilter}>
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
                <Select value={seguroFilter} onValueChange={setSeguroFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Estado de Seguro" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los seguros</SelectItem>
                        <SelectItem value="pago">Seguro Pagado</SelectItem>
                        <SelectItem value="pendiente">Seguro Pendiente</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={docFilter} onValueChange={setDocFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Documentación" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Ver Documentación</SelectItem>
                        <SelectItem value="completa">Completa</SelectItem>
                        <SelectItem value="pendiente">Incompleta</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={saludFilter} onValueChange={setSaludFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Salud/Inclusión" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las condiciones</SelectItem>
                        <SelectItem value="cud">Con CUD</SelectItem>
                        <SelectItem value="discapacidad">Con Discapacidad</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-primary-100 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-neutral-50/50">
                        <TableRow>
                            <TableHead>Apellido</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>DNI</TableHead>
                            <TableHead>Curso</TableHead>
                            <TableHead className="text-center">Seguro Escolar</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAlumnos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    No se encontraron alumnos con los filtros seleccionados
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAlumnos.map((alumno) => (
                                <TableRow key={alumno.id} className="hover:bg-primary-50/30 transition-colors">
                                    <TableCell className="font-semibold text-primary-900">{alumno.apellido}</TableCell>
                                    <TableCell className="text-primary-800">{alumno.nombre}</TableCell>
                                    <TableCell className="text-primary-600 font-medium">{alumno.dni}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                                            {alumno.cursoNombre}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {alumno.tieneSeguro ? (
                                            <div className="flex items-center justify-center gap-1.5 text-green-600 font-bold text-xs uppercase tracking-wider">
                                                < ShieldCheck className="w-4 h-4" />
                                                Pagado
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-1.5 text-red-500 font-bold text-xs uppercase tracking-wider">
                                                <ShieldAlert className="w-4 h-4" />
                                                Pendiente
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-neutral-600 hover:text-neutral-700 hover:bg-neutral-50 p-2"
                                                title="Ver Detalle"
                                                disabled={isLoadingDetail}
                                                onClick={() => handleViewDetail(alumno.id)}
                                            >
                                                {isLoadingDetail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 gap-2"
                                                onClick={() => handleMoveClick(alumno)}
                                            >
                                                <MoveHorizontal className="h-4 w-4" />
                                                Mover
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-2"
                                                onClick={() => handleEditClick(alumno)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                                Editar
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                                                onClick={() => handleDeleteClick(alumno)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Eliminar
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <MoverAlumnoModal
                isOpen={isMoveModalOpen}
                onClose={() => setIsMoveModalOpen(false)}
                alumno={selectedAlumno}
                cursos={cursos}
            />

            <EditarAlumnoModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                alumnoId={selectedAlumno?.alumnoId || null}
            />

            <EliminarAlumnoDialog
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                alumno={selectedAlumno ? {
                    inscripcionId: selectedAlumno.id,
                    nombre: selectedAlumno.nombre,
                    apellido: selectedAlumno.apellido
                } : null}
            />

            <InscripcionDetalleModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                data={detailData}
                onUpdateStatus={async () => { }} // Preceptor no actualiza estado desde aquí
            />
        </div >
    );
}
