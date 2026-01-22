-- =====================================================
-- ADICIÓN DE DEPARTAMENTOS Y REESTRUCTURACIÓN JERÁRQUICA
-- =====================================================

-- 1. Crear tabla de departamentos
CREATE TABLE departamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    provincia_id UUID NOT NULL REFERENCES provincias(id) ON DELETE CASCADE,
    UNIQUE(nombre, provincia_id)
);

-- 2. Modificar localidades para referenciar a departamentos
ALTER TABLE localidades ADD COLUMN departamento_id UUID REFERENCES departamentos(id) ON DELETE CASCADE;

-- 3. Modificar domicilios para referenciar a departamentos
-- Eliminamos el campo anterior de texto y agregamos el nuevo de UUID
ALTER TABLE domicilios DROP COLUMN departamento;
ALTER TABLE domicilios ADD COLUMN departamento_id UUID REFERENCES departamentos(id);

-- 4. Habilitar RLS en departamentos
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para departamentos
CREATE POLICY "Departamentos son públicos" ON departamentos FOR SELECT USING (true);
CREATE POLICY "Solo admins pueden modificar departamentos" ON departamentos FOR ALL USING (auth.role() = 'authenticated');

-- 6. Actualizar stored procedure crear_inscripcion_completa
CREATE OR REPLACE FUNCTION crear_inscripcion_completa(
    -- Datos del alumno
    p_alumno_apellido TEXT,
    p_alumno_nombre TEXT,
    p_alumno_dni TEXT,
    p_alumno_fecha_nacimiento DATE,
    p_alumno_nacionalidad TEXT,
    p_alumno_genero TEXT,
    p_alumno_foto_url TEXT,
    p_alumno_email TEXT,
    p_alumno_telefono TEXT,
    
    -- Datos del domicilio del alumno
    p_domicilio_calle TEXT,
    p_domicilio_numero TEXT,
    p_domicilio_piso_depto TEXT,
    p_domicilio_casa_lote TEXT,
    p_domicilio_barrio TEXT,
    p_domicilio_provincia_id UUID,
    p_domicilio_departamento_id UUID,
    p_domicilio_localidad_id UUID,
    
    -- Datos de la inscripción
    p_ciclo_lectivo TEXT,
    p_curso_id UUID,
    p_nivel_codigo TEXT,
    p_repite BOOLEAN,
    p_materias_pendientes TEXT,
    p_escuela_procedencia_id UUID,
    
    -- Datos de la ficha de salud
    p_enfermedad_cronica TEXT,
    p_alergias TEXT,
    p_discapacidad TEXT,
    p_medicamentos TEXT,
    p_vacunacion_completa BOOLEAN,
    p_observaciones TEXT,
    
    -- Datos de tutores (JSON array)
    p_tutores JSONB
)
RETURNS UUID AS $$
DECLARE
    v_alumno_id UUID;
    v_domicilio_id UUID;
    v_ficha_salud_id UUID;
    v_inscripcion_id UUID;
    v_tutor JSONB;
    v_tutor_id UUID;
    v_tutor_domicilio_id UUID;
BEGIN
    -- Crear alumno
    INSERT INTO alumnos (
        apellido, nombre, dni, fecha_nacimiento, nacionalidad, 
        genero, foto_url, email, telefono
    ) VALUES (
        p_alumno_apellido, p_alumno_nombre, p_alumno_dni, p_alumno_fecha_nacimiento,
        p_alumno_nacionalidad, p_alumno_genero, p_alumno_foto_url, p_alumno_email, p_alumno_telefono
    ) RETURNING id INTO v_alumno_id;
    
    -- Crear domicilio del alumno
    INSERT INTO domicilios (
        calle, numero, piso_depto, casa_lote, barrio_manzana_block,
        provincia_id, departamento_id, localidad_id
    ) VALUES (
        p_domicilio_calle, p_domicilio_numero, p_domicilio_piso_depto,
        p_domicilio_casa_lote, p_domicilio_barrio, p_domicilio_provincia_id,
        p_domicilio_departamento_id, p_domicilio_localidad_id
    ) RETURNING id INTO v_domicilio_id;
    
    -- Crear ficha de salud
    INSERT INTO fichas_salud (
        enfermedad_cronica, alergias, discapacidad, medicamentos,
        vacunacion_completa, observaciones
    ) VALUES (
        p_enfermedad_cronica, p_alergias, p_discapacidad, p_medicamentos,
        p_vacunacion_completa, p_observaciones
    ) RETURNING id INTO v_ficha_salud_id;
    
    -- Crear inscripción
    INSERT INTO inscripciones (
        alumno_id, domicilio_id, ficha_salud_id, ciclo_lectivo,
        curso_id, nivel_codigo, repite, materias_pendientes, escuela_procedencia_id
    ) VALUES (
        v_alumno_id, v_domicilio_id, v_ficha_salud_id, p_ciclo_lectivo,
        p_curso_id, p_nivel_codigo, p_repite, p_materias_pendientes, p_escuela_procedencia_id
    ) RETURNING id INTO v_inscripcion_id;
    
    -- Crear tutores y relaciones
    FOR v_tutor IN SELECT * FROM jsonb_array_elements(p_tutores)
    LOOP
        -- Crear domicilio del tutor
        INSERT INTO domicilios (
            calle, numero, piso_depto, casa_lote, barrio_manzana_block,
            provincia_id, departamento_id, localidad_id
        ) VALUES (
            v_tutor->>'domicilio_calle',
            v_tutor->>'domicilio_numero',
            v_tutor->>'domicilio_piso_depto',
            v_tutor->>'domicilio_casa_lote',
            v_tutor->>'domicilio_barrio',
            (v_tutor->>'domicilio_provincia_id')::UUID,
            (v_tutor->>'domicilio_departamento_id')::UUID,
            (v_tutor->>'domicilio_localidad_id')::UUID
        ) RETURNING id INTO v_tutor_domicilio_id;
        
        -- Crear tutor
        INSERT INTO tutores (
            apellido, nombre, dni, estudios, ocupacion, telefono, domicilio_id
        ) VALUES (
            v_tutor->>'apellido',
            v_tutor->>'nombre',
            v_tutor->>'dni',
            v_tutor->>'estudios',
            v_tutor->>'ocupacion',
            v_tutor->>'telefono',
            v_tutor_domicilio_id
        ) RETURNING id INTO v_tutor_id;
        
        -- Crear relación inscripción-tutor
        INSERT INTO inscripciones_tutores (
            inscripcion_id, tutor_id, vinculo
        ) VALUES (
            v_inscripcion_id, v_tutor_id, v_tutor->>'vinculo'
        );
    END LOOP;
    
    RETURN v_inscripcion_id;
END;
$$ LANGUAGE plpgsql;
