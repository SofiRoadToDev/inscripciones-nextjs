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
      detalles_pago: {
        Row: {
          concepto_pago_id: string
          created_at: string | null
          id: string
          monto: number
          pago_id: string
        }
        Insert: {
          concepto_pago_id: string
          created_at?: string | null
          id?: string
          monto: number
          pago_id: string
        }
        Update: {
          concepto_pago_id?: string
          created_at?: string | null
          id?: string
          monto?: number
          pago_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "detalles_pago_concepto_pago_id_fkey"
            columns: ["concepto_pago_id"]
            isOneToOne: false
            referencedRelation: "conceptos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detalles_pago_pago_id_fkey"
            columns: ["pago_id"]
            isOneToOne: false
            referencedRelation: "pagos"
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
          cud: boolean
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
          cud?: boolean
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
          cud?: boolean
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
      pagos: {
        Row: {
          created_at: string | null
          fecha_pago: string | null
          id: string
          inscripcion_id: string
          monto_total: number
          nro_recibo: number
          observaciones: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          fecha_pago?: string | null
          id?: string
          inscripcion_id: string
          monto_total: number
          nro_recibo?: number
          observaciones?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          fecha_pago?: string | null
          id?: string
          inscripcion_id?: string
          monto_total?: number
          nro_recibo?: number
          observaciones?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_inscripcion_id_fkey"
            columns: ["inscripcion_id"]
            isOneToOne: false
            referencedRelation: "inscripciones"
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
          p_domicilio_departamento_id: string
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
          p_cud: boolean
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

type PublicSchema = Database["public"]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
    PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
    PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof PublicSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never
