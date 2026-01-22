import { test, expect } from '@playwright/test';

test.describe('Flujo de Inscripción E2E', () => {
    test.beforeEach(async ({ page }) => {
        // Limpiar localStorage antes de cada test para empezar de cero
        await page.goto('/inscripcion');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('debe completar una inscripción desde cero hasta el éxito', async ({ page }) => {
        // Aumentar el timeout porque es un proceso largo
        test.slow();

        // --- TAB 1: DATOS DEL ALUMNO ---
        await page.getByLabel(/Apellido/i).fill('Perez');
        await page.getByLabel(/Nombre/i).fill('Juan');
        await page.getByLabel(/DNI/i).first().fill('45000123');
        await page.getByPlaceholder(/dd\/mm\/aaaa/i).fill('10/05/2015');

        // Genero y Nacionalidad (Selects)
        await page.getByLabel(/Género/i).click();
        await page.getByRole('option', { name: 'Masculino' }).click();

        await page.getByLabel(/Nacionalidad/i).fill('Argentina');
        await page.getByLabel(/Email/i).fill('juan@example.com');
        await page.getByLabel(/Teléfono/i).fill('3874123456');

        // Domicilio Alumno
        await page.getByLabel(/Calle/i).fill('Belgrano');
        await page.getByLabel(/Número/i).fill('123');

        // Provincia/Depto/Loc (Cargan de Supabase)
        await page.getByLabel(/Provincia/i).click();
        await page.getByRole('option').first().click(); // Seleccionar Salta o la que sea

        // Esperar carga de departamentos
        await page.waitForTimeout(500);
        await page.getByLabel(/Departamento/i).click();
        await page.getByRole('option').first().click();

        // Esperar carga de localidades
        await page.waitForTimeout(500);
        await page.getByLabel(/Localidad/i).click();
        await page.getByRole('option').first().click();

        await page.getByRole('button', { name: /Siguiente Paso/i }).click();

        // --- TAB 2: TUTORES ---
        await expect(page.getByText(/2. Tutores/i)).toBeVisible();
        await page.getByRole('button', { name: /Agregar Tutor/i }).click();

        await page.locator('input[name="tutores.0.apellido"]').fill('Perez');
        await page.locator('input[name="tutores.0.nombre"]').fill('Padre');
        await page.locator('input[name="tutores.0.dni"]').fill('15000999');
        await page.locator('input[name="tutores.0.telefono"]').fill('387555666');

        // Seleccionar vínculo
        await page.locator('button[id^="radix-"]').filter({ hasText: 'Seleccione Vínculo' }).click(); // Selector de vínculo
        await page.getByRole('option', { name: 'Padre' }).click();

        // Usar mismo domicilio del alumno
        await page.getByLabel(/Vive con el alumno/i).check();

        await page.getByRole('button', { name: /Siguiente/i }).click();

        // --- TAB 3: FICHA DE SALUD ---
        await expect(page.getByText(/3. Salud/i)).toBeVisible();
        await page.getByPlaceholder(/Describa si padece asma/i).fill('Ninguna');
        await page.getByPlaceholder(/Indique medicamentos/i).fill('Ninguna');

        // Switch de vacunación (en shadcn es un button con role switch)
        await page.getByRole('switch').click();

        await page.getByRole('button', { name: /Siguiente/i }).click();

        // --- TAB 4: INSCRIPCIÓN FINAL ---
        await expect(page.getByText(/4. Inscripción/i)).toBeVisible();

        // Seleccionar Nivel
        await page.getByLabel(/Nivel Educativo/i).click();
        await page.getByRole('option').first().click();

        await page.getByPlaceholder(/Nombre de la escuela anterior/i).fill('Escuela Standard 123');

        // SUBMIT FINAL
        await page.getByRole('button', { name: /Finalizar y Registrar Inscripción/i }).click();

        // --- ÉXITO ---
        await expect(page.getByText(/¡Inscripción Exitosa!/i)).toBeVisible({ timeout: 15000 });
    });
});
