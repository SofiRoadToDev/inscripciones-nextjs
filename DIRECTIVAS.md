Buenas Prácticas Next.js + Supabase:

Next.js:

    Server Components por defecto, Client Components solo con "use client"
    Route groups: app/(public), app/(admin)
    Middleware para protección de rutas admin
    Server Actions para mutations
    Loading.tsx y error.tsx en cada ruta
    Metadata API para SEO
    Image component para optimización automática
    Lazy loading de componentes pesados

Supabase:

    Row Level Security (RLS) en todas las tablas
    Políticas restrictivas por defecto
    Service role key solo en server-side
    Anon key para cliente
    Índices en foreign keys
    Stored procedures para transacciones complejas
    Variables de entorno (.env.local) para keys

Tailwind:

    tailwind.config.ts con tema custom (colors, fonts)
    Design tokens centralizados
    Variables CSS para valores dinámicos
    Clases utilitarias propias (@layer components)
    Mobile-first approach

Seguridad:

    Validación server-side obligatoria
    Sanitización de inputs
    CSRF protection (Next.js built-in)
    Rate limiting en endpoints críticos
    Tabla login_attempts con timestamp
    Headers de seguridad en next.config

Performance:

    Dynamic imports para formularios
    Suspense boundaries
    Optimistic updates
    Cache de Supabase queries
    Debounce en búsquedas/filtros

React Hook Form:

    Un FormProvider envolviendo las 4 tabs
    useFormContext en cada tab component
    Zod schemas para validación por tab
    watch() para estado reactivo entre tabs
    handleSubmit solo en última tab
    Server Action para submit final

Testing (Playwright):

    Setup inicial: npm init playwright@latest
    Estructura: tests/ con spec por tab
    Tests por tab: validaciones, navegación, persistencia estado
    Test E2E completo: flujo 4 tabs + submit a Supabase
    Mock de Supabase para tests rápidos
    CI/CD: ejecutar tests en cada commit
    Base de datos de test separada

Código:

    TypeScript strict mode
    Tipos generados desde Supabase CLI
    Zod para schemas de validación
    Error boundaries
    Logging estructurado
    ESLint + Prettier

