'use client';

import { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    Loader2,
    ShieldCheck,
    AlertTriangle,
    Users,
    Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getReporteSeguros, getCursos } from '@/lib/actions/admin.actions';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { cn } from '@/lib/utils';

export default function ReportesPage() {
    const [reporte, setReporte] = useState<any[]>([]);
    const [cursos, setCursos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cursoId, setCursoId] = useState('todos');
    const [estadoPago, setEstadoPago] = useState<'todos' | 'pagado' | 'debe'>('todos');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const loadInitial = async () => {
            const res = await getCursos();
            if (res.data) setCursos(res.data);
            fetchReporte();
        };
        loadInitial();
    }, [cursoId]);

    const fetchReporte = async () => {
        setLoading(true);
        const res = await getReporteSeguros(cursoId);
        if (res.data) setReporte(res.data);
        setLoading(false);
    };

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Seguros');

        worksheet.columns = [
            { header: 'Apellido', key: 'apellido', width: 20 },
            { header: 'Nombre', key: 'nombre', width: 20 },
            { header: 'DNI', key: 'dni', width: 15 },
            { header: 'Curso', key: 'curso', width: 20 },
            { header: 'Estado Seguro', key: 'estado', width: 15 },
            { header: 'Monto', key: 'monto', width: 10 },
        ];

        filteredReporte.forEach(item => {
            worksheet.addRow({
                apellido: item.alumno.apellido,
                nombre: item.alumno.nombre,
                dni: item.alumno.dni,
                curso: item.curso?.nombre || 'S/A',
                estado: item.pagado ? 'PAGADO' : 'DEBE',
                monto: item.monto
            });
        });

        // Estilos básicos para el encabezado
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Reporte_Seguros_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const filteredReporte = reporte.filter(item => {
        const matchSearch = (item.alumno.nombre + ' ' + item.alumno.apellido + ' ' + item.alumno.dni).toLowerCase().includes(search.toLowerCase());
        const matchEstado = estadoPago === 'todos' || (estadoPago === 'pagado' ? item.pagado : !item.pagado);
        return matchSearch && matchEstado;
    });

    const pagados = filteredReporte.filter(r => r.pagado).length;
    const deben = filteredReporte.filter(r => !r.pagado).length;
    const totalRecaudado = filteredReporte.reduce((acc, curr) => acc + (curr.monto || 0), 0);

    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-display text-primary-900 tracking-tight">Reporte de Seguros</h1>
                    <p className="text-primary-500 mt-2 font-medium">Control de cobertura del seguro escolar por curso.</p>
                </div>
                <Button
                    onClick={exportToExcel}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 shadow-lg transition-all active:scale-95"
                    disabled={filteredReporte.length === 0}
                >
                    <Download className="w-4 h-4" />
                    Exportar Excel
                </Button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Wallet className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-primary-400 tracking-widest">Recaudación</p>
                        <p className="text-2xl font-display text-primary-900">${totalRecaudado.toLocaleString('es-AR')}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-primary-400 tracking-widest">Pagados</p>
                        <p className="text-2xl font-display text-primary-900">{pagados}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                        <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-primary-400 tracking-widest">Deudores</p>
                        <p className="text-2xl font-display text-primary-900">{deben}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-primary-400 tracking-widest">Alumnos</p>
                        <p className="text-2xl font-display text-primary-900">{filteredReporte.length}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 w-4 h-4" />
                        <Input
                            placeholder="Buscar por DNI o Nombre..."
                            className="pl-10 border-primary-100 h-11"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex p-1 bg-primary-50 rounded-xl border border-primary-100 w-full md:w-auto overflow-x-auto no-scrollbar">
                        {[
                            { id: 'todos', label: 'Todos' },
                            { id: 'pagado', label: 'Pagados' },
                            { id: 'debe', label: 'Deudores' }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setEstadoPago(btn.id as any)}
                                className={cn(
                                    "px-6 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all",
                                    estadoPago === btn.id
                                        ? "bg-white text-primary-900 shadow-sm"
                                        : "text-primary-400 hover:text-primary-600"
                                )}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    <select
                        className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-2.5 text-sm text-primary-900 focus:ring-2 focus:ring-primary-500 min-w-[200px] h-11"
                        value={cursoId}
                        onChange={(e) => setCursoId(e.target.value)}
                    >
                        <option value="todos">Todos los Cursos</option>
                        {cursos.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre} - {c.turno}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="bg-white border border-primary-100 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-primary-50/50 border-b border-primary-100 text-[10px] font-black uppercase tracking-widest text-primary-400">
                                <th className="px-8 py-5">Alumno</th>
                                <th className="px-8 py-5">Curso</th>
                                <th className="px-8 py-5">DNI</th>
                                <th className="px-8 py-5 text-center">Estado Seguro</th>
                                <th className="px-8 py-5 text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-8"><div className="h-4 bg-primary-50 rounded" /></td>
                                    </tr>
                                ))
                            ) : filteredReporte.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-primary-400 font-display text-xl">
                                        No se encontraron resultados
                                    </td>
                                </tr>
                            ) : (
                                filteredReporte.map((item) => (
                                    <tr key={item.id} className="hover:bg-primary-50/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-primary-900 uppercase">{item.alumno.apellido}, {item.alumno.nombre}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <Badge variant="outline" className="bg-primary-50 text-primary-600 border-none font-mono">
                                                {item.curso?.nombre || 'S/A'}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-5 text-sm text-primary-500 font-medium">
                                            {item.alumno.dni}
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            {item.pagado ? (
                                                <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-xs uppercase">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Pagado
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2 text-rose-500 font-bold text-xs uppercase">
                                                    <XCircle className="w-4 h-4" />
                                                    Debe
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right font-display text-primary-900">
                                            {item.pagado ? `$${item.monto}` : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
