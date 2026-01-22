-- =====================================================
-- SISTEMA DE INSCRIPCIONES - COLEGIO SAN PATRICIO
-- Migración Inicial - Schema Completo
-- =====================================================

-- =====================================================
-- TABLAS DE CATÁLOGO
-- =====================================================

-- Provincias
CREATE TABLE provincias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE
);

-- Localidades
CREATE TABLE localidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    provincia_id UUID NOT NULL REFERENCES provincias(id) ON DELETE CASCADE
);

-- Niveles educativos
CREATE TABLE niveles (
    codigo TEXT PRIMARY KEY,
    nivel INTEGER NOT NULL,
    ciclo TEXT NOT NULL CHECK (ciclo IN ('Básico', 'Superior')),
    edad_maxima INTEGER NOT NULL
);

-- Cursos
CREATE TABLE cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    nivel_codigo TEXT NOT NULL REFERENCES niveles(codigo) ON DELETE CASCADE
);

-- Escuelas de procedencia
CREATE TABLE escuelas_procedencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cue TEXT UNIQUE,
    nombre TEXT NOT NULL,
    localidad TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conceptos de pago
CREATE TABLE conceptos_pago (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    monto NUMERIC(10, 2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLAS DE SEGURIDAD
-- =====================================================

-- Intentos de login
CREATE TABLE login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    locked_until TIMESTAMPTZ
);

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- Domicilios
CREATE TABLE domicilios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calle TEXT NOT NULL,
    numero TEXT NOT NULL,
    piso_depto TEXT,
    casa_lote TEXT,
    barrio_manzana_block TEXT,
    provincia_id UUID NOT NULL REFERENCES provincias(id),
    departamento TEXT NOT NULL,
    localidad_id UUID NOT NULL REFERENCES localidades(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alumnos
CREATE TABLE alumnos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apellido TEXT NOT NULL,
    nombre TEXT NOT NULL,
    dni TEXT NOT NULL UNIQUE,
    fecha_nacimiento DATE NOT NULL,
    nacionalidad TEXT NOT NULL,
    genero TEXT NOT NULL,
    foto_url TEXT,
    email TEXT,
    telefono TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tutores
CREATE TABLE tutores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apellido TEXT NOT NULL,
    nombre TEXT NOT NULL,
    dni TEXT NOT NULL,
    estudios TEXT,
    ocupacion TEXT,
    telefono TEXT NOT NULL,
    domicilio_id UUID NOT NULL REFERENCES domicilios(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fichas de salud
CREATE TABLE fichas_salud (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enfermedad_cronica TEXT,
    alergias TEXT,
    discapacidad TEXT,
    medicamentos TEXT,
    vacunacion_completa BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inscripciones (Tabla central)
CREATE TABLE inscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
    domicilio_id UUID NOT NULL REFERENCES domicilios(id),
    ficha_salud_id UUID NOT NULL REFERENCES fichas_salud(id),
    fecha_inscripcion TIMESTAMPTZ DEFAULT NOW(),
    ciclo_lectivo TEXT NOT NULL,
    curso_id UUID NOT NULL REFERENCES cursos(id),
    nivel_codigo TEXT NOT NULL REFERENCES niveles(codigo),
    repite BOOLEAN DEFAULT FALSE,
    materias_pendientes TEXT,
    escuela_procedencia_id UUID REFERENCES escuelas_procedencia(id),
    estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relación Inscripciones - Tutores
CREATE TABLE inscripciones_tutores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inscripcion_id UUID NOT NULL REFERENCES inscripciones(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES tutores(id) ON DELETE CASCADE,
    vinculo TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(inscripcion_id, tutor_id)
);

-- Pagos de inscripción
CREATE TABLE pagos_inscripcion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inscripcion_id UUID NOT NULL REFERENCES inscripciones(id) ON DELETE CASCADE,
    concepto_pago_id UUID NOT NULL REFERENCES conceptos_pago(id),
    monto NUMERIC(10, 2) NOT NULL,
    pagado BOOLEAN DEFAULT FALSE,
    fecha_pago TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX idx_alumnos_dni ON alumnos(dni);
CREATE INDEX idx_inscripciones_estado ON inscripciones(estado);
CREATE INDEX idx_inscripciones_alumno ON inscripciones(alumno_id);
CREATE INDEX idx_inscripciones_ciclo ON inscripciones(ciclo_lectivo);
CREATE INDEX idx_pagos_inscripcion ON pagos_inscripcion(inscripcion_id);
CREATE INDEX idx_localidades_provincia ON localidades(provincia_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Actualizar updated_at en inscripciones
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inscripciones_updated_at
    BEFORE UPDATE ON inscripciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE provincias ENABLE ROW LEVEL SECURITY;
ALTER TABLE localidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE niveles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE escuelas_procedencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE conceptos_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE domicilios ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_salud ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones_tutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_inscripcion ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS - CATÁLOGOS (Lectura pública)
-- =====================================================

-- Provincias
CREATE POLICY "Provincias son públicas" ON provincias FOR SELECT USING (true);
CREATE POLICY "Solo admins pueden modificar provincias" ON provincias FOR ALL USING (auth.role() = 'authenticated');

-- Localidades
CREATE POLICY "Localidades son públicas" ON localidades FOR SELECT USING (true);
CREATE POLICY "Solo admins pueden modificar localidades" ON localidades FOR ALL USING (auth.role() = 'authenticated');

-- Niveles
CREATE POLICY "Niveles son públicos" ON niveles FOR SELECT USING (true);
CREATE POLICY "Solo admins pueden modificar niveles" ON niveles FOR ALL USING (auth.role() = 'authenticated');

-- Cursos
CREATE POLICY "Cursos son públicos" ON cursos FOR SELECT USING (true);
CREATE POLICY "Solo admins pueden modificar cursos" ON cursos FOR ALL USING (auth.role() = 'authenticated');

-- Escuelas de procedencia
CREATE POLICY "Escuelas son públicas" ON escuelas_procedencia FOR SELECT USING (true);
CREATE POLICY "Cualquiera puede crear escuelas" ON escuelas_procedencia FOR INSERT WITH CHECK (true);
CREATE POLICY "Solo admins pueden modificar escuelas" ON escuelas_procedencia FOR UPDATE USING (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICAS RLS - CONCEPTOS DE PAGO (Solo admins)
-- =====================================================

CREATE POLICY "Solo admins ven conceptos de pago" ON conceptos_pago FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Solo admins modifican conceptos de pago" ON conceptos_pago FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICAS RLS - INSCRIPCIONES
-- =====================================================

-- Cualquiera puede crear inscripciones (formulario público)
CREATE POLICY "Cualquiera puede crear inscripciones" ON inscripciones FOR INSERT WITH CHECK (true);
CREATE POLICY "Cualquiera puede crear alumnos" ON alumnos FOR INSERT WITH CHECK (true);
CREATE POLICY "Cualquiera puede crear domicilios" ON domicilios FOR INSERT WITH CHECK (true);
CREATE POLICY "Cualquiera puede crear tutores" ON tutores FOR INSERT WITH CHECK (true);
CREATE POLICY "Cualquiera puede crear fichas de salud" ON fichas_salud FOR INSERT WITH CHECK (true);
CREATE POLICY "Cualquiera puede crear relaciones tutores" ON inscripciones_tutores FOR INSERT WITH CHECK (true);

-- Solo admins pueden ver y modificar inscripciones
CREATE POLICY "Solo admins ven inscripciones" ON inscripciones FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Solo admins modifican inscripciones" ON inscripciones FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Solo admins ven alumnos" ON alumnos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Solo admins ven domicilios" ON domicilios FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Solo admins ven tutores" ON tutores FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Solo admins ven fichas de salud" ON fichas_salud FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Solo admins ven relaciones tutores" ON inscripciones_tutores FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICAS RLS - PAGOS (Solo admins)
-- =====================================================

CREATE POLICY "Solo admins ven pagos" ON pagos_inscripcion FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Solo admins modifican pagos" ON pagos_inscripcion FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICAS RLS - LOGIN ATTEMPTS
-- =====================================================

CREATE POLICY "Cualquiera puede registrar intentos de login" ON login_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Cualquiera puede ver sus intentos" ON login_attempts FOR SELECT USING (true);
CREATE POLICY "Solo admins pueden modificar intentos" ON login_attempts FOR UPDATE USING (auth.role() = 'authenticated');

-- =====================================================
-- STORED PROCEDURE - CREAR INSCRIPCIÓN COMPLETA
-- =====================================================

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
    p_domicilio_departamento TEXT,
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
        provincia_id, departamento, localidad_id
    ) VALUES (
        p_domicilio_calle, p_domicilio_numero, p_domicilio_piso_depto,
        p_domicilio_casa_lote, p_domicilio_barrio, p_domicilio_provincia_id,
        p_domicilio_departamento, p_domicilio_localidad_id
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
            provincia_id, departamento, localidad_id
        ) VALUES (
            v_tutor->>'domicilio_calle',
            v_tutor->>'domicilio_numero',
            v_tutor->>'domicilio_piso_depto',
            v_tutor->>'domicilio_casa_lote',
            v_tutor->>'domicilio_barrio',
            (v_tutor->>'domicilio_provincia_id')::UUID,
            v_tutor->>'domicilio_departamento',
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
