Flujo de trabajo por fases:

### Fase 0: Setup ✅

    Configurar Next.js + Supabase + Tailwind
    Configurar Playwright
    Crear tema custom en tailwind.config
    Verificar: Build exitoso + conexión Supabase

### Fase 1: Schema DB + RLS ✅

    Diseñar tablas en Supabase
    Implementar RLS policies
    Crear stored procedure para transacción de inscripción
    Verificar: Queries manuales en Supabase Dashboard

### Fase 2: AlumnoForm (Tab 1) ✅

    UI + React Hook Form + Zod validation
    LocalStorage persistence service
    Custom UI Theme (Terra palette)
    Tests Playwright

    Verificar: Validaciones funcionan + navegación a Tab 2

Fase 3: TutoresForm (Tab 2) ✅

    UI + array de tutores + validaciones
    Tests Playwright
    Verificar: Agregar/eliminar tutores + navegación

Fase 4: FichaSaludForm (Tab 3) ✅

    UI + validaciones
    Tests Playwright
    Verificar: Navegación bidireccional

Fase 5: InscripcionForm (Tab 4) ✅

    UI + validaciones
    Submit con Server Action + transacción Supabase
    Test E2E completo
    Verificar: Datos en Supabase correctos

Fase 6: Dashboard Admin - Gestión y Reportes

    Auth + Protección de rutas administrativas
    Panel General: Filtros de búsqueda (DNI, Nombre, Apellido)
    Acciones: Aprobar/Rechazar inscripción
    Académico: Asignación a Cursos (Aulas Físicas)
    Tesorería: Registro de Seguro (Menor/Mayor) y Matrícula
    Documentación: Generación de PDF (Ficha vs Pagos)
    Exportación: Generación de archivos XLSX con filtros dinámicos

Fase 7: Landing Page y Pulido Final

    Página de inicio informativa
    UX/UI: Micro-animaciones y refinamiento de estilos
    Testing manual completo de todos los flujos

Fase 8: Deployment

    Dockerfile + Dokploy
    Variables de entorno para producción (Supabase Admin)
    Testing final en entorno de pre-producción / VPS
Fase 8: Deployment

    Dockerfile + Dokploy
    Variables entorno producción
    Testing en VPS




