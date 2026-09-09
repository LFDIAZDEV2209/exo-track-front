/**
 * Parsea el `sourceDetail` generado por el importador exógeno
 * (`src/lib/exogena-parser.ts`) a una estructura presentable.
 *
 * Formato de origen: "{reportante} (NIT {nit}) | {info adicional}"
 * Ej: "BANCOLOMBIA S.A. (NIT 890903938) | Cuenta: 3006366904"
 *
 * El parseo es tolerante: cualquier segmento sin estructura conocida se
 * conserva como texto libre para NO perder información.
 */

export interface SourceDetailEntry {
  label: string;
  value: string;
}

export interface ParsedSourceDetail {
  /** Nombre del tercero que reporta (puede ser muy largo, ej. BBVA) */
  reporterName: string | null;
  /** NIT del reportante, solo dígitos y guiones */
  reporterNit: string | null;
  /** Pares clave/valor de la info adicional (cuenta, participación, titular…) */
  entries: SourceDetailEntry[];
  /** Segmentos de texto libre que no matchearon ningún patrón conocido */
  notes: string[];
  /** Valor con pinta de cuenta/documento (dígitos largos), para resumir */
  accountValue: string | null;
}

// "Número de Cuenta / Documento:" → "Cuenta", etc. (genérico: el resto pasa tal cual)
const LABEL_ALIASES: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /n[uú]mero de cuenta\s*\/\s*documento/i, label: 'Cuenta' },
  { pattern: /^cuenta/i, label: 'Cuenta' },
  { pattern: /porcentaje de participaci[oó]n/i, label: 'Participación' },
  { pattern: /^participaci[oó]n/i, label: 'Participación' },
  { pattern: /^titular/i, label: 'Titular' },
  { pattern: /concepto/i, label: 'Concepto DIAN' },
];

function normalizeLabel(rawLabel: string): string {
  const label = rawLabel.trim();
  for (const alias of LABEL_ALIASES) {
    if (alias.pattern.test(label)) return alias.label;
  }
  return label.length > 40 ? `${label.slice(0, 40)}…` : label;
}

function parseReporter(segment: string): { name: string | null; nit: string | null } {
  // "NOMBRE LARGO (NIT 860003020)" → { name, nit }
  const nitMatch = segment.match(/\(NIT\s+([\d-]+)\)/i);
  if (nitMatch) {
    const name = segment.slice(0, nitMatch.index).trim();
    return { name: name || null, nit: nitMatch[1].trim() };
  }
  // "NIT 900123456" sin nombre
  const bareNit = segment.match(/^NIT\s+([\d-]+)$/i);
  if (bareNit) return { name: null, nit: bareNit[1].trim() };
  return { name: segment.trim() || null, nit: null };
}

function looksLikeAccount(value: string): boolean {
  // Los valores con decimales/porcentajes (ej. participación 100.00) no son cuentas
  if (/[.,%]/.test(value)) return false;
  return value.replace(/\D/g, '').length >= 6;
}

export function parseSourceDetail(raw: string | null | undefined): ParsedSourceDetail {
  const empty: ParsedSourceDetail = {
    reporterName: null,
    reporterNit: null,
    entries: [],
    notes: [],
    accountValue: null,
  };
  if (!raw || !raw.trim()) return empty;

  const segments = raw
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
  if (segments.length === 0) return empty;

  // Heurística: el primer segmento es el reportante si menciona NIT o no tiene ":"
  const [first, ...rest] = segments;
  let remaining = segments;
  if (/NIT/i.test(first) || !first.includes(':')) {
    const reporter = parseReporter(first);
    empty.reporterName = reporter.name;
    empty.reporterNit = reporter.nit;
    remaining = rest;
  }

  for (const segment of remaining) {
    const colonIdx = segment.indexOf(':');
    if (colonIdx > 0) {
      const label = normalizeLabel(segment.slice(0, colonIdx));
      const value = segment.slice(colonIdx + 1).trim();
      if (!value) {
        empty.notes.push(segment);
        continue;
      }
      empty.entries.push({ label, value });
      if (!empty.accountValue && (label === 'Cuenta' || looksLikeAccount(value))) {
        empty.accountValue = value;
      }
    } else {
      empty.notes.push(segment);
      if (!empty.accountValue && looksLikeAccount(segment)) {
        empty.accountValue = segment;
      }
    }
  }

  return empty;
}

/** Últimos N dígitos de una cuenta para mostrar enmascarado: "•••• 62482" */
export function maskAccount(value: string, visibleDigits = 5): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= visibleDigits) return value;
  return `•••• ${digits.slice(-visibleDigits)}`;
}

const ACRONYM_LIKE = /^[A-ZÁÉÍÓÚÑ]{2,4}$/;

// Artículos/preposiciones que van en minúscula (salvo primera palabra)
const LOWERCASE_WORDS = new Set([
  'de', 'del', 'los', 'las', 'el', 'la', 'y', 'e', 'o', 'u',
  'en', 'para', 'por', 'con', 'sin', 'al', 'que', 'como',
]);

/**
 * Pasa "BANCO BILBAO VIZCAYA…" a "Banco Bilbao Vizcaya…" preservando
 * siglas (BBVA), abreviaturas (S.A., Y/O) y números. Solo display:
 * el original se conserva intacto en el detalle expandido.
 */
export function toDisplayName(name: string): string {
  return name
    .split(' ')
    .map((word, index) => {
      if (!word) return word;
      // Con dígitos: solo normaliza letras ("BAN100" → "Ban100")
      if (/\d/.test(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      // Ya en mixto ("Bancolombia") → no tocar
      if (word !== word.toUpperCase()) return word;
      // Abreviaturas con puntos/barras ("S.A.", "Y/O") → intactas
      if (word.includes('.') || word.includes('/')) return word;
      // Artículos/preposiciones en minúscula (salvo primera palabra).
      // Va ANTES que siglas: "EL", "DE", "PARA" también matchean el patrón de sigla.
      if (index > 0 && LOWERCASE_WORDS.has(word.toLowerCase())) {
        return word.toLowerCase();
      }
      // Siglas ("BBVA") → intactas
      if (ACRONYM_LIKE.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
