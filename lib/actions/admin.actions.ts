'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function getInscripcionesAdmin(params: {
    search?: string;
    estado?: string;
    nivel?: string;
    page?: number;
    ciclo?: string;
}) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const pageSize = 10;
    const start = ((params.page || 1) - 1) * pageSize;
    const cicloLectivo = params.ciclo || new Date().getFullYear().toString();

    let query = supabase
        .from('inscripciones')
        .select(`
      *,
      alumno:alumnos(id, nombre, apellido, dni),
      curso:cursos(id, nombre),
      nivel:niveles(codigo, nivel),
      ficha_salud:fichas_salud(id, discapacidad, cud)
    `, { count: 'exact' })
        .eq('ciclo_lectivo', cicloLectivo);

    // Filtros
    if (params.estado && params.estado !== 'todos') {
        query = query.eq('estado', params.estado);
    }

    if (params.search) {
        // We use a simpler approach: filter the nested alumno record.
        // For PostgREST to filter by related table while still returning all rows that match, 
        // we can use the 'foreignTable' option in 'or'.
        // However, if we want to filter the MAIN list based on alumno fields, 
        // we should ensure we are using !inner if we want to include ONLY those that match.

        // Let's use !inner to force the join to be an inner join for filtering
        query = supabase
            .from('inscripciones')
            .select(`
                *,
                alumno:alumnos!inner(id, nombre, apellido, dni),
                curso:cursos(id, nombre),
                nivel:niveles(codigo, nivel),
                ficha_salud:fichas_salud(id, discapacidad, cud)
            `, { count: 'exact' })
            .eq('ciclo_lectivo', cicloLectivo);

        if (params.estado && params.estado !== 'todos') {
            query = query.eq('estado', params.estado);
        }

        const searchTerm = `%${params.search}%`;
        query = query.or(`nombre.ilike.${searchTerm},apellido.ilike.${searchTerm},dni.ilike.${searchTerm}`, { foreignTable: 'alumnos' });
    }

    const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(start, start + pageSize - 1);

    if (error) {
        console.error('Error fetching inscripciones:', error);
        return { data: [], count: 0, error: error.message };
    }

    return { data, count };
}

export async function updateInscripcionStatus(id: string, estado: 'aprobada' | 'rechazada', motivo?: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
        .from('inscripciones')
        .update({
            estado,
            motivo_rechazo: motivo || null,
            audit_user_id: user?.id,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/admin');
    return { success: true };
}

export async function assignCurso(id: string, cursoId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
        .from('inscripciones')
        .update({
            curso_id: cursoId,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/admin');
    return { success: true };
}

export async function getInscripcionDetalle(id: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('inscripciones')
        .select(`
      *,
      alumno:alumnos(*),
      domicilio:domicilios(*, provincia:provincias(nombre), departamento:departamentos(nombre), localidad:localidades(nombre)),
      ficha_salud:fichas_salud(*),
      inscripciones_tutores(
        vinculo,
        tutor:tutores(
          *,
          domicilio:domicilios(*, provincia:provincias(nombre), departamento:departamentos(nombre), localidad:localidades(nombre))
        )
      )
    `)
        .eq('id', id)
        .single();

    if (error) return { error: error.message };
    return { data };
}

export async function getCursos() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase.from('cursos').select('*').order('nombre');
    if (error) return { error: error.message };
    return { data };
}

export async function getPagosAdmin(params: { search?: string; nivel?: string; page?: number; ciclo?: string }) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const pageSize = 10;
    const start = ((params.page || 1) - 1) * pageSize;
    const cicloLectivo = params.ciclo || new Date().getFullYear().toString();

    let query = supabase
        .from('inscripciones')
        .select(`
            id,
            created_at,
            nivel_codigo,
            repite,
            alumno:alumnos(*),
            curso:cursos(id, nombre),
            domicilio:domicilios(*, provincia:provincias(nombre), departamento:departamentos(nombre), localidad:localidades(nombre)),
            ficha_salud:fichas_salud(*),
            inscripciones_tutores(
                vinculo,
                tutor:tutores(*, domicilio:domicilios(*, provincia:provincias(nombre), departamento:departamentos(nombre), localidad:localidades(nombre)))
            ),
            pagos:pagos(
                id,
                monto_total,
                nro_recibo,
                fecha_pago,
                observaciones,
                detalles:detalles_pago(
                    id,
                    monto,
                    concepto:conceptos_pago(id, nombre)
                )
            )
        `, { count: 'exact' })
        .eq('estado', 'aprobada')
        .eq('ciclo_lectivo', cicloLectivo);

    if (params.nivel && params.nivel !== 'todos') {
        query = query.eq('nivel_codigo', params.nivel);
    }

    if (params.search) {
        const isNumeric = !isNaN(Number(params.search)) && params.search.trim() !== '';

        if (isNumeric) {
            // Search in alumno fields OR in pagos for the receipt number
            query = query.or(`alumno.dni.ilike.%${params.search}%,alumno.nombre.ilike.%${params.search}%,alumno.apellido.ilike.%${params.search}%,pagos.nro_recibo.eq.${params.search}`);
        } else {
            query = query.or(`alumno.dni.ilike.%${params.search}%,alumno.nombre.ilike.%${params.search}%,alumno.apellido.ilike.%${params.search}%`);
        }
    }

    const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(start, start + pageSize - 1);

    if (error) {
        console.error('Error fetching pagos:', error);
        return { data: [], count: 0, error: error.message };
    }

    return { data, count };
}

export async function registrarPago(params: {
    inscripcionId: string;
    pagos: Array<{
        conceptoId: string;
        monto: number;
    }>;
    fechaPago?: string;
    observaciones?: string;
}) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    const montoTotal = params.pagos.reduce((acc, p) => acc + p.monto, 0);

    // 1. Crear la cabecera del Pago
    const { data: pago, error: pagoError } = await supabase
        .from('pagos')
        .insert({
            inscripcion_id: params.inscripcionId,
            monto_total: montoTotal,
            fecha_pago: params.fechaPago || new Date().toISOString(),
            observaciones: params.observaciones,
            user_id: user?.id
        })
        .select()
        .single();

    if (pagoError || !pago) return { error: pagoError?.message || 'Error al crear cabecera de pago' };

    // 2. Crear los detalles de Pago
    const detallesData = params.pagos.map(item => ({
        pago_id: pago.id,
        concepto_pago_id: item.conceptoId,
        monto: item.monto
    }));

    const { error: detallesError } = await supabase
        .from('detalles_pago')
        .insert(detallesData);

    if (detallesError) return { error: detallesError.message };

    revalidatePath('/admin/tesoreria');
    return { success: true, pagoId: pago.id, nroRecibo: pago.nro_recibo };
}

export async function getConceptosPago() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase
        .from('conceptos_pago')
        .select('*')
        .eq('activo', true)
        .order('nombre');

    if (error) return { error: error.message };
    return { data };
}

export async function updateConceptoMonto(id: string, monto: number) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase
        .from('conceptos_pago')
        .update({ monto, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/admin/config');
    revalidatePath('/admin/tesoreria');
    return { success: true };
}

export async function createCurso(params: {
    division: string;
    nivelCodigo: string;
    turno: 'Mañana' | 'Tarde';
    codigoManual?: string;
}) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let nombreTecnico = params.codigoManual;

    if (!nombreTecnico) {
        // Generate technical name automatically if manual code is not provided
        // Anio comes from nivelCodigo (taking the first digits)
        const anio = params.nivelCodigo.match(/\d+/)?.[0] || '';

        // Nivel partial (CB or CS)
        // BUG FIX: nivelCodigo is like '1CB', '2CB'. It does NOT contain the full word 'Básico'.
        // So we check for 'CB' in the code itself.
        const nivelCod = params.nivelCodigo.includes('CB') ? 'CB' : 'CS';

        const turnoCod = params.turno === 'Mañana' ? 'TM' : 'TT';
        nombreTecnico = `${anio}${params.division}${nivelCod}${turnoCod}`;
    }

    const { error } = await supabase
        .from('cursos')
        .insert({
            nombre: nombreTecnico,
            nivel_codigo: params.nivelCodigo,
            turno: params.turno
        });

    if (error) return { error: error.message };
    revalidatePath('/admin/config');
    return { success: true };
}

export async function getAlumnosSinCurso(nivelCodigo: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('inscripciones')
        .select(`
            id,
            alumno:alumnos(id, nombre, apellido, dni, fecha_nacimiento, genero)
        `)
        .eq('nivel_codigo', nivelCodigo)
        .eq('estado', 'aprobada')
        .is('curso_id', null);

    if (error) return { error: error.message };
    return { data };
}

export async function asignarCursoMasivo(inscripcionIds: string[], cursoId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
        .from('inscripciones')
        .update({
            curso_id: cursoId,
            audit_user_id: user?.id
        })
        .in('id', inscripcionIds);

    if (error) return { error: error.message };

    revalidatePath('/admin');
    revalidatePath('/admin/config');
    return { success: true };
}

export async function deleteCurso(id: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase
        .from('cursos')
        .delete()
        .eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/admin/config');
    return { success: true };
}

export async function getReporteSeguros(cursoId?: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let query = supabase
        .from('inscripciones')
        .select(`
            id,
            estado,
            alumno:alumnos(id, nombre, apellido, dni),
            curso:cursos(id, nombre),
            pagos:pagos(
                id,
                monto_total,
                detalles:detalles_pago(
                    monto,
                    concepto:conceptos_pago(nombre)
                )
            )
        `)
        .eq('estado', 'aprobada');

    if (cursoId && cursoId !== 'todos') {
        query = query.eq('curso_id', cursoId);
    }

    const { data, error } = await query;

    if (error) return { error: error.message };

    // Process data to see who paid insurance (any concept containing "seguro")
    const reporte = data.map((ins: any) => {
        const allDetails = ins.pagos?.flatMap((p: any) => p.detalles || []) || [];
        const pagoSeguro = allDetails.find((d: any) =>
            d.concepto.nombre.toLowerCase().includes('seguro')
        );

        return {
            id: ins.id,
            alumno: ins.alumno,
            curso: ins.curso,
            pagado: !!pagoSeguro,
            monto: pagoSeguro?.monto || 0
        };
    });

    return { data: reporte };
}

export async function getAlumnosByCurso(cursoId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('inscripciones')
        .select(`
            id,
            created_at,
            nivel_codigo,
            repite,
            alumno:alumnos(*),
            domicilio:domicilios(*, provincia:provincias(nombre), departamento:departamentos(nombre), localidad:localidades(nombre)),
            ficha_salud:fichas_salud(*),
            inscripciones_tutores(
                vinculo,
                tutor:tutores(*, domicilio:domicilios(*, provincia:provincias(nombre), departamento:departamentos(nombre), localidad:localidades(nombre)))
            )
        `)
        .eq('curso_id', cursoId)
        .eq('estado', 'aprobada')
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };
    return { data };
}

export async function moverAlumnosCurso(origenId: string, destinoId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
        .from('inscripciones')
        .update({ curso_id: destinoId })
        .eq('curso_id', origenId);

    if (error) return { error: error.message };
    revalidatePath('/admin/config');
    return { success: true };
}

export async function eliminarAlumnosCurso(cursoId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Borramos pagos asociados primero (para evitar error de FK si no es cascade)
    // Buscamos inscripciones afectadas
    const { data: inscripciones } = await supabase
        .from('inscripciones')
        .select('id')
        .eq('curso_id', cursoId);

    if (inscripciones && inscripciones.length > 0) {
        const ids = inscripciones.map(i => i.id);

        // delete pagos (header + detail via cascade)
        await supabase.from('pagos').delete().in('inscripcion_id', ids);

        // delete tutores (many-to-many link)
        await supabase.from('inscripciones_tutores').delete().in('inscripcion_id', ids);
    }

    const { error } = await supabase
        .from('inscripciones')
        .delete()
        .eq('curso_id', cursoId);

    if (error) return { error: error.message };
    revalidatePath('/admin/config');
    return { success: true };
}

export async function eliminarInscripcion(id: string, deletePayments: boolean) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    if (deletePayments) {
        // Headers delete will cascade to details
        await supabase.from('pagos').delete().eq('inscripcion_id', id);
    }

    const { error } = await supabase
        .from('inscripciones')
        .delete()
        .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/admin');
    return { success: true };
}
