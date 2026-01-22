export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      alumnos: {
        Row: {
          apellido: string
          created_at: string | null
          dni: string
          email: string | null
          fecha_nacimiento: string
          foto_url: string | null
          genero: string
          id: string
          nacionalidad: string
          nombre: string
          telefono: string | null
        }
        Insert: {
          apellido: string
          created_at?: string | null
          dni: string
          email?: string | null
          fecha_nacimiento: string
          foto_url?: string | null
          genero: string
          id?: string
          nacionalidad: string
          nombre: string
          telefono?: string | null
        }
        Update: {
          apellido?: string
          created_at?: string | null
          dni?: string
          email?: string | null
          fecha_nacimiento?: string
          foto_url?: string | null
          genero?: string
          id?: string
          nacionalidad?: string
          nombre?: string
          telefono?: string | null
        }
        Relationships: []
      }
      conceptos_pago: {
        Row: {
          activo: boolean | null
          created_at: string | null
          id: string
          monto: number
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          monto: number
          nombre: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          monto?: number
          nombre?: string
        }
        Relationships: []
      }
      cursos: {
        Row: {
          id: string
          nivel_codigo: string
          nombre: string
        }
        Insert: {
          id?: string
          nivel_codigo: string
          nombre: string
        }
        Update: {
          id?: string
          nivel_codigo?: string
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "cursos_nivel_codigo_fkey"
            columns: ["nivel_codigo"]
            isOneToOne: false
            referencedRelation: "niveles"
            referencedColumns: ["codigo"]
          },
        ]
      }
      departamentos: {
        Row: {
          id: string
          nombre: string
          provincia_id: string
        }
        Insert: {
          id?: string
          nombre: string
          provincia_id: string
        }
        Update: {
          id?: string
          nombre?: string
          provincia_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "departamentos_provincia_id_fkey"
            columns: ["provincia_id"]
            isOneToOne: false
            referencedRelation: "provincias"
            referencedColumns: ["id"]
          },
        ]
      }
      domicilios: {
        Row: {
          barrio_manzana_block: string | null
          calle: string
          casa_lote: string | null
          created_at: string | null
          departamento_id: string | null
          id: string
          localidad_id: string
          numero: string
          piso_depto: string | null
          provincia_id: string
        }
        Insert: {
          barrio_manzana_block?: string | null
          calle: string
          casa_lote?: string | null
          created_at?: string | null
          departamento_id?: string | null
          id?: string
          localidad_id: string
          numero: string
          piso_depto?: string | null
          provincia_id: string
        }
        Update: {
          barrio_manzana_block?: string | null
          calle?: string
          casa_lote?: string | null
          created_at?: string | null
          departamento_id?: string | null
          id?: string
          localidad_id?: string
          numero?: string
          piso_depto?: string | null
          provincia_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "domicilios_departamento_id_fkey"
            columns: ["departamento_id"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilios_localidad_id_fkey"
            columns: ["localidad_id"]
            isOneToOne: false
            referencedRelation: "localidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilios_provincia_id_fkey"
            columns: ["provincia_id"]
            isOneToOne: false
            referencedRelation: "provincias"
            referencedColumns: ["id"]
          },
        ]
      }
      escuelas_procedencia: {
        Row: {
          created_at: string | null
          cue: string | null
          id: string
          localidad: string
          nombre: string
        }
        Insert: {
          created_at?: string | null
          cue?: string | null
          id?: string
          localidad: string
          nombre: string
        }
        Update: {
          created_at?: string | null
          cue?: string | null
          id?: string
          localidad?: string
          nombre?: string
        }
        Relationships: []
      }
      fichas_salud: {
        Row: {
          alergias: string | null
          created_at: string | null
          discapacidad: string | null
          enfermedad_cronica: string | null
          id: string
          medicamentos: string | null
          observaciones: string | null
          vacunacion_completa: boolean | null
        }
        Insert: {
          alergias?: string | null
          created_at?: string | null
          discapacidad?: string | null
          enfermedad_cronica?: string | null
          id?: string
          medicamentos?: string | null
          observaciones?: string | null
          vacunacion_completa?: boolean | null
        }
        Update: {
          alergias?: string | null
          created_at?: string | null
          discapacidad?: string | null
          enfermedad_cronica?: string | null
          id?: string
          medicamentos?: string | null
          observaciones?: string | null
          vacunacion_completa?: boolean | null
        }
        Relationships: []
      }
      inscripciones: {
        Row: {
          alumno_id: string
          ciclo_lectivo: string
          created_at: string | null
          curso_id: string
          domicilio_id: string
          escuela_procedencia_id: string | null
          estado: string
          fecha_inscripcion: string | null
          ficha_salud_id: string
          id: string
          materias_pendientes: string | null
          nivel_codigo: string
          repite: boolean | null
          updated_at: string | null
        }
        Insert: {
          alumno_id: string
          ciclo_lectivo: string
          created_at?: string | null
          curso_id: string
          domicilio_id: string
          escuela_procedencia_id?: string | null
          estado?: string
          fecha_inscripcion?: string | null
          ficha_salud_id: string
          id?: string
          materias_pendientes?: string | null
          nivel_codigo: string
          repite?: boolean | null
          updated_at?: string | null
        }
        Update: {
          alumno_id?: string
          ciclo_lectivo?: string
          created_at?: string | null
          curso_id?: string
          domicilio_id?: string
          escuela_procedencia_id?: string | null
          estado?: string
          fecha_inscripcion?: string | null
          ficha_salud_id?: string
          id?: string
          materias_pendientes?: string | null
          nivel_codigo?: string
          repite?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscripciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_escuela_procedencia_id_fkey"
            columns: ["escuela_procedencia_id"]
            isOneToOne: false
            referencedRelation: "escuelas_procedencia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_ficha_salud_id_fkey"
            columns: ["ficha_salud_id"]
            isOneToOne: false
            referencedRelation: "fichas_salud"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_nivel_codigo_fkey"
            columns: ["nivel_codigo"]
            isOneToOne: false
            referencedRelation: "niveles"
            referencedColumns: ["codigo"]
          },
        ]
      }
      inscripciones_tutores: {
        Row: {
          created_at: string | null
          id: string
          inscripcion_id: string
          tutor_id: string
          vinculo: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          inscripcion_id: string
          tutor_id: string
          vinculo: string
        }
        Update: {
          created_at?: string | null
          id?: string
          inscripcion_id?: string
          tutor_id?: string
          vinculo?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscripciones_tutores_inscripcion_id_fkey"
            columns: ["inscripcion_id"]
            isOneToOne: false
            referencedRelation: "inscripciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_tutores_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutores"
            referencedColumns: ["id"]
          },
        ]
      }
      localidades: {
        Row: {
          departamento_id: string | null
          id: string
          nombre: string
          provincia_id: string
        }
        Insert: {
          departamento_id?: string | null
          id?: string
          nombre: string
          provincia_id: string
        }
        Update: {
          departamento_id?: string | null
          id?: string
          nombre?: string
          provincia_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "localidades_departamento_id_fkey"
            columns: ["departamento_id"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "localidades_provincia_id_fkey"
            columns: ["provincia_id"]
            isOneToOne: false
            referencedRelation: "provincias"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          count: number | null
          email: string
          id: string
          locked_until: string | null
          timestamp: string | null
        }
        Insert: {
          count?: number | null
          email: string
          id?: string
          locked_until?: string | null
          timestamp?: string | null
        }
        Update: {
          count?: number | null
          email?: string
          id?: string
          locked_until?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      niveles: {
        Row: {
          ciclo: string
          codigo: string
          edad_maxima: number
          nivel: number
        }
        Insert: {
          ciclo: string
          codigo: string
          edad_maxima: number
          nivel: number
        }
        Update: {
          ciclo?: string
          codigo?: string
          edad_maxima?: number
          nivel?: number
        }
        Relationships: []
      }
      pagos_inscripcion: {
        Row: {
          concepto_pago_id: string
          created_at: string | null
          fecha_pago: string | null
          id: string
          inscripcion_id: string
          monto: number
          pagado: boolean | null
        }
        Insert: {
          concepto_pago_id: string
          created_at?: string | null
          fecha_pago?: string | null
          id?: string
          inscripcion_id: string
          monto: number
          pagado?: boolean | null
        }
        Update: {
          concepto_pago_id?: string
          created_at?: string | null
          fecha_pago?: string | null
          id?: string
          inscripcion_id?: string
          monto?: number
          pagado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_inscripcion_concepto_pago_id_fkey"
            columns: ["concepto_pago_id"]
            isOneToOne: false
            referencedRelation: "conceptos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_inscripcion_inscripcion_id_fkey"
            columns: ["inscripcion_id"]
            isOneToOne: false
            referencedRelation: "inscripciones"
            referencedColumns: ["id"]
          },
        ]
      }
      provincias: {
        Row: {
          id: string
          nombre: string
        }
        Insert: {
          id?: string
          nombre: string
        }
        Update: {
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      tutores: {
        Row: {
          apellido: string
          created_at: string | null
          dni: string
          domicilio_id: string
          estudios: string | null
          id: string
          nombre: string
          ocupacion: string | null
          telefono: string
        }
        Insert: {
          apellido: string
          created_at?: string | null
          dni: string
          domicilio_id: string
          estudios?: string | null
          id?: string
          nombre: string
          ocupacion?: string | null
          telefono: string
        }
        Update: {
          apellido?: string
          created_at?: string | null
          dni?: string
          domicilio_id?: string
          estudios?: string | null
          id?: string
          nombre?: string
          ocupacion?: string | null
          telefono?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutores_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      crear_inscripcion_completa:
        | {
            Args: {
              p_alergias: string
              p_alumno_apellido: string
              p_alumno_dni: string
              p_alumno_email: string
              p_alumno_fecha_nacimiento: string
              p_alumno_foto_url: string
              p_alumno_genero: string
              p_alumno_nacionalidad: string
              p_alumno_nombre: string
              p_alumno_telefono: string
              p_ciclo_lectivo: string
              p_curso_id: string
              p_discapacidad: string
              p_domicilio_barrio: string
              p_domicilio_calle: string
              p_domicilio_casa_lote: string
              p_domicilio_departamento: string
              p_domicilio_localidad_id: string
              p_domicilio_numero: string
              p_domicilio_piso_depto: string
              p_domicilio_provincia_id: string
              p_enfermedad_cronica: string
              p_escuela_procedencia_id: string
              p_materias_pendientes: string
              p_medicamentos: string
              p_nivel_codigo: string
              p_observaciones: string
              p_repite: boolean
              p_tutores: Json
              p_vacunacion_completa: boolean
            }
            Returns: string
          }
        | {
            Args: {
              p_alergias: string
              p_alumno_apellido: string
              p_alumno_dni: string
              p_alumno_email: string
              p_alumno_fecha_nacimiento: string
              p_alumno_foto_url: string
              p_alumno_genero: string
              p_alumno_nacionalidad: string
              p_alumno_nombre: string
              p_alumno_telefono: string
              p_ciclo_lectivo: string
              p_curso_id: string
              p_discapacidad: string
              p_domicilio_barrio: string
              p_domicilio_calle: string
              p_domicilio_casa_lote: string
              p_domicilio_departamento_id: string
              p_domicilio_localidad_id: string
              p_domicilio_numero: string
              p_domicilio_piso_depto: string
              p_domicilio_provincia_id: string
              p_enfermedad_cronica: string
              p_escuela_procedencia_id: string
              p_materias_pendientes: string
              p_medicamentos: string
              p_nivel_codigo: string
              p_observaciones: string
              p_repite: boolean
              p_tutores: Json
              p_vacunacion_completa: boolean
            }
            Returns: string
          }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
