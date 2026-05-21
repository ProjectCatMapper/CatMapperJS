import writeXlsxFile from 'write-excel-file/browser';

const INVALID_SHEET_CHARS = /[\\/?*:[\]]/g;
const MAX_SHEET_NAME_LENGTH = 31;

function sanitizeSheetName(name = 'Sheet1') {
  const fallback = 'Sheet1';
  const normalized = String(name || fallback)
    .replace(INVALID_SHEET_CHARS, ' ')
    .trim();
  const safe = normalized || fallback;
  return safe.slice(0, MAX_SHEET_NAME_LENGTH);
}

function normalizeCellValue(value) {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((part) => normalizeCellValue(part)).join(', ');
  if (typeof value === 'object') {
    if (typeof value.text === 'string') return value.text;
    if (Array.isArray(value.richText)) {
      return value.richText.map((part) => part?.text || '').join('');
    }
    try {
      return JSON.stringify(value);
    } catch (_error) {
      return String(value);
    }
  }
  return value;
}

function collectHeaders(rows = [], headers) {
  if (Array.isArray(headers) && headers.length > 0) {
    return headers.map((header) => String(header));
  }

  const discovered = new Set();
  rows.forEach((row) => {
    if (!row || typeof row !== 'object') return;
    Object.keys(row).forEach((key) => discovered.add(key));
  });
  return Array.from(discovered);
}

function createJsonSheet(rows, { sheetName = 'Sheet1', headers } = {}) {
  const finalHeaders = collectHeaders(rows, headers);
  const sheetRows = [];

  if (finalHeaders.length > 0) {
    sheetRows.push(finalHeaders);
  }

  (rows || []).forEach((row) => {
    const values = finalHeaders.map((header) => normalizeCellValue(row?.[header]));
    sheetRows.push(values);
  });

  return {
    data: sheetRows,
    sheet: sanitizeSheetName(sheetName),
  };
}

export async function downloadJsonAsXlsx(
  rows,
  { fileName = 'export.xlsx', sheetName = 'Sheet1', headers } = {}
) {
  const sheet = createJsonSheet(rows, { sheetName, headers });
  await writeXlsxFile(sheet.data, { sheet: sheet.sheet }).toFile(fileName);
}

export async function downloadSheetsAsXlsx(
  sheets = [],
  { fileName = 'export.xlsx' } = {}
) {
  const sheetData = sheets.map((sheet, index) =>
    createJsonSheet(sheet?.rows || [], {
      sheetName: sheet?.sheetName || `Sheet${index + 1}`,
      headers: sheet?.headers,
    })
  );
  await writeXlsxFile(sheetData).toFile(fileName);
}
