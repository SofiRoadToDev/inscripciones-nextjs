# Convención de Commits

## Formato

```
tipo(scope): descripción breve en imperativo [fase]
```

- **tipo**: obligatorio
- **scope**: obligatorio
- **descripción**: obligatorio, en español, verbo en infinitivo ("agregar", "corregir", "eliminar")
- **[fase]**: opcional pero recomendado, referencia a la fase del proyecto (ej: `[F6]`)

Largo máximo de la línea de asunto: **72 caracteres**.

---

## Tipos permitidos

| Tipo       | Uso                                                        |
|------------|------------------------------------------------------------|
| `feat`     | Nueva funcionalidad visible para el usuario                |
| `fix`      | Corrección de bug                                          |
| `refactor` | Cambio de código que no agrega funcionalidad ni corrige bug|
| `style`    | Cambios de estilos, formato, espaciado (sin lógica)        |
| `chore`    | Tareas de mantenimiento, config, dependencias              |
| `docs`     | Cambios en documentación                                   |
| `test`     | Agregar o modificar tests                                  |
| `db`       | Migraciones, seeds, cambios de schema                      |
| `perf`     | Mejora de rendimiento                                      |

---

## Scopes del proyecto

| Scope        | Área                                                  |
|--------------|-------------------------------------------------------|
| `landing`    | Página pública / hero / talleres                      |
| `forms`      | Formulario de inscripción (alumno, tutores, salud)    |
| `admin`      | Panel de administración general                       |
| `tesoreria`  | Pagos, seguros, comprobantes                          |
| `preceptor`  | Panel y funcionalidades de preceptor                  |
| `auth`       | Login, sesiones, middleware, permisos                  |
| `db`         | Migraciones, schema, RLS, seeds                       |
| `pdf`        | Generación de fichas y comprobantes                   |
| `reportes`   | Exportación XLSX, filtros de reportes                 |
| `config`     | Configuración de montos, cursos, ciclo lectivo        |
| `ui`         | Componentes compartidos de interfaz                   |

---

## Referencia a fases

Usar `[F0]` a `[F8]` según corresponda al final del mensaje:

- `F0` Setup
- `F1` Schema DB + RLS
- `F2` AlumnoForm
- `F3` TutoresForm
- `F4` FichaSaludForm
- `F5` InscripcionForm
- `F6` Dashboard Admin
- `F7` Landing y pulido
- `F8` Deployment

---

## Ejemplos correctos

```
feat(preceptor): agregar filtro de ciclo lectivo con paginación en servidor [F6]
fix(forms): corregir envío silencioso sin mostrar errores de validación [F5]
refactor(tesoreria): separar tabla pagos en cabecera y detalle [F6]
db(db): agregar tabla departamentos con estructura jerárquica [F1]
style(admin): ajustar espaciado en tabla de inscripciones [F6]
chore(config): agregar .env.example con variables requeridas
test(forms): agregar test E2E de inscripción completa [F5]
docs(docs): actualizar especificaciones del módulo de pagos
```

---

## Reglas

1. **Un commit = un cambio lógico.** No mezclar migración de DB + cambio de UI + refactor.
2. **No commitear trabajo en progreso.** Nada de "trabajando en...", "WIP", "avances". Si necesitás guardar progreso parcial, usá una branch auxiliar.
3. **Sin errores de ortografía.** Revisar el mensaje antes de confirmar.
4. **Sin espacios iniciales** en el mensaje.
5. **Descripción en infinitivo**, no en participio ni gerundio ("agregar filtro", no "agregado filtro" ni "agregando filtro").
6. **Si el commit cierra un bug conocido**, usar `fix` y describir qué se corrigió, no el síntoma.
7. **Cuerpo opcional**: si el cambio es complejo, agregar un cuerpo separado por línea en blanco explicando el porqué.
