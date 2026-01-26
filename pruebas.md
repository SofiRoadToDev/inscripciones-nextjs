# Plan de Pruebas Manuales - Caminos Críticos

Este documento detalla los flujos de prueba esenciales para validar el sistema de inscripciones escolar, abarcando desde la inscripción pública hasta la gestión administrativa y de preceptores.

---

## 1. Inscripción de Alumno (Portal Público)

**Actor:** Padre/Tutor o Alumno Adulto
**URL Inicial:** `/inscripcion` (o Home)

### Caso 1.1: Inscripción Exitosa (Alumno Nuevo)
*   **Pasos:**
    1.  Ingresar DNI de alumno nuevo en el buscador inicial.
    2.  Verificar que el sistema indique "No encontrado" y permita iniciar carga.
    3.  Completar formulario de **Datos Personales** con información válida.
    4.  Completar formulario de **Domicilio** seleccionando Provincia > Depto > Localidad.
    5.  Cargar al menos un **Tutor** con datos y DNI válidos.
    6.  Completar **Ficha de Salud** (seleccionar 'No' en todo o detallar).
    7.  Seleccionar **Curso/Nivel** y confirmar inscripción.
*   **Criterio de Aceptación:**
    *   Se muestra mensaje de éxito y número de pre-inscripción.
    *   La inscripción aparece en estado "Pendiente" en el panel de Admin.

### Caso 1.2: Validación de Datos Incorrectos
*   **Pasos:**
    1.  Intentar avanzar dejando campos obligatorios vacíos (Nombre, DNI, Calle).
    2.  Ingresar un email con formato inválido (ej: `juan..com`).
    3.  Ingresar un DNI con letras o longitud incorrecta (< 6 dígitos).
*   **Criterio de Aceptación:**
    *   El formulario NO avanza al siguiente paso.
    *   Los campos con error se resaltan en rojo con mensajes descriptivos.

---

## 2. Gestión Administrativa (Admin)

**Actor:** Usuario Administrador (Secretaría/Tesorería)
**URL Inicial:** `/admin`

### Caso 2.1: Validación de Inscripciones
*   **Pasos:**
    1.  Ir a "Validar Inscripciones".
    2.  Seleccionar una inscripción en estado "Pendiente".
    3.  Revisar datos en el modal de detalle.
    4.  Clic en **Aprobar Inscripción**.
*   **Criterio de Aceptación:**
    *   La inscripción desaparece de la lista "Pendiente".
    *   Un alumno se crea o actualiza en la base de datos.
    *   La inscripción pasa a estado "Aprobada".

### Caso 2.2: Gestión de Pagos (Tesorería)
*   **Pasos:**
    1.  Ir a "Pagos y Cuotas".
    2.  Buscar un alumno por DNI o Nombre.
    3.  Verificar estado de Matrícula y Seguro en la tabla.
    4.  Clic en botón **Cobrar**.
    5.  En el modal, marcar "Matrícula" como pagado, ingresar monto y fecha.
    6.  Guardar.
*   **Criterio de Aceptación:**
    *   La tabla actualiza inmediatamente la etiqueta a "Pagado" (verde).
    *   Se habilita el botón de "Recibo".
    *   Al hacer clic en "Recibo", se abre una ventana de impresión con el comprobante.

### Caso 2.3: Impresión de Ficha
*   **Pasos:**
    1.  En la tabla de pagos o listado de alumnos, clic en botón **Ficha**.
*   **Criterio de Aceptación:**
    *   Se abre ventana de impresión con el diseño oficial (Escudo, Títulos, Foto 4x4, Firmas).
    *   Todos los datos (Alumno, Tutor, Domicilio, Salud) coinciden con la carga.

---

## 3. Gestión de Cursos y Alumnos (Preceptor)

**Actor:** Preceptor
**URL Inicial:** `/preceptor`

### Caso 3.1: Visualización de Cursos Asignados (Dashboard)
*   **Pasos:**
    1.  Ingresar al Dashboard.
    2.  Verificar las tarjetas de métricas (Total Alumnos, Seguro Pagado).
    3.  Verificar la tabla de desglose por curso.
*   **Criterio de Aceptación:**
    *   Solo se ven estadísticas de los cursos asignados a ese preceptor específico.
    *   Los porcentajes de seguro coinciden con la realidad de los pagos.

### Caso 3.2: Edición de Datos de Alumno
*   **Pasos:**
    1.  Ir a "Mis Alumnos".
    2.  Buscar un alumno de un curso propio.
    3.  Clic en botón **Editar** (Lápiz).
    4.  Cambiar el teléfono o corregir la calle del domicilio.
    5.  Guardar cambios.
*   **Criterio de Aceptación:**
    *   Mensaje de éxito "Alumno actualizado".
    *   Al volver a editar, los datos persisten.
    *   Si intenta editar un alumno de OTRO curso (vía URL o hack), debe dar error de permiso.

### Caso 3.3: Movimiento de Curso
*   **Pasos:**
    1.  En la lista de alumnos, clic en **Mover**.
    2.  Seleccionar un curso destino diferente (dentro de los asignados al preceptor).
    3.  Confirmar.
*   **Criterio de Aceptación:**
    *   El alumno cambia de curso en la lista.
    *   Si el preceptor NO tiene asignado el curso destino, no debería aparecer en el selector o dar error al guardar.

### Caso 3.4: Eliminación de Inscripción
*   **Pasos:**
    1.  Clic en botón **Eliminar** (Basurero) sobre un alumno.
    2.  Leer advertencia en el diálogo de confirmación.
    3.  Confirmar eliminación.
*   **Criterio de Aceptación:**
    *   El alumno desaparece de la lista del curso.
    *   Mensaje de éxito.
    *   (Verificar en Admin) La inscripción ya no existe o está marcada como eliminada.
