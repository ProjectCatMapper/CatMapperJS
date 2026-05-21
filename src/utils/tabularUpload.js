import Papa from 'papaparse';
import { readSheet } from 'read-excel-file/browser';
import { strFromU8, unzipSync } from 'fflate';

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

function parseXmlDocument(xml) {
  return new DOMParser().parseFromString(xml, 'application/xml');
}

function getXmlElements(document, tagName) {
  return Array.from(document.getElementsByTagName(tagName));
}

function normalizeXlsxPath(path) {
  const parts = String(path || '')
    .replace(/^\/+/, '')
    .split('/');
  const normalized = [];

  parts.forEach((part) => {
    if (!part || part === '.') return;
    if (part === '..') {
      normalized.pop();
      return;
    }
    normalized.push(part);
  });

  return normalized.join('/');
}

function findFirstWorksheetPath(zipEntries) {
  const workbookEntry = zipEntries['xl/workbook.xml'];
  const relsEntry = zipEntries['xl/_rels/workbook.xml.rels'];

  if (!workbookEntry || !relsEntry) {
    return 'xl/worksheets/sheet1.xml';
  }

  const workbook = parseXmlDocument(strFromU8(workbookEntry));
  const firstSheet = getXmlElements(workbook, 'sheet')[0];
  const relationshipId = firstSheet?.getAttribute('r:id');

  if (!relationshipId) {
    return 'xl/worksheets/sheet1.xml';
  }

  const rels = parseXmlDocument(strFromU8(relsEntry));
  const relationship = getXmlElements(rels, 'Relationship').find(
    (rel) => rel.getAttribute('Id') === relationshipId
  );
  const target = relationship?.getAttribute('Target');

  if (!target) {
    return 'xl/worksheets/sheet1.xml';
  }

  return normalizeXlsxPath(target.startsWith('/') ? target : `xl/${target}`);
}

async function spreadsheetHasMergedCells(file) {
  const buffer = await file.arrayBuffer();
  const zipEntries = unzipSync(new Uint8Array(buffer));
  const worksheetPath = findFirstWorksheetPath(zipEntries);
  const worksheetEntry = zipEntries[worksheetPath];

  if (!worksheetEntry) {
    return false;
  }

  const worksheet = parseXmlDocument(strFromU8(worksheetEntry));
  return getXmlElements(worksheet, 'mergeCell').length > 0;
}

async function parseSpreadsheetRows(file, { checkMergedCells }) {
  if (checkMergedCells && await spreadsheetHasMergedCells(file)) {
    throw new Error('Merged cells detected. Please unmerge all cells before uploading.');
  }

  const rows = await readSheet(file, 1, { trim: false });

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('No worksheet found in uploaded file.');
  }

  const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const rows2dRaw = rows.map((row) => {
    const values = row.map((cell) => normalizeExcelCellValue(cell));
    while (values.length < width) {
      values.push('');
    }
    return values;
  });

  return {
    rows2dRaw,
    sheetName: 'Sheet1',
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

function isEmptyCellValue(value) {
  return String(value ?? '').trim() === '';
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

function getFullyEmptyColumnInfo(headers = [], rows = []) {
  const keepIndices = [];
  const droppedHeaders = [];

  headers.forEach((header, index) => {
    const hasNonEmptyValue = rows.some((row) => !isEmptyCellValue(row[index]));
    if (hasNonEmptyValue) {
      keepIndices.push(index);
      return;
    }
    droppedHeaders.push(header);
  });

  return {
    keepIndices,
    droppedHeaders,
  };
}

export async function parseTabularFile(file, options = {}) {
  const opts = {
    trimHeaders: true,
    dropEmptyRows: true,
    dropFullyEmptyColumns: false,
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
  let { rows2dRaw, sheetName } =
    extension === 'xlsx'
      ? await parseSpreadsheetRows(file, { checkMergedCells: opts.checkMergedCells })
      : await parseDelimitedRows(file, extension);

  if (!rows2dRaw.length) {
    throw new Error('No data found in the file.');
  }


  let headers = normalizeHeader(rows2dRaw[0], opts.trimHeaders);
  // Drop columns with empty or whitespace-only header names
  const nonEmptyHeaderIndices = headers
    .map((h, idx) => ({ h, idx }))
    .filter(({ h }) => h !== '')
    .map(({ idx }) => idx);
  const droppedHeaderCount = headers.length - nonEmptyHeaderIndices.length;
  if (droppedHeaderCount > 0) {
    headers = nonEmptyHeaderIndices.map((idx) => headers[idx]);
    rows2dRaw = rows2dRaw.map(row => nonEmptyHeaderIndices.map(idx => row[idx]));
  }
  const { keepIndices, duplicateHeaders } = getDuplicateHeaderInfo(headers);
  const warnings = [];
  let rows2d = rows2dRaw.slice(1);
  let finalHeaders = headers;
  if (opts.dropDuplicateHeaders && duplicateHeaders.length > 0) {
    finalHeaders = keepIndices.map((index) => headers[index]);
    rows2d = rows2d.map((row) => keepIndices.map((index) => row[index]));
    warnings.push(
      `Duplicate column name(s) removed: ${duplicateHeaders.join(', ')}`
    );
  }

  if (opts.dropFullyEmptyColumns) {
    const {
      keepIndices: nonEmptyColumnIndices,
      droppedHeaders,
    } = getFullyEmptyColumnInfo(finalHeaders, rows2d);

    if (droppedHeaders.length > 0) {
      finalHeaders = nonEmptyColumnIndices.map((index) => finalHeaders[index]);
      rows2d = rows2d.map((row) => nonEmptyColumnIndices.map((index) => row[index]));
      warnings.push(
        `Empty column(s) removed: ${droppedHeaders.join(', ')}`
      );
    }
  }

  if (opts.dropEmptyRows) {
    rows2d = rows2d.filter((row) =>
      row.some((cell) => !isEmptyCellValue(cell))
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
