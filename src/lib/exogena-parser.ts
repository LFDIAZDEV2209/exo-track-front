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
 * Recorta el concepto largo del reporte exógeno de la DIAN.
 * Ejemplo: "Valor total de la inversión, aporte o derecho social efectuada y
 * acumulada a 31 de diciembre del año a reportar (Concepto: 1010)"
 * → "Inversión, aporte o derecho social (Concepto: 1010)"
 */
function truncateConcept(detalle: string): string {
  // Si tiene "(Concepto: XXXX)", extraer solo esa parte como identificador
  const conceptoMatch = detalle.match(/\(Concepto:\s*(\d+)\)/);
  const conceptoCode = conceptoMatch ? `(Concepto: ${conceptoMatch[1]})` : '';

  // Quitar el código para analizar el texto descriptivo
  let text = detalle.replace(/\s*\(Concepto:\s*\d+\)\s*/g, '').trim();

  // Si el texto es muy largo (>60 chars), tomar solo las primeras palabras significativas
  if (text.length > 60) {
    // Buscar la primera coma o punto para cortar
    const commaIdx = text.indexOf(',');
    if (commaIdx > 10 && commaIdx < 50) {
      text = text.substring(0, commaIdx);
    } else {
      // Cortar a ~50 caracteres en un espacio
      const words = text.split(' ');
      let truncated = '';
      for (const word of words) {
        if ((truncated + word).length > 50) break;
        truncated += (truncated ? ' ' : '') + word;
      }
      text = truncated;
    }
  }

  // Capitalizar primera letra
  text = text.charAt(0).toUpperCase() + text.slice(1);

  return conceptoCode ? `${text} ${conceptoCode}` : text;
}

/**
 * Recorta la información adicional del sourceDetail.
 * Ejemplo: "Número de Cuenta / Documento: 3006366904 | Concepto Códigos Tributaria: *5* Depósitos electrónicos"
 * → "Cuenta: 3006366904"
 */
function truncateAdditionalInfo(info: string): string {
  if (info.length <= 50) return info;

  // Si tiene separadores " | ", tomar solo el primer segmento relevante
  const separatorIdx = info.indexOf(' | ');
  if (separatorIdx > 0) {
    let segment = info.substring(0, separatorIdx).trim();

    // Simplificar etiquetas largas
    segment = segment.replace(/Número de Cuenta\s*\/\s*Documento:/i, 'Cuenta:');
    segment = segment.replace(/Porcentaje de Participación:/i, 'Participación:');

    return segment;
  }

  // Si no tiene separadores, cortar a ~50 chars
  const words = info.split(' ');
  let truncated = '';
  for (const word of words) {
    if ((truncated + word).length > 50) break;
    truncated += (truncated ? ' ' : '') + word;
  }
  return truncated;
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
      sourceParts.push(truncateAdditionalInfo(additionalInfo));
    }

    items.push({
      id: localId(),
      concept: truncateConcept(detalle),
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
