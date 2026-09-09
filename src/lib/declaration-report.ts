/**
 * Reporte completo de una declaración (Excel + PDF).
 *
 * - Fuente de datos: las listas YA cargadas en la vista (cero requests extra).
 * - Generación 100% en cliente con imports dinámicos (no engordan el bundle inicial).
 * - Se comparte entre la vista admin y la vista user.
 */

export interface ReportItem {
  concept: string;
  amount: number;
  /** 'Exógeno' | 'Manual' */
  source: string;
  /** Subtipo (ej. Dividendos). Ausente = sin subtipo. */
  subtype?: string;
  /** Detalle completo del subconcepto (reportante, NIT, cuenta…) */
  detail?: string;
  reporterName?: string | null;
  reporterNit?: string | null;
}

export interface ReportSection {
  key: string;
  title: string;
  items: ReportItem[];
  total: number;
}

export interface DeclarationReportData {
  clientName: string;
  documentNumber: string;
  email?: string;
  phone?: string;
  taxableYear: number | string;
  status: string;
  description?: string;
  generatedAt: Date;
  sections: ReportSection[];
  totalRecords: number;
  /** Patrimonio líquido referencial = patrimonios − deudas */
  netWorth: number;
}

export interface BuildReportInput {
  clientName: string;
  documentNumber: string;
  email?: string;
  phone?: string;
  taxableYear: number | string;
  status: string;
  description?: string;
  assets: any[];
  incomes: any[];
  liabilities: any[];
  /** Ítems personalizados con su conceptType poblado */
  customItems: any[];
  /** Tipos personalizados visibles (para titular secciones) */
  customTypeNames?: Record<string, string>;
  unclassifiedItems: any[];
}

const toNumber = (value: unknown): number => {
  const num = typeof value === 'string' ? parseFloat(value) : (value as number);
  return Number.isFinite(num) ? num : 0;
};

const sourceLabel = (source: unknown): string => {
  const upper = String(source ?? '').toUpperCase();
  return upper === 'EXOGENA' || upper === 'EXOGENO' || upper === 'EXOGENOUS'
    ? 'Exógeno'
    : 'Manual';
};

const toReportItem = (raw: any): ReportItem => ({
  concept: String(raw.concept ?? ''),
  amount: toNumber(raw.amount),
  source: sourceLabel(raw.source),
  subtype: raw.subtype?.name ? String(raw.subtype.name) : undefined,
  detail: raw.sourceDetail ? String(raw.sourceDetail) : undefined,
  reporterName: raw.reporterName ?? null,
  reporterNit: raw.reporterNit ?? null,
});

const sum = (items: ReportItem[]): number =>
  items.reduce((acc, item) => acc + item.amount, 0);

/**
 * Normaliza las listas de la vista al modelo del reporte.
 * Incluye secciones vacías (el reporte declara explícitamente "sin registros").
 */
export function buildDeclarationReport(input: BuildReportInput): DeclarationReportData {
  const sections: ReportSection[] = [];
  const push = (key: string, title: string, raw: any[]) => {
    const items = (raw ?? []).map(toReportItem);
    sections.push({ key, title, items, total: sum(items) });
  };

  push('assets', 'Patrimonios', input.assets);
  push('incomes', 'Ingresos', input.incomes);
  push('liabilities', 'Deudas', input.liabilities);

  const customsByType = new Map<string, any[]>();
  for (const item of input.customItems ?? []) {
    const typeId = item?.conceptType?.id ?? 'custom';
    if (!customsByType.has(typeId)) customsByType.set(typeId, []);
    customsByType.get(typeId)!.push(item);
  }
  for (const [typeId, raw] of customsByType) {
    const title =
      input.customTypeNames?.[typeId] ??
      raw[0]?.conceptType?.name ??
      'Personalizado';
    push(`custom-${typeId}`, title, raw);
  }

  push('unclassified', 'Sin catalogar', input.unclassifiedItems);

  const assetsTotal = sections.find((s) => s.key === 'assets')?.total ?? 0;
  const liabilitiesTotal = sections.find((s) => s.key === 'liabilities')?.total ?? 0;

  return {
    clientName: input.clientName || 'Cliente',
    documentNumber: input.documentNumber || '—',
    email: input.email,
    phone: input.phone,
    taxableYear: input.taxableYear,
    status: input.status,
    description: input.description,
    generatedAt: new Date(),
    sections,
    totalRecords: sections.reduce((acc, s) => acc + s.items.length, 0),
    netWorth: assetsTotal - liabilitiesTotal,
  };
}

export function reportFileName(data: DeclarationReportData, ext: 'xlsx' | 'pdf'): string {
  const safeDoc = String(data.documentNumber).replace(/[^a-zA-Z0-9-]/g, '') || 'cliente';
  return `ExoTrack-Declaracion-${data.taxableYear}-${safeDoc}.${ext}`;
}

const formatCOP = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

const formatDateTime = (date: Date): string =>
  new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

// ---------------------------------------------------------------------------
// Excel (ExcelJS: estilos completos — xlsx CE ignora estilos al escribir)
// ---------------------------------------------------------------------------

const XC = {
  brand: 'FF047857', // emerald-700
  brandLight: 'FFD1FAE5', // emerald-100
  white: 'FFFFFFFF',
  dark: 'FF1F2937',
  gray: 'FF6B7280',
  border: 'FFD1D5DB',
};

const thinBorder = {
  top: { style: 'thin' as const, color: { argb: XC.border } },
  bottom: { style: 'thin' as const, color: { argb: XC.border } },
  left: { style: 'thin' as const, color: { argb: XC.border } },
  right: { style: 'thin' as const, color: { argb: XC.border } },
};

const MONEY_FMT = '#,##0';

/** Construye el workbook y devuelve el buffer (testeable en node; el browser lo descarga). */
export async function buildDeclarationExcel(data: DeclarationReportData): Promise<Uint8Array> {
  const mod: any = await import('exceljs');
  const ExcelJS = mod.default ?? mod;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'ExoTrack';
  wb.created = new Date();

  const styleHeader = (cell: any) => {
    cell.font = { bold: true, size: 11, color: { argb: XC.white } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: XC.brand } };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = thinBorder;
  };
  const styleTotal = (cell: any) => {
    cell.font = { bold: true, size: 11, color: { argb: XC.brand } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: XC.brandLight } };
    cell.border = thinBorder;
  };
  const styleCell = (cell: any, isMoney = false) => {
    cell.border = thinBorder;
    cell.alignment = { vertical: 'middle', wrapText: true };
    if (isMoney) cell.numFmt = MONEY_FMT;
  };

  // ---- Hoja Resumen ----
  const ws = wb.addWorksheet('Resumen', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = [{ width: 30 }, { width: 42 }, { width: 22 }];

  ws.mergeCells('A1:C1');
  ws.getCell('A1').value = `Declaración de renta ${data.taxableYear}`;
  ws.getCell('A1').font = { bold: true, size: 16, color: { argb: XC.brand } };
  ws.mergeCells('A2:C2');
  ws.getCell('A2').value = 'Reporte generado por ExoTrack';
  ws.getCell('A2').font = { italic: true, color: { argb: XC.gray } };

  const infoRows: Array<[string, string]> = [
    ['Cliente', data.clientName],
    ['Cédula', String(data.documentNumber)],
    ...(data.email ? [['Email', data.email] as [string, string]] : []),
    ...(data.phone ? [['Teléfono', data.phone] as [string, string]] : []),
    ['Estado', data.status],
    ['Generado', formatDateTime(data.generatedAt)],
    ...(data.description ? [['Observaciones', data.description] as [string, string]] : []),
  ];
  let row = 4;
  for (const [label, value] of infoRows) {
    ws.getCell(`A${row}`).value = label;
    ws.getCell(`A${row}`).font = { bold: true, color: { argb: XC.gray } };
    ws.mergeCells(`B${row}:C${row}`);
    ws.getCell(`B${row}`).value = value;
    ws.getCell(`B${row}`).alignment = { wrapText: true };
    row += 1;
  }
  row += 1;
  const headerRow = row;
  ws.getCell(`A${row}`).value = 'Sección';
  ws.getCell(`B${row}`).value = 'Registros';
  ws.getCell(`C${row}`).value = 'Total';
  for (const col of ['A', 'B', 'C']) styleHeader(ws.getCell(`${col}${row}`));
  row += 1;
  for (const section of data.sections) {
    ws.getCell(`A${row}`).value = section.title;
    ws.getCell(`B${row}`).value = section.items.length;
    ws.getCell(`C${row}`).value = section.total;
    styleCell(ws.getCell(`A${row}`));
    styleCell(ws.getCell(`B${row}`));
    styleCell(ws.getCell(`C${row}`), true);
    row += 1;
  }
  ws.getCell(`A${row}`).value = 'Patrimonio líquido (ref.)';
  ws.getCell(`C${row}`).value = data.netWorth;
  for (const col of ['A', 'B', 'C']) styleTotal(ws.getCell(`${col}${row}`));
  row += 1;
  ws.getCell(`A${row}`).value = 'TOTAL REGISTROS';
  ws.getCell(`B${row}`).value = data.totalRecords;
  for (const col of ['A', 'B', 'C']) styleTotal(ws.getCell(`${col}${row}`));
  ws.autoFilter = `A${headerRow}:C${row}`;

  // ---- Una hoja por sección ----
  for (const section of data.sections) {
    const sheet = wb.addWorksheet((section.title || section.key).slice(0, 28), {
      views: [{ state: 'frozen', ySplit: 2 }],
    });
    sheet.columns = [{ width: 55 }, { width: 18 }, { width: 12 }, { width: 70 }, { width: 18 }];
    sheet.mergeCells('A1:E1');
    sheet.getCell('A1').value =
      `${section.title} — Declaración ${data.taxableYear} (${data.clientName})`;
    sheet.getCell('A1').font = { bold: true, size: 13, color: { argb: XC.brand } };

    const headers = ['Concepto', 'Subtipo', 'Fuente', 'Detalle', 'Valor'];
    const headerCells = sheet.getRow(2);
    headers.forEach((h, i) => {
      headerCells.getCell(i + 1).value = h;
      styleHeader(headerCells.getCell(i + 1));
    });

    if (section.items.length === 0) {
      sheet.getRow(3).getCell(1).value = 'Sin registros en esta sección';
      sheet.getRow(3).getCell(1).font = { italic: true, color: { argb: XC.gray } };
    }
    let r = 3;
    for (const item of section.items) {
      const excelRow = sheet.getRow(r);
      excelRow.getCell(1).value = item.concept;
      excelRow.getCell(2).value = item.subtype ?? '';
      excelRow.getCell(3).value = item.source;
      excelRow.getCell(4).value = item.detail ?? '';
      excelRow.getCell(5).value = item.amount;
      styleCell(excelRow.getCell(1));
      styleCell(excelRow.getCell(2));
      styleCell(excelRow.getCell(3));
      styleCell(excelRow.getCell(4));
      styleCell(excelRow.getCell(5), true);
      r += 1;
    }
    const totalCells = sheet.getRow(r);
    totalCells.getCell(1).value = 'TOTAL';
    totalCells.getCell(5).value = section.total;
    for (let c = 1; c <= 5; c++) styleTotal(totalCells.getCell(c));
    sheet.autoFilter = 'A2:E2';
  }

  const buffer = await wb.xlsx.writeBuffer();
  return buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
}

function saveBuffer(fileName: string, buffer: Uint8Array, mime: string) {
  const blob = new Blob([buffer as unknown as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadDeclarationExcel(data: DeclarationReportData): Promise<void> {
  const buffer = await buildDeclarationExcel(data);
  saveBuffer(
    reportFileName(data, 'xlsx'),
    buffer,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
}

// ---------------------------------------------------------------------------
// PDF (jsPDF + autotable, imports dinámicos)
// ---------------------------------------------------------------------------

const PDF = {
  brand: [4, 120, 87] as [number, number, number], // emerald-700
  brandLight: [209, 250, 229] as [number, number, number],
  dark: [31, 41, 55] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

export async function downloadDeclarationPdf(data: DeclarationReportData): Promise<void> {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const footer = () => {
    const pageCount = doc.getNumberOfPages();
    const page = doc.getCurrentPageInfo().pageNumber;
    doc.setFontSize(8);
    doc.setTextColor(...PDF.gray);
    doc.text(
      `Generado por ExoTrack el ${formatDateTime(data.generatedAt)} — Documento informativo`,
      margin,
      doc.internal.pageSize.getHeight() - 8,
    );
    doc.text(`Página ${page} de ${pageCount}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 8, {
      align: 'right',
    });
  };

  // ---- Encabezado ----
  doc.setFillColor(...PDF.brand);
  doc.rect(0, 0, pageWidth, 34, 'F');
  doc.setTextColor(...PDF.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(`Declaración de renta ${data.taxableYear}`, margin, 13);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.clientName} — C.C. ${data.documentNumber}`, margin, 20);
  doc.text(`Estado: ${data.status}  •  ${data.totalRecords} registros`, margin, 26);

  let y = 40;

  // ---- Ficha del cliente ----
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF.dark);
  doc.text('Información general', margin, y);
  y += 2;
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 1.5 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: PDF.gray, cellWidth: 32 },
      1: { cellWidth: contentWidth / 2 - 32 },
      2: { fontStyle: 'bold', textColor: PDF.gray, cellWidth: 32 },
      3: { cellWidth: contentWidth / 2 - 32 },
    },
    body: [
      ['Cliente', data.clientName, 'Cédula', String(data.documentNumber)],
      ['Email', data.email ?? '—', 'Teléfono', data.phone ?? '—'],
      ['Estado', data.status, 'Generado', formatDateTime(data.generatedAt)],
    ],
    didDrawPage: footer,
  });
  // @ts-expect-error lastAutoTable lo expone el plugin en runtime
  y = doc.lastAutoTable.finalY + 6;

  if (data.description) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF.gray);
    doc.text('Observaciones', margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF.dark);
    const obsLines = doc.splitTextToSize(data.description, contentWidth);
    doc.text(obsLines, margin, y);
    y += obsLines.length * 4 + 4;
  }

  // ---- Resumen por sección ----
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF.dark);
  doc.text('Resumen', margin, y);
  y += 2;
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Sección', 'Registros', 'Total']],
    body: data.sections.map((s) => [s.title, String(s.items.length), formatCOP(s.total)]),
    foot: [
      ['Patrimonio líquido (ref.)', '', formatCOP(data.netWorth)],
      ['TOTAL REGISTROS', String(data.totalRecords), ''],
    ],
    theme: 'striped',
    styles: { fontSize: 9 },
    headStyles: { fillColor: PDF.brand, textColor: PDF.white, fontStyle: 'bold' },
    footStyles: { fillColor: PDF.brandLight, textColor: PDF.dark, fontStyle: 'bold' },
    columnStyles: {
      1: { halign: 'center', cellWidth: 28 },
      2: { halign: 'right', cellWidth: 42 },
    },
    didDrawPage: footer,
  });
  // @ts-expect-error lastAutoTable lo expone el plugin en runtime
  y = doc.lastAutoTable.finalY + 8;

  // ---- Detalle por sección ----
  for (const section of data.sections) {
    // Evita títulos huérfanos al final de la página
    if (y > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      y = 16;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF.brand);
    doc.text(`${section.title} (${section.items.length})`, margin, y);
    y += 2;

    if (section.items.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...PDF.gray);
      doc.text('Sin registros en esta sección.', margin, y + 2);
      y += 10;
      continue;
    }

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Concepto', 'Subtipo', 'Fuente', 'Detalle', 'Valor']],
      body: section.items.map((item) => [
        item.concept,
        item.subtype ?? '—',
        item.source,
        item.detail ?? '—',
        formatCOP(item.amount),
      ]),
      foot: [[{ content: 'TOTAL', colSpan: 4, styles: { halign: 'right' } }, formatCOP(section.total)]],
      theme: 'striped',
      styles: { fontSize: 8.5, overflow: 'linebreak' },
      headStyles: { fillColor: PDF.brand, textColor: PDF.white, fontStyle: 'bold' },
      footStyles: { fillColor: PDF.brandLight, textColor: PDF.dark, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 46 },
        1: { cellWidth: 28 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 30, halign: 'right' },
      },
      didDrawPage: footer,
    });
    // @ts-expect-error lastAutoTable lo expone el plugin en runtime
    y = doc.lastAutoTable.finalY + 8;
  }

  doc.save(reportFileName(data, 'pdf'));
}
