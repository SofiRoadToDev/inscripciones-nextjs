/**
 * Convierte un número en su representación textual en español.
 */
export function numeroATexto(numero: number): string {
    const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const centenas = ['', 'cien', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    const convertirCentenas = (num: number): string => {
        let texto = '';
        if (num >= 100) {
            const c = Math.floor(num / 100);
            if (num === 100) {
                texto += 'cien ';
            } else if (c === 1 && num > 100) {
                texto += 'ciento ';
            } else {
                texto += centenas[c] + ' ';
            }
            num %= 100;
        }

        if (num >= 20) {
            const d = Math.floor(num / 10);
            const u = num % 10;
            if (u === 0) {
                texto += decenas[d] + ' ';
            } else if (d === 2) {
                texto += 'veinti' + unidades[u] + ' ';
            } else {
                texto += decenas[d] + ' y ' + unidades[u] + ' ';
            }
        } else if (num >= 10) {
            texto += especiales[num - 10] + ' ';
        } else if (num > 0) {
            texto += unidades[num] + ' ';
        }
        return texto;
    };

    if (numero === 0) return 'cero';

    let entero = Math.floor(numero);
    let texto = '';

    // Millones (opcional para este contexto pero bueno tenerlo)
    if (entero >= 1000000) {
        const millones = Math.floor(entero / 1000000);
        if (millones === 1) {
            texto += 'un millón ';
        } else {
            texto += convertirCentenas(millones) + 'millones ';
        }
        entero %= 1000000;
    }

    // Miles
    if (entero >= 1000) {
        const miles = Math.floor(entero / 1000);
        if (miles === 1) {
            texto += 'mil ';
        } else {
            texto += convertirCentenas(miles) + 'mil ';
        }
        entero %= 1000;
    }

    // Centenas
    texto += convertirCentenas(entero);

    return texto.trim();
}
