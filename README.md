# Sistema de Inscripciones - Colegio San Patricio

Sistema moderno de inscripciones construido con Next.js 16, TypeScript, Supabase y Tailwind CSS.

## 🚀 Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: Supabase (PostgreSQL)
- **Estilos**: Tailwind CSS v4 (Tema Custom Premium)
- **Formularios**: React Hook Form + Zod
- **Testing**: Playwright
- **Backend**: Supabase (Auth + Database + Storage)

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Configurar las variables de Supabase en .env.local
# NEXT_PUBLIC_SUPABASE_URL=tu-url-de-proyecto
# NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
# SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

## 🛠️ Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar servidor de producción
npm start

# Ejecutar linter
npm run lint
```

## 🧪 Testing

```bash
# Ejecutar tests E2E
npm run test

# Ejecutar tests con UI
npm run test:ui
```

## 🗄️ Supabase

```bash
# Iniciar Supabase local
npm run supabase:start

# Detener Supabase local
npm run supabase:stop

# Ver estado de Supabase
npm run supabase:status
```

## 🎨 Diseño

El proyecto utiliza un tema custom premium con:
- **Paleta**: Tonos tierra sofisticados (#8b7355) y verde oliva (#7a8450)
- **Tipografía**: Inter (sans-serif) + Instrument Serif (display)
- **Estética**: Minimalismo de alto impacto con espaciado generoso

## 📁 Estructura del Proyecto

```
app/
├── (public)/          # Rutas públicas
├── (admin)/           # Rutas administrativas (protegidas)
├── globals.css        # Estilos globales y tema Tailwind
└── layout.tsx         # Layout principal

lib/
└── supabase/
    ├── client.ts      # Cliente Supabase (browser)
    └── server.ts      # Cliente Supabase (server)

tests/                 # Tests E2E con Playwright
```

## 🔐 Seguridad

- Row Level Security (RLS) en todas las tablas
- Middleware para protección de rutas admin
- Validación server-side con Zod
- Bloqueo automático tras 3 intentos de login fallidos

## 📝 Fases de Desarrollo

- [x] **Fase 0**: Setup inicial
- [ ] **Fase 1**: Schema DB + RLS
- [ ] **Fase 2**: AlumnoForm (Tab 1)
- [ ] **Fase 3**: TutoresForm (Tab 2)
- [ ] **Fase 4**: InscripcionForm (Tab 3)
- [ ] **Fase 5**: FichaSaludForm (Tab 4)
- [ ] **Fase 6**: Panel Admin
- [ ] **Fase 7**: PDF + Landing
- [ ] **Fase 8**: Deployment

## 📄 Licencia

Privado - Colegio San Patricio
