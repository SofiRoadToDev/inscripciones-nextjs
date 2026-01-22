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
          turno: Database["public"]["Enums"]["turno"] | null
        }
        Insert: {
          id?: string
          nivel_codigo: string
          nombre: string
          turno?: Database["public"]["Enums"]["turno"] | null
        }
        Update: {
          id?: string
          nivel_codigo?: string
          nombre?: string
          turno?: Database["public"]["Enums"]["turno"] | null
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
          departamento: string
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
          departamento: string
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
          departamento?: string
          id?: string
          localidad_id?: string
          numero?: string
          piso_depto?: string | null
          provincia_id?: string
        }
        Relationships: [
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
          audit_user_id: string | null
          ciclo_lectivo: string
          created_at: string | null
          curso_id: string | null
          domicilio_id: string
          escuela_procedencia_id: string | null
          estado: string
          ficha_salud_id: string
          id: string
          materias_pendientes: string | null
          motivo_rechazo: string | null
          nivel_codigo: string
          repite: boolean | null
          updated_at: string | null
        }
        Insert: {
          alumno_id: string
          audit_user_id?: string | null
          ciclo_lectivo: string
          created_at?: string | null
          curso_id?: string | null
          domicilio_id: string
          escuela_procedencia_id?: string | null
          estado?: string
          ficha_salud_id: string
          id?: string
          materias_pendientes?: string | null
          motivo_rechazo?: string | null
          nivel_codigo: string
          repite?: boolean | null
          updated_at?: string | null
        }
        Update: {
          alumno_id?: string
          audit_user_id?: string | null
          ciclo_lectivo?: string
          created_at?: string | null
          curso_id?: string | null
          domicilio_id?: string
          escuela_procedencia_id?: string | null
          estado?: string
          ficha_salud_id?: string
          id?: string
          materias_pendientes?: string | null
          motivo_rechazo?: string | null
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
          observaciones: string | null
          pagado: boolean | null
          user_id: string | null
        }
        Insert: {
          concepto_pago_id: string
          created_at?: string | null
          fecha_pago?: string | null
          id?: string
          inscripcion_id: string
          monto: number
          observaciones?: string | null
          pagado?: boolean | null
          user_id?: string | null
        }
        Update: {
          concepto_pago_id?: string
          created_at?: string | null
          fecha_pago?: string | null
          id?: string
          inscripcion_id?: string
          monto?: number
          observaciones?: string | null
          pagado?: boolean | null
          user_id?: string | null
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
      preceptor_cursos: {
        Row: {
          created_at: string | null
          curso_id: string
          id: string
          preceptor_id: string
        }
        Insert: {
          created_at?: string | null
          curso_id: string
          id?: string
          preceptor_id: string
        }
        Update: {
          created_at?: string | null
          curso_id?: string
          id?: string
          preceptor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preceptor_cursos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preceptor_cursos_preceptor_id_fkey"
            columns: ["preceptor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          apellido: string | null
          created_at: string | null
          dni: string | null
          id: string
          nombre: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          apellido?: string | null
          created_at?: string | null
          dni?: string | null
          id?: string
          nombre: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          apellido?: string | null
          created_at?: string | null
          dni?: string | null
          id?: string
          nombre?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      crear_inscripcion_completa: {
        Args: {
          p_alumno_apellido: string
          p_alumno_nombre: string
          p_alumno_dni: string
          p_alumno_fecha_nacimiento: string
          p_alumno_nacionalidad: string
          p_alumno_genero: string
          p_alumno_foto_url: string
          p_alumno_email: string
          p_alumno_telefono: string
          p_domicilio_calle: string
          p_domicilio_numero: string
          p_domicilio_piso_depto: string
          p_domicilio_casa_lote: string
          p_domicilio_barrio: string
          p_domicilio_provincia_id: string
          p_domicilio_departamento: string
          p_domicilio_localidad_id: string
          p_ciclo_lectivo: string
          p_curso_id: string
          p_nivel_codigo: string
          p_repite: boolean
          p_materias_pendientes: string
          p_escuela_procedencia_id: string
          p_enfermedad_cronica: string
          p_alergias: string
          p_discapacidad: string
          p_medicamentos: string
          p_vacunacion_completa: boolean
          p_observaciones: string
          p_tutores: Json
        }
        Returns: string
      }
    }
    Enums: {
      turno: "Mañana" | "Tarde"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof Database
}
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      turno: ["Mañana", "Tarde"],
    },
  },
} as const
