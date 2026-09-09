/**
 * Recorre una colección paginada del backend hasta agotarla.
 *
 * Se usa SOLO en flujos de exportación (reportes): la vista normal pagina en
 * cliente sobre una carga acotada para abrir rápido. Aquí el techo por defecto
 * (50.000) es solo un cortafuegos anti-bucles infinitos, no un límite funcional.
 */

interface Page<T> {
  items: T[];
  total: number;
}

interface FetchAllOptions {
  /** Tamaño de página por request (default 500: equilibrio requests/memoria) */
  pageSize?: number;
  /** Tope de seguridad (default 50.000) */
  maxRecords?: number;
  /** Progreso: (cargados, total) */
  onProgress?: (loaded: number, total: number) => void;
}

export async function fetchAllPages<T>(
  fetchPage: (limit: number, offset: number) => Promise<Page<T>>,
  options: FetchAllOptions = {},
): Promise<T[]> {
  const { pageSize = 500, maxRecords = 50000, onProgress } = options;
  const items: T[] = [];
  let offset = 0;

  for (;;) {
    const page = await fetchPage(pageSize, offset);
    if (page.items.length > 0) items.push(...page.items);
    onProgress?.(items.length, page.total);

    const reachedEnd = page.items.length < pageSize || items.length >= page.total;
    if (reachedEnd || items.length >= maxRecords) break;
    offset += pageSize;
  }

  return items.slice(0, maxRecords);
}
