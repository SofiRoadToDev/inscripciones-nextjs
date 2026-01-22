# Especificaciones del Proyecto - Sistema de Inscripciones Moderno

## 1. Visión General
Reingeniería completa del sistema de inscripciones del Colegio San Patricio. El objetivo es crear una experiencia de usuario premium, moderna y minimalista, migrando la lógica de negocio existente a un stack tecnológico de última generación.

## 2. Stack Tecnológico
- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: Supabase (PostgreSQL)
- **Estilos**: Tailwind CSS (Diseño Custom Premium, usando Shadcn UI, 100% a medida)
- **Backend**: Supabase (Auth + Database + Storage)
- **PDF**: React-pdf o similar para generación de documentos

## 3. Diseño & UX
- **Estética**: "Minimalismo de Alto Impacto".
  - Tipografía sans-serif moderna y grande.
  - Uso generoso de espacio en blanco (whitespace).
  - Paleta de colores sofisticada (no colores estándar).
  - Micro-interacciones y transiciones suaves.
- **Estructura**: Landing page integrada con el flujo de inscripción.

## 4. Funcionalidades Principales

### 4.1. Landing Page (Pública)
- Sección "Hero" impactante con información institucional clave.
- Acceso directo y visible al formulario de inscripción.
- Diseño responsive adaptado a móviles y escritorio.

### 4.2. Formulario de Inscripción
- Formulario multi-paso o "one-page" con scroll suave (a definir por UX).
- Pasos lógicos:
  1.  **Datos del Alumno**: Identificación, nacimiento, etc.
  2.  **Ubicación**: Domicilio y procedencia.
  3.  **Familia**: Datos de Tutores y vínculo.
  4.  **Salud & Académico**: Ficha médica básica y escolaridad.
- Validaciones robustas pero amigables.

### 4.3. Panel de Administrador
- Acceso restringido (Login).
- **Listado de Inscripciones**: Tabla moderna con filtros rápidos (Pendientes, Aprobadas).
- **Detalle de Inscripción**:
  - Visualización limpia de todos los datos cargados por el padre/tutor.
  - **Zona de Acción Administrativa**:
    - Input para `Seguro Escolar` (Moneda).
    - Input para `Arancel` (Moneda).
    - Botón de **Aprobación / Rechazo**.
- **Generación de PDF**:
  - Funcionalidad para exportar el "Comprobante de Inscripción".
  - Debe incluir: Datos del alumno, estado de aprobación, montos asignados (`seguro` y `arancel`) y fecha.

### 4.4. Seguridad
- **Autenticación**: Supabase Auth.
- **Protección de Datos**: Row Level Security (RLS) en todas las tablas.
- **Seguridad de Acceso**: Bloqueo automático tras 3 intentos fallidos de login (tabla `login_attempts` en Supabase).

## 5. Estructura de Datos (Supabase PostgreSQL)
Se adaptará el DER original a Postgres en Supabase, configurando RLS para acceso administrativo seguro:
- `users` (Admins - gestionado por Supabase Auth)
- `login_attempts` (Campos: email, count, timestamp, locked_until)
- `inscripciones` (Tabla central de hechos)
- `alumnos`
- `tutores`
- `domicilios`
- `fichas_salud`
- Tablas auxiliares (`provincias`, `localidades`, `niveles`, `cursos`)

## 6. Diferencias con la versión anterior
- Cambio de Stack (Laravel -> Next.js 16).
- Motor de BD (MySQL -> Supabase).
- Uso de Supabase para reducir costos y simplificar infraestructura (Auth, DB, Storage integrado).
- Sistema de bloqueo de seguridad por intentos fallidos.
- Inclusión de generación de PDF nativa en el flujo.
- Cambio de campos administrativos: Se renombre/refina el concepto de `aporte` a `arancel` y se asegura la gestión de `seguro_escolar`.
