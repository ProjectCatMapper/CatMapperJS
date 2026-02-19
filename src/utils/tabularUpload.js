import * as XLSX from 'xlsx';

const SUPPORTED_EXTENSIONS = new Set(['csv', 'tsv', 'xls', 'xlsx']);

export function getFileExtension(fileName = '') {
  const parts = String(fileName).toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() : '';
}

export function isSupportedTabularFile(file) {
  if (!file) return false;
  return SUPPORTED_EXTENSIONS.has(getFileExtension(file.name));
}

function normalizeHeader(headers, trimHeaders) {
  return headers.map((col) => {
    const value = col == null ? '' : String(col);
    return trimHeaders ? value.trim() : value;
  });
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
    ...options,
  };

  if (!isSupportedTabularFile(file)) {
    throw new Error('Please upload a valid file (.csv, .tsv, .xls, or .xlsx).');
  }

  const extension = getFileExtension(file.name);
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    type: 'array',
    raw: false,
    dense: true,
    FS: extension === 'tsv' ? '\t' : ',',
  });

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error('No worksheet found in uploaded file.');
  }

  if (opts.checkMergedCells) {
    const merges = worksheet['!merges'] || [];
    if (merges.length > 0) {
      throw new Error('Merged cells detected. Please unmerge all cells before uploading.');
    }
  }

  const rows2dRaw = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (!rows2dRaw.length) {
    throw new Error('No data found in the file.');
  }

  const headers = normalizeHeader(rows2dRaw[0], opts.trimHeaders);
  if (headers.some((h) => h === '')) {
    throw new Error('Missing column name in header row.');
  }

  let rows2d = rows2dRaw.slice(1).map((row) => {
    const padded = Array(headers.length).fill('');
    row.forEach((cell, idx) => {
      if (idx < headers.length) padded[idx] = cell;
    });
    return padded;
  });

  if (opts.dropEmptyRows) {
    rows2d = rows2d.filter((row) =>
      row.some((cell) => String(cell ?? '').trim() !== '')
    );
  }

  const records = toRecords(headers, rows2d, opts);

  return {
    extension,
    sheetName,
    headers,
    rows2d,
    records,
  };
}

