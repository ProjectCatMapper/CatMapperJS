import ExcelJS from 'exceljs';

const XLSX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

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

function addJsonSheet(workbook, rows, { sheetName = 'Sheet1', headers } = {}) {
  const worksheet = workbook.addWorksheet(sanitizeSheetName(sheetName));
  const finalHeaders = collectHeaders(rows, headers);

  if (finalHeaders.length > 0) {
    worksheet.addRow(finalHeaders);
  }

  (rows || []).forEach((row) => {
    const values = finalHeaders.map((header) => normalizeCellValue(row?.[header]));
    worksheet.addRow(values);
  });
}

async function triggerWorkbookDownload(workbook, fileName) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: XLSX_MIME_TYPE });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadJsonAsXlsx(
  rows,
  { fileName = 'export.xlsx', sheetName = 'Sheet1', headers } = {}
) {
  const workbook = new ExcelJS.Workbook();
  addJsonSheet(workbook, rows, { sheetName, headers });
  await triggerWorkbookDownload(workbook, fileName);
}

export async function downloadSheetsAsXlsx(
  sheets = [],
  { fileName = 'export.xlsx' } = {}
) {
  const workbook = new ExcelJS.Workbook();
  sheets.forEach((sheet, index) => {
    addJsonSheet(workbook, sheet?.rows || [], {
      sheetName: sheet?.sheetName || `Sheet${index + 1}`,
      headers: sheet?.headers,
    });
  });
  await triggerWorkbookDownload(workbook, fileName);
}
