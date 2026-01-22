export type Role = 'admin' | 'preceptor';

export interface UserProfile {
    id: string;
    user_id: string;
    role: Role;
    nombre: string;
    created_at: string;
    updated_at: string;
}

export interface CursoScope {
    id: string;
    preceptor_id: string;
    curso_id: string;
    created_at: string;
}

export interface PreceptorWithCursos extends UserProfile {
    cursos: CursoScope[];
}
