export type ExogenaCategory = 'income' | 'asset' | 'liability' | 'unclassified';

export interface ExogenaItem {
  id: string;
  concept: string;
  amount: number;
  category: ExogenaCategory;
  reporterName: string;
  reporterNit: string;
  sourceDetail: string;
}

export interface ExogenaParseResult {
  taxableYear: number | null;
  documentNumber: string | null;
  fullName: string | null;
  items: ExogenaItem[];
}

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/\s+/g, ' ')
    .trim();
}

function localId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Clasifica un registro de exógena según el texto de "Uso declaración Sugerida"
 * (columna G del reporte DIAN):
 *  - R30 Deudas -> deuda
 *  - Patrimonio (R29 / avalúos / saldos bancarios) -> patrimonio
 *  - Ingresos (R99 / no constitutivos de renta) -> ingreso
 *  - El resto (consumos TC, movimientos, compras, saldo a favor) -> sin clasificar
 */
function classify(usageSuggestion: string, amount: number): ExogenaCategory {
  const g = usageSuggestion.toUpperCase();
  if (g.includes('PATRIMONIO')) {
    // Saldo de cuentas bancarias: positivo = patrimonio, negativo = deuda
    if (g.includes('DEUDA') && amount < 0) return 'liability';
    return 'asset';
  }
  if (g.includes('DEUDA')) return 'liability';
  if (g.includes('INGRESO')) return 'income';
  return 'unclassified';
}

/**
 * Parsea el archivo Excel de "Reporte de información exógena" de la DIAN.
 * El layout es fijo:
 *  - Filas 1-12: metadatos (año, identificación, nombre del consultante)
 *  - Fila 13: encabezados de grupos (Persona que reporta / Información reportada)
 *  - Fila 14: encabezados reales (NIT | Nombre | NIT | Nombre reportado | Detalle | Valor | Uso | Info adicional)
 *  - Filas 15-19: filas de "Tope X" (resúmenes, se ignoran)
 *  - Filas 20+: datos por tercero que reporta
 */
export async function parseExogenaFile(file: File): Promise<ExogenaParseResult> {
  const XLSX = await import('xlsx');

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) {
    throw new Error('El archivo Excel no contiene hojas de cálculo');
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: null,
  });

  let taxableYear: number | null = null;
  let documentNumber: string | null = null;
  let fullName: string | null = null;
  let headerRowIndex = -1;

  for (let i = 0; i < rows.length && i < 20; i++) {
    const row = rows[i];
    const label = normalizeText(row?.[0]);
    const value = row?.[2];

    if (label.startsWith('Año al que se refiere la consulta')) {
      taxableYear = parseInt(String(value), 10) || null;
    } else if (label.startsWith('Identificación:')) {
      documentNumber = normalizeText(value) || null;
    } else if (label.startsWith('Nombres / Razón social:')) {
      fullName = normalizeText(value) || null;
    }

    if (normalizeText(row?.[4]) === 'Detalle' && normalizeText(row?.[5]) === 'Valor') {
      headerRowIndex = i;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error(
      'No se encontró la estructura esperada del reporte exógeno (columnas Detalle/Valor). Verifica que sea el archivo exportado por la DIAN.'
    );
  }

  const items: ExogenaItem[] = [];

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    const detalle = normalizeText(row?.[4]);
    const valor = row?.[5];

    // Filas de resumen "Tope X" o sin detalle/valor se ignoran
    if (!detalle || detalle.startsWith('Tope')) continue;
    if (typeof valor !== 'number' || Number.isNaN(valor)) continue;

    const reporterName = normalizeText(row?.[1]);
    const reporterNit = normalizeText(row?.[0]);
    const usageSuggestion = normalizeText(row?.[6]);
    const additionalInfo = normalizeText(row?.[7]);

    const sourceParts: string[] = [];
    if (reporterName) {
      sourceParts.push(reporterNit ? `${reporterName} (NIT ${reporterNit})` : reporterName);
    } else if (reporterNit) {
      sourceParts.push(`NIT ${reporterNit}`);
    }
    if (additionalInfo) {
      sourceParts.push(additionalInfo);
    }

    items.push({
      id: localId(),
      concept: detalle,
      amount: valor,
      category: classify(usageSuggestion, valor),
      reporterName,
      reporterNit,
      sourceDetail: sourceParts.join(' | '),
    });
  }

  return {
    taxableYear,
    documentNumber,
    fullName,
    items,
  };
}
