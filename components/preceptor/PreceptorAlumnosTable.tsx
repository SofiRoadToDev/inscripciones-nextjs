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
import { MoveHorizontal, ShieldCheck, ShieldAlert, Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
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
    total: number;
    currentPage: number;
    pageSize: number;
}

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { PreceptorAlumnosFilters } from './PreceptorAlumnosFilters';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Download } from 'lucide-react';

export function PreceptorAlumnosTable({ alumnos, cursos, total, currentPage, pageSize }: PreceptorAlumnosTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);

    // Estados para modales
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailData, setDetailData] = useState<any>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    const updateFilters = (updates: Record<string, string | number>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === 'all' || value === '') {
                params.delete(key);
            } else {
                params.set(key, value.toString());
            }
        });
        // Reiniciar a página 1 cuando cambian filtros, a menos que se especifique otra
        if (!updates.page) params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
    };

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

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Alumnos');

            // Definir columnas
            worksheet.columns = [
                { header: 'Apellido', key: 'apellido', width: 20 },
                { header: 'Nombre', key: 'nombre', width: 20 },
                { header: 'DNI', key: 'dni', width: 15 },
                { header: 'Curso', key: 'cursoNombre', width: 15 },
                { header: 'Seguro', key: 'seguro', width: 15 },
                { header: 'CUD', key: 'tieneCud', width: 10 },
                { header: 'Documentación', key: 'doc', width: 20 },
            ];

            // Agregar datos
            alumnos.forEach(alumno => {
                worksheet.addRow({
                    apellido: alumno.apellido,
                    nombre: alumno.nombre,
                    dni: alumno.dni,
                    cursoNombre: alumno.cursoNombre,
                    seguro: alumno.tieneSeguro ? 'Pagado' : 'Pendiente',
                    tieneCud: alumno.tieneCud ? 'Si' : 'No',
                    doc: alumno.documentacionCompleta ? 'Completa' : 'Incompleta',
                });
            });

            // Estilo para el encabezado
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `Alumnos_Filtrados_${new Date().toLocaleDateString()}.xlsx`);
            toast.success("Excel generado correctamente");
        } catch (error) {
            console.error("Error exportando excel:", error);
            toast.error("Error al exportar a Excel");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="flex-1 w-full">
                    <PreceptorAlumnosFilters cursos={cursos} />
                </div>
                <Button
                    onClick={handleExportExcel}
                    variant="outline"
                    className="w-full xl:w-auto border-green-600 text-green-700 hover:bg-green-50 gap-2 font-semibold shrink-0"
                >
                    <Download className="w-4 h-4" />
                    Exportar a Excel
                </Button>
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
                        {alumnos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    No se encontraron alumnos con los filtros seleccionados
                                </TableCell>
                            </TableRow>
                        ) : (
                            alumnos.map((alumno) => (
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

                {/* Pagination Controls inside table container */}
                <div className="px-6 py-4 bg-white border-t border-primary-50 flex items-center justify-between">
                    <p className="text-sm text-primary-500 font-medium">
                        Mostrando <span className="text-primary-900">{alumnos.length}</span> de <span className="text-primary-900">{total}</span> alumnos
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline" size="sm"
                            disabled={currentPage === 1}
                            onClick={() => updateFilters({ page: currentPage - 1 })}
                            className="border-primary-100"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline" size="sm"
                            disabled={currentPage * pageSize >= total}
                            onClick={() => updateFilters({ page: currentPage + 1 })}
                            className="border-primary-100"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
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
