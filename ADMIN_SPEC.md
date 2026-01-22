# Especificaciones: Dashboard de Administración - Colegio San Patricio

Este documento detalla las funcionalidades requeridas para el panel de administración del sistema de inscripciones.

## 1. Gestión de Inscripciones (Módulo Central)
El administrador visualizará todas las solicitudes entrantes y podrá realizar las siguientes acciones:

*   **Listado Maestro**: Tabla con búsqueda por DNI, Apellido y Nombre.
*   **Estado de Trámite**: 
    *   **Confirmar**: Cambia el estado a `aprobada`.
    *   **Rechazar**: Cambia el estado a `rechazada` (permitiendo documentar el motivo).
*   **Asignación de Aula**:
    *   Vincular la inscripción a un **Curso / Año** específico (Aula física). Esto se realiza una vez que la inscripción es confirmada.

## 2. Gestión de Pagos (Caja)
Módulo para registrar y controlar los cobros asociados a la inscripción.

*   **Conceptos a Cobrar**:
    *   **Seguro Escolar Menor** (Monto configurable).
    *   **Seguro Escolar Mayor** (Monto configurable).
    *   **Matrícula de Inscripción**.
*   **Registro Manual**: El admin introduce el monto en el caso de la matricula, el seguro( solo marca como pagado) si es menor o mayor, y la fecha de la operación.

## 3. Generación de Documentación (PDF)
Emisión de comprobantes y fichas con un diseño institucional premium.

*   **Ficha de Inscripción**: 
    *   Contiene todos los datos del Alumno, Tutores y Ficha Médica.
    *   **Importante**: Excluye toda información relacionada con pagos.
*   **Comprobante de Pago**:
    *   Contiene únicamente el detalle de los conceptos abonados (Seguro, Matrícula), datos del alumno y fecha.

## 4. Reportes y Exportación (xlsx)
Herramienta para el control administrativo y contable.

*   **Filtros Inteligentes**:
    *   Por tipo de Seguro Escolar (Menor/Mayor).
    *   Por tipo de seguro y curso(nivel+curso).
    *   Por lista de DNIs específicos.
    *   Por rango de montos pagados.
    *   Por Apellido y Nombre.
*   **Exportación**: Descarga automática en formato **.xlsx** de los datos filtrados para su uso en Excel.

---

## Estructura de Navegación Sugerida
1.  **Dashboard Home**: Resumen de métricas (Total inscriptos, pendientes por nivel, recaudación del día).
2.  **Inscripciones**: Listado principal y gestión de aprobación/aulas.
3.  **Tesorería**: Control de cobros y pagos de seguros/matrícula.
4.  **Configuración**: Ajuste de montos de seguros y creación de cursos (aulas fisicas).
