export interface Provincia {
    id: string;
    nombre: string;
}

export interface Departamento {
    id: string;
    nombre: string;
    provincia_id: string;
}

export interface Localidad {
    id: string;
    nombre: string;
    departamento_id: string;
    provincia_id: string;
}

export interface Domicilio {
    id: string;
    calle: string;
    numero: string;
    piso_depto?: string | null;
    casa_lote?: string | null;
    barrio_manzana_block?: string | null;
    provincia_id: string;
    departamento_id?: string;
    localidad_id: string;
    provincia?: Provincia;
    departamento?: Departamento;
    localidad?: Localidad;
}

export interface Alumno {
    id: string;
    apellido: string;
    nombre: string;
    dni: string;
    fecha_nacimiento: string; // ISO Date
    nacionalidad: string;
    genero: string;
    foto_url?: string | null;
    email?: string | null;
    telefono?: string | null;
}

export interface Tutor {
    id: string;
    apellido: string;
    nombre: string;
    dni: string;
    estudios?: string | null;
    ocupacion?: string | null;
    telefono: string;
    domicilio_id: string;
    domicilio?: Domicilio;
}

export interface InscripcionTutor {
    id: string;
    inscripcion_id: string;
    tutor_id: string;
    vinculo: string;
    tutor: Tutor;
}

export interface FichaSalud {
    id: string;
    enfermedad_cronica?: string | null;
    alergias?: string | null;
    discapacidad?: string | null;
    medicamentos?: string | null;
    vacunacion_completa: boolean;
    observaciones?: string | null;
}

export interface Curso {
    id: string;
    nombre: string;
    nivel_codigo: string;
    turno?: string;
}

export interface InscripcionCompleta {
    id: string;
    created_at: string;
    fecha_inscripcion: string;
    ciclo_lectivo: string;
    estado: 'pendiente' | 'aprobada' | 'rechazada';
    motivo_rechazo?: string | null;

    // Relaciones
    alumno: Alumno;
    domicilio: Domicilio; // Domicilio del alumno
    ficha_salud: FichaSalud;
    curso?: Curso | null;
    inscripciones_tutores: InscripcionTutor[];

    // Datos planos de inscripción
    nivel_codigo: string;
    repite: boolean;
    materias_pendientes?: string | null;
    escuela_procedencia?: string | null;
}
