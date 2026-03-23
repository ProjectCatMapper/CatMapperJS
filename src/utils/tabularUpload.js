import ExcelJS from 'exceljs';
import Papa from 'papaparse';

const SUPPORTED_EXTENSIONS = new Set(['csv', 'tsv', 'xlsx']);

export function getFileExtension(fileName = '') {
  const parts = String(fileName).toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() : '';
}

export function isSupportedTabularFile(file) {
  if (!file) return false;
  return SUPPORTED_EXTENSIONS.has(getFileExtension(file.name));
}

function normalizeExcelCellValue(value) {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();

  if (typeof value === 'object') {
    if (typeof value.text === 'string') return value.text;

    if (Array.isArray(value.richText)) {
      return value.richText.map((part) => part?.text || '').join('');
    }

    if (Object.prototype.hasOwnProperty.call(value, 'result')) {
      return normalizeExcelCellValue(value.result);
    }

    if (typeof value.hyperlink === 'string') {
      return value.text || value.hyperlink;
    }

    return String(value);
  }

  return value;
}

async function parseSpreadsheetRows(file, { checkMergedCells }) {
  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('No worksheet found in uploaded file.');
  }

  if (checkMergedCells) {
    const merges = Array.isArray(worksheet.model?.merges)
      ? worksheet.model.merges
      : [];
    if (merges.length > 0) {
      throw new Error('Merged cells detected. Please unmerge all cells before uploading.');
    }
  }

  const width = Math.max(worksheet.actualColumnCount || 0, worksheet.columnCount || 0);
  const rows2dRaw = [];

  worksheet.eachRow({ includeEmpty: true }, (row) => {
    const rowWidth = Math.max(width, row.cellCount || 0, row.actualCellCount || 0);
    const rowValues = [];
    for (let idx = 1; idx <= rowWidth; idx += 1) {
      rowValues.push(normalizeExcelCellValue(row.getCell(idx).value));
    }
    rows2dRaw.push(rowValues);
  });

  return {
    rows2dRaw,
    sheetName: worksheet.name || 'Sheet1',
  };
}

async function parseDelimitedRows(file, extension) {
  const text = await file.text();
  const result = Papa.parse(text, {
    delimiter: extension === 'tsv' ? '\t' : '',
    skipEmptyLines: false,
  });

  if (Array.isArray(result.errors) && result.errors.length > 0) {
    throw new Error('Unable to parse the uploaded file.');
  }

  if (!Array.isArray(result.data)) {
    return {
      rows2dRaw: [],
      sheetName: extension.toUpperCase(),
    };
  }

  return {
    rows2dRaw: result.data.map((row) => (Array.isArray(row) ? row : [])),
    sheetName: extension.toUpperCase(),
  };
}

function normalizeHeader(headers, trimHeaders) {
  return headers.map((col) => {
    const value = col == null ? '' : String(col);
    return trimHeaders ? value.trim() : value;
  });
}

function getDuplicateHeaderInfo(headers = []) {
  const seen = new Set();
  const keepIndices = [];
  const duplicateHeaders = [];

  headers.forEach((header, index) => {
    if (!seen.has(header)) {
      seen.add(header);
      keepIndices.push(index);
      return;
    }
    duplicateHeaders.push(header);
  });

  return {
    keepIndices,
    duplicateHeaders: Array.from(new Set(duplicateHeaders)),
  };
}

function toRecords(headers, rows, options) {
  const { stripWrappingQuotes, normalizeEmptyToNull } = options;
  return rows.map((row) => {
    const obj = {};
    headers.forEach((col, idx) => {
      let cell = row[idx];
      if (stripWrappingQuotes && typeof cell === 'string') {
        cell = cell.replace(/^['"]|['"]$/g, '');
      }
      if (normalizeEmptyToNull && cell === '') {
        cell = null;
      }
      obj[col] = cell;
    });
    return obj;
  });
}

export async function parseTabularFile(file, options = {}) {
  const opts = {
    trimHeaders: true,
    dropEmptyRows: true,
    stripWrappingQuotes: false,
    normalizeEmptyToNull: false,
    checkMergedCells: false,
    dropDuplicateHeaders: false,
    ...options,
  };

  if (!isSupportedTabularFile(file)) {
    throw new Error('Please upload a valid file (.csv, .tsv, or .xlsx).');
  }

  const extension = getFileExtension(file.name);
  const { rows2dRaw, sheetName } =
    extension === 'xlsx'
      ? await parseSpreadsheetRows(file, { checkMergedCells: opts.checkMergedCells })
      : await parseDelimitedRows(file, extension);

  if (!rows2dRaw.length) {
    throw new Error('No data found in the file.');
  }

  const headers = normalizeHeader(rows2dRaw[0], opts.trimHeaders);
  if (headers.some((h) => h === '')) {
    throw new Error('Missing column name in header row.');
  }

  const { keepIndices, duplicateHeaders } = getDuplicateHeaderInfo(headers);
  const warnings = [];

  let rows2d = rows2dRaw.slice(1).map((row) => {
    const padded = Array(headers.length).fill('');
    row.forEach((cell, idx) => {
      if (idx < headers.length) padded[idx] = cell;
    });
    return padded;
  });

  let finalHeaders = headers;
  if (opts.dropDuplicateHeaders && duplicateHeaders.length > 0) {
    finalHeaders = keepIndices.map((index) => headers[index]);
    rows2d = rows2d.map((row) => keepIndices.map((index) => row[index]));
    warnings.push(
      `Duplicate column name(s) removed: ${duplicateHeaders.join(', ')}`
    );
  }

  if (opts.dropEmptyRows) {
    rows2d = rows2d.filter((row) =>
      row.some((cell) => String(cell ?? '').trim() !== '')
    );
  }

  const records = toRecords(finalHeaders, rows2d, opts);

  return {
    extension,
    sheetName,
    headers: finalHeaders,
    rows2d,
    records,
    warnings,
  };
}
