-- Seed de datos para Provincias, Departamentos y Localidades (Salta y Jujuy)
-- Alumno de prueba para buscador de DNI

DO $$
DECLARE
    prov_salta_id UUID;
    prov_jujuy_id UUID;
    dept_capital_salta_id UUID;
    dept_oran_id UUID;
    dept_capital_jujuy_id UUID;
    alumno_id UUID;
    domicilio_id UUID;
    salud_id UUID;
    inscripcion_id UUID;
    curso_id UUID;
    escuela_id UUID;
BEGIN
    -- 1. Provincias
    INSERT INTO provincias (nombre) VALUES ('Salta') RETURNING id INTO prov_salta_id;
    INSERT INTO provincias (nombre) VALUES ('Jujuy') RETURNING id INTO prov_jujuy_id;

    -- 2. Departamentos Salta
    INSERT INTO departamentos (nombre, provincia_id) VALUES ('Capital', prov_salta_id) RETURNING id INTO dept_capital_salta_id;
    INSERT INTO departamentos (nombre, provincia_id) VALUES ('Orán', prov_salta_id) RETURNING id INTO dept_oran_id;
    
    -- 3. Departamentos Jujuy
    INSERT INTO departamentos (nombre, provincia_id) VALUES ('Dr. Manuel Belgrano', prov_jujuy_id) RETURNING id INTO dept_capital_jujuy_id;

    -- 4. Localidades
    INSERT INTO localidades (nombre, departamento_id, provincia_id) VALUES ('Salta Capital', dept_capital_salta_id, prov_salta_id);
    INSERT INTO localidades (nombre, departamento_id, provincia_id) VALUES ('San Ramón de la Nueva Orán', dept_oran_id, prov_salta_id);
    INSERT INTO localidades (nombre, departamento_id, provincia_id) VALUES ('San Salvador de Jujuy', dept_capital_jujuy_id, prov_jujuy_id);

    -- 5. Mas Maestros Necesarios (Cursos, Escuelas, etc para inscripcion historica)
    INSERT INTO niveles (codigo, nombre) VALUES ('SEC', 'Secundario') ON CONFLICT DO NOTHING;
    INSERT INTO cursos (nombre, nivel_codigo) VALUES ('1er Año', 'SEC') RETURNING id INTO curso_id;
    INSERT INTO escuelas_procedencia (nombre) VALUES ('Escuela Normal') RETURNING id INTO escuela_id;

    -- 6. Alumno de Prueba (DNI: 40000111)
    INSERT INTO alumnos (apellido, nombre, dni, fecha_nacimiento, nacionalidad, genero, email, telefono)
    VALUES ('Perez', 'Mariana', '40000111', '2010-05-15', 'Argentina', 'Femenino', 'mariana@test.com', '3871234567')
    RETURNING id INTO alumno_id;

    -- 7. Domicilio del Alumno
    INSERT INTO domicilios (calle, numero, provincia_id, departamento_id, localidad_id)
    VALUES ('Av. Belgrano', '1250', prov_salta_id, dept_capital_salta_id, (SELECT id FROM localidades WHERE nombre = 'Salta Capital' LIMIT 1))
    RETURNING id INTO domicilio_id;

    -- 8. Ficha de Salud
    INSERT INTO fichas_salud (enfermedad_cronica, vacunacion_completa)
    VALUES ('Ninguna', true)
    RETURNING id INTO salud_id;

    -- 9. Inscripción histórica (Año anterior)
    INSERT INTO inscripciones (alumno_id, domicilio_id, ficha_salud_id, ciclo_lectivo, curso_id, nivel_codigo, estado)
    VALUES (alumno_id, domicilio_id, salud_id, '2024', curso_id, 'SEC', 'aprobada')
    RETURNING id INTO inscripcion_id;

    RAISE NOTICE 'Seed completado. Alumno ID: %, DNI: 40000111', alumno_id;
END $$;
