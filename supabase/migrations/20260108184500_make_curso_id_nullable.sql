-- Migración para hacer curso_id nullable en inscripciones
-- Esto permite que el alumno se inscriba a un nivel y ciclo, 
-- pero que la asignación del curso específico (aula) sea administrativa.

ALTER TABLE inscripciones ALTER COLUMN curso_id DROP NOT NULL;

-- Actualizar el procedure para que p_curso_id sea opcional
-- (El procedure ya lo maneja pero es bueno documentarlo con el cambio de tabla)
COMMENT ON COLUMN inscripciones.curso_id IS 'Asignado administrativamente después de la inscripción inicial';
