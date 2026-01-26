'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function getInscripcionesAdmin(params: {
    search?: string;
    estado?: string;
    nivel?: string;
    page?: number;
}) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const pageSize = 10;
    const start = ((params.page || 1) - 1) * pageSize;

    let query = supabase
        .from('inscripciones')
        .select(`
      *,
      alumno:alumnos(id, nombre, apellido, dni),
      curso:cursos(id, nombre),
      nivel:niveles(codigo, nivel)
    `, { count: 'exact' });

    // Filtros
    if (params.estado && params.estado !== 'todos') {
        query = query.eq('estado', params.estado);
    }

    if (params.search) {
        // Nota: Para búsqueda por nombre/apellido/dni combinados en Supabase/Postgres
        // se suele usar or() o una vista. Aquí usaremos or() básico en el alumno.
        query = query.or(`dni.ilike.%${params.search}%,nombre.ilike.%${params.search}%,apellido.ilike.%${params.search}%`, { foreignTable: 'alumnos' });
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

export async function getPagosAdmin(params: { search?: string; nivel?: string; page?: number }) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const pageSize = 10;
    const start = ((params.page || 1) - 1) * pageSize;

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
            pagos:pagos_inscripcion(
                id,
                monto,
                pagado,
                fecha_pago,
                observaciones,
                nro_recibo,
                concepto:conceptos_pago(id, nombre)
            )
        `, { count: 'exact' })
        .eq('estado', 'aprobada');

    if (params.nivel && params.nivel !== 'todos') {
        query = query.eq('nivel_codigo', params.nivel);
    }

    if (params.search) {
        query = query.or(`dni.ilike.%${params.search}%,nombre.ilike.%${params.search}%,apellido.ilike.%${params.search}%`, { foreignTable: 'alumnos' });
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

    for (const pago of params.pagos) {
        // Check if exists for this specific concepto
        const { data: existing } = await supabase
            .from('pagos_inscripcion')
            .select('id')
            .eq('inscripcion_id', params.inscripcionId)
            .eq('concepto_pago_id', pago.conceptoId)
            .single();

        if (existing) {
            await supabase
                .from('pagos_inscripcion')
                .update({
                    monto: pago.monto,
                    pagado: true,
                    fecha_pago: params.fechaPago || new Date().toISOString(),
                    observaciones: params.observaciones,
                    user_id: user?.id
                })
                .eq('id', existing.id);
        } else {
            await supabase
                .from('pagos_inscripcion')
                .insert({
                    inscripcion_id: params.inscripcionId,
                    concepto_pago_id: pago.conceptoId,
                    monto: pago.monto,
                    pagado: true,
                    fecha_pago: params.fechaPago || new Date().toISOString(),
                    observaciones: params.observaciones,
                    user_id: user?.id
                });
        }
    }

    revalidatePath('/admin/tesoreria');
    return { success: true };
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
            pagos:pagos_inscripcion(
                id,
                pagado,
                monto,
                concepto:conceptos_pago(nombre)
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
        const pagoSeguro = ins.pagos?.find((p: any) =>
            p.concepto.nombre.toLowerCase().includes('seguro') && p.pagado
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

        // delete pagos
        await supabase.from('pagos_inscripcion').delete().in('inscripcion_id', ids);

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
