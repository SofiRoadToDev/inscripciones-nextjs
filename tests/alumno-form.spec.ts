import { test, expect } from '@playwright/test';

test.describe('AlumnoForm (Fase 2)', () => {
    test.beforeEach(async ({ page }) => {
        // Ir a la página de inscripción
        await page.goto('/inscripcion');
    });

    test('debe validar campos obligatorios al intentar avanzar', async ({ page }) => {
        // Clic en Siguiente sin llenar nada
        await page.getByRole('button', { name: /Siguiente Paso/i }).click();

        // Verificar mensajes de error de Zod (pueden tardar un poco en aparecer)
        await expect(page.getByText(/El apellido debe tener al menos 2 caracteres/i)).toBeVisible();
        await expect(page.getByText(/El nombre debe tener al menos 2 caracteres/i)).toBeVisible();
        await expect(page.getByText(/El DNI debe tener 7 u 8 dígitos/i)).toBeVisible();
    });

    test('debe precargar datos usando el DNI de test (12345678)', async ({ page }) => {
        // Ingresar DNI de test configurado en la Server Action
        await page.getByPlaceholder(/DNI del alumno/i).fill('12345678');
        await page.getByRole('button', { name: /Buscar/i }).click();

        // Verificar que la UI se actualizó con los mocks del servidor
        await expect(page.getByLabel(/Apellido/i)).toHaveValue('Mockington');
        await expect(page.getByLabel(/Nombre/i)).toHaveValue('Testy');
        await expect(page.getByLabel(/DNI/i)).toHaveValue('12345678');
        await expect(page.getByPlaceholder(/dd\/mm\/aaaa/i)).toHaveValue('01/01/2015');

        // Verificar alerta de éxito
        await expect(page.getByText(/¡Alumno encontrado!/i)).toBeVisible();
    });

    test('debe persistir datos en localStorage al recargar', async ({ page }) => {
        // Llenar datos manualmente
        await page.getByLabel(/Apellido/i).fill('Perez');
        await page.getByLabel(/Nombre/i).fill('Ana');
        await page.getByLabel(/DNI/i).fill('40123456');

        // Recargar la página
        await page.reload();

        // Verificar que los datos sigan ahí (via localStorage)
        await expect(page.getByLabel(/Apellido/i)).toHaveValue('Perez');
        await expect(page.getByLabel(/Nombre/i)).toHaveValue('Ana');
        await expect(page.getByLabel(/DNI/i)).toHaveValue('40123456');
    });
});
