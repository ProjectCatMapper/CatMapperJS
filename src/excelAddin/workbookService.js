const METADATA_SHEET = '_CatMapper_Addin';
const METADATA_HEADERS = [
  'recordType',
  'runId',
  'rowId',
  'candidateIndex',
  'selectedIndex',
  'payloadJson',
];
const MULTIPLE_MATCH_PLACEHOLDER = 'multiple';
const MATCH_TYPE_FILL_COLORS = {
  blank: '#FFFFFF',
  'exact match': '#FFFFFF',
  'fuzzy match': '#F6C594',
  'one-to-many': '#F6AD94',
  'many-to-one': '#e48dd9',
  none: '#FFFFCC',
};

export class WorkbookValidationError extends Error {
  constructor(message, code = 'INVALID_SELECTION') {
    super(message);
    this.name = 'WorkbookValidationError';
    this.code = code;
  }
}

export class ExistingTranslationError extends Error {
  constructor(existingRunId) {
    super('This source column already has a CatMapper translation block. Refresh the existing block instead of inserting another one.');
    this.name = 'ExistingTranslationError';
    this.code = 'EXISTING_TRANSLATION';
    this.existingRunId = existingRunId;
  }
}

const isBlank = (value) => value === null || value === undefined || String(value).trim() === '';

const toExcelValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' && !Number.isFinite(value)) return '';
  if (Array.isArray(value)) return value.map((item) => String(item ?? '')).join('; ');
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
};

const safeJsonParse = (value) => {
  try {
    return JSON.parse(String(value || ''));
  } catch (_error) {
    return null;
  }
};

const excelApi = () => {
  if (!globalThis.Excel?.run) {
    throw new Error('Excel JavaScript API is not available. Open this add-in inside Excel.');
  }
  return globalThis.Excel;
};

const normalizeAddress = (address = '') => String(address).split('!').pop().replace(/\$/g, '');

export const columnNumberToName = (zeroBasedColumn) => {
  let value = Number(zeroBasedColumn) + 1;
  let name = '';
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
};

const worksheetAddress = (worksheetName, rowIndex, columnIndex, rowCount, columnCount = 1) => {
  const sheet = `'${String(worksheetName || '').replace(/'/g, "''")}'`;
  const first = `${columnNumberToName(columnIndex)}${rowIndex + 1}`;
  const last = `${columnNumberToName(columnIndex + columnCount - 1)}${rowIndex + rowCount}`;
  return `${sheet}!${first}:${last}`;
};

export const validateSelectedColumnSnapshot = (snapshot = {}) => {
  const values = Array.isArray(snapshot.values) ? snapshot.values : [];
  if ((snapshot.areaCount ?? 1) !== 1 || String(snapshot.address || '').includes(',')) {
    throw new WorkbookValidationError(
      'Select one contiguous column, including its header and data rows.',
      'DISCONTIGUOUS_SELECTION',
    );
  }
  if (snapshot.columnCount !== 1) {
    throw new WorkbookValidationError(
      'Select exactly one column, including its header and data rows.',
      'MULTIPLE_COLUMNS',
    );
  }
  if (snapshot.isMerged) {
    throw new WorkbookValidationError(
      'The selected column contains merged cells. Unmerge them before translating.',
      'MERGED_CELLS',
    );
  }
  if (snapshot.isProtected) {
    throw new WorkbookValidationError(
      'This worksheet is protected. Unprotect it before translating.',
      'PROTECTED_SHEET',
    );
  }
  if (!values.length || isBlank(values[0]?.[0])) {
    throw new WorkbookValidationError(
      'The first selected cell must contain a column header.',
      'MISSING_HEADER',
    );
  }

  let finalRow = values.length - 1;
  while (finalRow > 0 && isBlank(values[finalRow]?.[0])) finalRow -= 1;
  if (finalRow < 1) {
    throw new WorkbookValidationError(
      'Select the header and at least one data row.',
      'MISSING_DATA',
    );
  }

  const trimmedValues = values.slice(0, finalRow + 1).map((row) => [row?.[0] ?? '']);
  const rowData = trimmedValues.slice(1).map(([value], index) => ({
    rowId: `cm-row-${index + 1}`,
    relativeRowIndex: index,
    worksheetRowIndex: Number(snapshot.rowIndex || 0) + index + 1,
    value,
    isBlank: isBlank(value),
  }));

  return {
    address: snapshot.worksheetName
      ? worksheetAddress(
        snapshot.worksheetName,
        Number(snapshot.rowIndex || 0),
        Number(snapshot.columnIndex || 0),
        trimmedValues.length,
      )
      : snapshot.address,
    worksheetId: snapshot.worksheetId || '',
    worksheetName: snapshot.worksheetName || '',
    rowIndex: Number(snapshot.rowIndex || 0),
    columnIndex: Number(snapshot.columnIndex || 0),
    rowCount: trimmedValues.length,
    columnCount: 1,
    header: String(trimmedValues[0][0]).trim(),
    values: trimmedValues,
    rowData,
    availableColumns: (snapshot.availableColumns || []).map((column) => ({
      ...column,
      values: (column.values || []).slice(0, finalRow),
    })),
    table: snapshot.table || null,
  };
};

export const deriveOutputFields = (run = {}) => {
  const order = run.order || run.response?.order || run.outputFields || [];
  const inputFields = new Set([
    ...(run.inputFields || []),
    ...(run.echoedInputFields || []),
    run.selection?.header,
    'CMuniqueRowID',
  ].filter(Boolean).map(String));
  return [...new Set((Array.isArray(order) ? order : []).map(String))]
    .filter((field) => field && !inputFields.has(field));
};

export const createUniqueHeaders = (fields = [], existingHeaders = []) => {
  const used = new Set(existingHeaders.filter((value) => !isBlank(value)).map((value) => String(value).toLowerCase()));
  return fields.map((field) => {
    const base = String(field || 'CatMapper');
    let header = base;
    let suffix = 2;
    while (used.has(header.toLowerCase())) {
      header = `${base} (${suffix})`;
      suffix += 1;
    }
    used.add(header.toLowerCase());
    return header;
  });
};

const candidateRowId = (candidate) => String(
  candidate?.CMuniqueRowID ?? candidate?.rowId ?? candidate?.sourceRowId ?? '',
);

const matchTypeFillColor = (candidate) => {
  const normalized = String(candidate?.matchType_Name ?? '').trim().toLowerCase();
  if (!normalized) return MATCH_TYPE_FILL_COLORS.blank;
  return MATCH_TYPE_FILL_COLORS[normalized] || MATCH_TYPE_FILL_COLORS.none;
};

const usesMultiplePlaceholder = (field) =>
  /^(CMID|CMName|matchingName)(?:_|$)/i.test(String(field || '')) ||
  /^matching(?:_|$)/i.test(String(field || ''));

export const groupCandidatesForRun = (run = {}, rowIds = []) => {
  const groups = {};
  const supplied = run.candidatesByRow;
  if (supplied instanceof Map) {
    supplied.forEach((candidates, rowId) => { groups[String(rowId)] = [...(candidates || [])]; });
  } else if (supplied && typeof supplied === 'object') {
    Object.entries(supplied).forEach(([rowId, candidates]) => {
      groups[String(rowId)] = Array.isArray(candidates) ? [...candidates] : [];
    });
  } else {
    const candidates = run.candidates || run.response?.rows || run.rows || [];
    candidates.forEach((candidate) => {
      const rowId = candidateRowId(candidate);
      if (!rowId) return;
      if (!groups[rowId]) groups[rowId] = [];
      groups[rowId].push(candidate);
    });
  }
  rowIds.forEach((rowId) => { if (!groups[String(rowId)]) groups[String(rowId)] = []; });
  return groups;
};

export const buildTranslationPlan = (run = {}, existingHeaders = []) => {
  const selection = run.selection;
  if (!selection?.rowData?.length) {
    throw new Error('Translation run is missing a captured source selection.');
  }
  const outputFields = deriveOutputFields(run);
  if (!outputFields.length) throw new Error('The translation response did not contain any output columns.');
  const rowIds = (run.rowIds || selection.rowData.map((row) => row.rowId)).map(String);
  if (rowIds.length !== selection.rowData.length) {
    throw new Error('The translation result row count does not match the selected source rows.');
  }
  const candidatesByRow = groupCandidatesForRun(run, rowIds);
  const selectedIndices = { ...(run.selectedIndices || {}) };
  const headers = createUniqueHeaders(outputFields, existingHeaders);
  const data = rowIds.map((rowId) => {
    const index = Number.isInteger(selectedIndices[rowId]) ? selectedIndices[rowId] : 0;
    const candidates = candidatesByRow[rowId] || [];
    const candidate = candidates[index] || {};
    const hasMultipleMatches = candidates.length > 1;
    return outputFields.map((field) =>
      hasMultipleMatches && usesMultiplePlaceholder(field)
        ? MULTIPLE_MATCH_PLACEHOLDER
        : toExcelValue(candidate[field]));
  });
  const rowFillColors = rowIds.map((rowId) => {
    const index = Number.isInteger(selectedIndices[rowId]) ? selectedIndices[rowId] : 0;
    const candidates = candidatesByRow[rowId] || [];
    const candidate = candidates[index] || {};
    return matchTypeFillColor(candidate);
  });
  return { outputFields, headers, rowIds, candidatesByRow, selectedIndices, data, rowFillColors };
};

export const serializeRuns = (runs = []) => {
  const rows = [METADATA_HEADERS];
  runs.forEach((run) => {
    const { candidatesByRow = {}, ...metadata } = run;
    rows.push(['RUN', run.runId, '', '', '', JSON.stringify(metadata)]);
    Object.entries(candidatesByRow).forEach(([rowId, candidates]) => {
      (candidates || []).forEach((candidate, index) => {
        rows.push([
          'CANDIDATE',
          run.runId,
          rowId,
          index,
          Number(run.selectedIndices?.[rowId] || 0),
          JSON.stringify(candidate),
        ]);
      });
    });
  });
  return rows;
};

export const deserializeRuns = (values = []) => {
  if (!Array.isArray(values) || values.length < 2) return [];
  const runs = new Map();
  values.slice(1).forEach((row) => {
    const [recordType, rawRunId, rawRowId, rawCandidateIndex, rawSelectedIndex, payloadJson] = row || [];
    const runId = String(rawRunId || '');
    if (!runId) return;
    if (recordType === 'RUN') {
      const payload = safeJsonParse(payloadJson);
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        throw new WorkbookValidationError(
          'CatMapper workbook metadata is damaged. Existing worksheet values were not changed; rerun translation to restore alternative selection.',
          'DAMAGED_METADATA',
        );
      }
      runs.set(runId, { ...payload, runId, candidatesByRow: payload.candidatesByRow || {} });
      return;
    }
    if (recordType !== 'CANDIDATE') return;
    const payload = safeJsonParse(payloadJson);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new WorkbookValidationError(
        'CatMapper workbook metadata is damaged. Existing worksheet values were not changed; rerun translation to restore alternative selection.',
        'DAMAGED_METADATA',
      );
    }
    if (!runs.has(runId)) runs.set(runId, { runId, candidatesByRow: {}, selectedIndices: {} });
    const run = runs.get(runId);
    const rowId = String(rawRowId || '');
    if (!run.candidatesByRow[rowId]) run.candidatesByRow[rowId] = [];
    run.candidatesByRow[rowId][Number(rawCandidateIndex || 0)] = payload;
    run.selectedIndices = run.selectedIndices || {};
    run.selectedIndices[rowId] = Number(rawSelectedIndex || 0);
  });
  return [...runs.values()];
};

const namedRangeName = (prefix, runId) => {
  const clean = String(runId).replace(/[^A-Za-z0-9_]/g, '_').slice(0, 180);
  return `CM_${prefix}_${clean || 'run'}`;
};

const getMetadataSheet = async (context, create = false) => {
  const sheets = context.workbook.worksheets;
  const sheet = sheets.getItemOrNullObject(METADATA_SHEET);
  sheet.load('isNullObject');
  await context.sync();
  if (!sheet.isNullObject) return sheet;
  if (!create) return null;
  const added = sheets.add(METADATA_SHEET);
  added.visibility = globalThis.Excel?.SheetVisibility?.veryHidden || 'VeryHidden';
  return added;
};

const hasManagedNamedRanges = async (context) => {
  const names = context.workbook.names;
  if (typeof names?.load !== 'function') return false;
  names.load('items/name');
  await context.sync();
  return (names.items || []).some((item) => /^CM_(SOURCE|OUTPUT)_/i.test(String(item.name || '')));
};

const readRunsInContext = async (context, { allowMetadataRecovery = false } = {}) => {
  const sheet = await getMetadataSheet(context, false);
  if (!sheet) {
    if (await hasManagedNamedRanges(context)) {
      if (allowMetadataRecovery) return [];
      throw new WorkbookValidationError(
        'CatMapper workbook metadata is missing. Existing worksheet values were not changed; rerun translation to restore alternative selection.',
        'MISSING_METADATA',
      );
    }
    return [];
  }
  const used = sheet.getUsedRangeOrNullObject(true);
  used.load(['isNullObject', 'values']);
  await context.sync();
  if (used.isNullObject) {
    if (await hasManagedNamedRanges(context)) {
      if (allowMetadataRecovery) return [];
      throw new WorkbookValidationError(
        'CatMapper workbook metadata is missing. Existing worksheet values were not changed; rerun translation to restore alternative selection.',
        'MISSING_METADATA',
      );
    }
    return [];
  }
  try {
    return deserializeRuns(used.values);
  } catch (error) {
    if (allowMetadataRecovery && error?.code === 'DAMAGED_METADATA') return [];
    throw error;
  }
};

const writeRunsInContext = async (context, runs) => {
  const sheet = await getMetadataSheet(context, true);
  const values = serializeRuns(runs);
  const old = sheet.getUsedRangeOrNullObject();
  old.load('isNullObject');
  await context.sync();
  if (!old.isNullObject) old.clear(globalThis.Excel?.ClearApplyTo?.all || 'All');
  // Chunking avoids creating an oversized request for large translations.
  const chunkSize = 2000;
  for (let offset = 0; offset < values.length; offset += chunkSize) {
    const chunk = values.slice(offset, offset + chunkSize);
    sheet.getRangeByIndexes(offset, 0, chunk.length, METADATA_HEADERS.length).values = chunk;
    await context.sync();
  }
  sheet.visibility = globalThis.Excel?.SheetVisibility?.veryHidden || 'VeryHidden';
};

const loadNamedRange = async (context, name) => {
  const item = context.workbook.names.getItemOrNullObject(name);
  item.load('isNullObject');
  await context.sync();
  if (item.isNullObject) return null;
  const range = item.getRange();
  range.load(['address', 'rowIndex', 'columnIndex', 'rowCount', 'columnCount']);
  await context.sync();
  return range;
};

const getSelectionSnapshot = async (context) => {
  const workbook = context.workbook;
  let areaCount = 1;
  let range;
  if (typeof workbook.getSelectedRanges === 'function') {
    const areas = workbook.getSelectedRanges();
    areas.load(['areaCount', 'address']);
    areas.areas?.load('items');
    await context.sync();
    areaCount = areas.areaCount;
    if (areaCount !== 1) {
      return { address: areas.address, areaCount, columnCount: 0, values: [] };
    }
    range = areas.areas?.items?.[0] || areas.getItemAt?.(0);
  }
  range = range || workbook.getSelectedRange();
  range.load([
    'address', 'values', 'rowCount', 'columnCount', 'rowIndex', 'columnIndex',
  ]);
  range.worksheet.load(['id', 'name']);
  const protection = range.worksheet.protection;
  protection.load('protected');
  let merged = null;
  if (typeof range.getMergedAreasOrNullObject === 'function') {
    merged = range.getMergedAreasOrNullObject();
    merged.load('isNullObject');
  }
  let tables = null;
  if (typeof range.getTables === 'function') {
    tables = range.getTables(false);
    tables.load('items');
  }
  await context.sync();

  let table = null;
  if (tables?.items?.length > 1) {
    throw new WorkbookValidationError(
      'The selected column crosses more than one Excel table.',
      'MULTIPLE_TABLES',
    );
  }
  if (tables?.items?.length === 1) {
    const item = tables.items[0];
    const tableRange = item.getRange();
    item.load(['id', 'name']);
    tableRange.load(['address', 'rowIndex', 'columnIndex', 'rowCount', 'columnCount']);
    await context.sync();
    table = {
      id: item.id,
      name: item.name,
      address: tableRange.address,
      rowIndex: tableRange.rowIndex,
      columnIndex: tableRange.columnIndex,
      rowCount: tableRange.rowCount,
      columnCount: tableRange.columnCount,
      sourceColumnIndex: range.columnIndex - tableRange.columnIndex,
    };
  }

  let availableColumns = [];
  const used = range.worksheet.getUsedRangeOrNullObject(true);
  used.load(['isNullObject', 'columnIndex', 'columnCount']);
  await context.sync();
  if (!used.isNullObject && used.columnCount > 0) {
    const aligned = range.worksheet.getRangeByIndexes(
      range.rowIndex,
      used.columnIndex,
      range.rowCount,
      used.columnCount,
    );
    aligned.load('values');
    await context.sync();
    const alignedValues = aligned.values || [];
    availableColumns = (alignedValues[0] || []).reduce((columns, header, offset) => {
      if (isBlank(header)) return columns;
      columns.push({
        header: String(header).trim(),
        columnIndex: used.columnIndex + offset,
        values: alignedValues.slice(1).map((row) => row?.[offset] ?? ''),
      });
      return columns;
    }, []);
  }
  return {
    address: range.address,
    areaCount,
    values: range.values,
    rowCount: range.rowCount,
    columnCount: range.columnCount,
    rowIndex: range.rowIndex,
    columnIndex: range.columnIndex,
    worksheetId: range.worksheet.id,
    worksheetName: range.worksheet.name,
    isMerged: Boolean(merged && !merged.isNullObject),
    isProtected: Boolean(protection.protected),
    availableColumns,
    table,
  };
};

const loadExistingHeaders = async (context, selection) => {
  const sheet = context.workbook.worksheets.getItem(selection.worksheetName);
  const used = sheet.getUsedRangeOrNullObject(true);
  used.load(['isNullObject', 'columnIndex', 'columnCount']);
  await context.sync();
  if (used.isNullObject) return [];
  const headerRange = sheet.getRangeByIndexes(selection.rowIndex, used.columnIndex, 1, used.columnCount);
  headerRange.load('values');
  await context.sync();
  return headerRange.values?.[0] || [];
};

const addNamedRange = (context, name, range) => {
  const existing = context.workbook.names.getItemOrNullObject(name);
  existing.load('isNullObject');
  return context.sync().then(() => {
    if (!existing.isNullObject) existing.delete();
    context.workbook.names.add(name, range);
  });
};

const applyRowFillColors = async (context, outputRange, rowFillColors = [], columnCount = 1) => {
  if (!rowFillColors.length) return;
  for (let rowIndex = 0; rowIndex < rowFillColors.length; rowIndex += 1) {
    const color = rowFillColors[rowIndex];
    if (!color) continue;
    const rowRange = outputRange.getCell(rowIndex, 0).getResizedRange(0, columnCount - 1);
    if (rowRange.format?.fill) rowRange.format.fill.color = color;
  }
  await context.sync();
};

const writeOutputValues = async (context, outputRange, headers, data, rowFillColors = []) => {
  const columnCount = headers.length;
  outputRange.getCell(0, 0).getResizedRange(0, columnCount - 1).values = [headers];
  await context.sync();
  const chunkSize = 2000;
  for (let offset = 0; offset < data.length; offset += chunkSize) {
    const chunk = data.slice(offset, offset + chunkSize);
    outputRange.getCell(offset + 1, 0)
      .getResizedRange(chunk.length - 1, columnCount - 1).values = chunk;
    await context.sync();
  }
  await applyRowFillColors(
    context,
    outputRange.getCell(1, 0).getResizedRange(data.length - 1, columnCount - 1),
    rowFillColors,
    columnCount,
  );
};

const writeOutputData = async (context, outputRange, headers, data, rowFillColors = []) => {
  const columnCount = headers.length;
  const chunkSize = 2000;
  for (let offset = 0; offset < data.length; offset += chunkSize) {
    const chunk = data.slice(offset, offset + chunkSize);
    outputRange.getCell(offset, 0)
      .getResizedRange(chunk.length - 1, columnCount - 1).values = chunk;
    await context.sync();
  }
  await applyRowFillColors(context, outputRange, rowFillColors, columnCount);
};

const insertOutputColumns = async (context, selection, plan) => {
  const sheet = context.workbook.worksheets.getItem(selection.worksheetName);
  const insertAt = selection.columnIndex + 1;
  const outputRowIndex = Number(selection.table?.rowIndex ?? selection.rowIndex);
  let insertedAsTableColumns = false;
  if (selection.table) {
    const table = sheet.tables.getItemOrNullObject(selection.table.name || selection.table.id);
    table.load('isNullObject');
    await context.sync();
    if (!table.isNullObject && table.columns?.add) {
      for (let index = 0; index < plan.headers.length; index += 1) {
        table.columns.add(selection.table.sourceColumnIndex + 1 + index, null, plan.headers[index]);
      }
      insertedAsTableColumns = true;
    }
  }
  if (!insertedAsTableColumns) {
    const first = columnNumberToName(insertAt);
    const last = columnNumberToName(insertAt + plan.headers.length - 1);
    sheet.getRange(`${first}:${last}`).insert(globalThis.Excel?.InsertShiftDirection?.right || 'Right');
  }
  const outputRange = sheet.getRangeByIndexes(
    outputRowIndex,
    insertAt,
    selection.rowCount,
    plan.outputFields.length,
  );
  if (insertedAsTableColumns) {
    await context.sync();
    await writeOutputData(
      context,
      outputRange.getCell(1, 0).getResizedRange(plan.data.length - 1, plan.outputFields.length - 1),
      plan.headers,
      plan.data,
      plan.rowFillColors,
    );
  } else {
    await writeOutputValues(context, outputRange, plan.headers, plan.data, plan.rowFillColors);
  }
  return { outputRange, insertedAsTableColumns };
};

const parseCellAddress = (address) => {
  const clean = normalizeAddress(address).split(':')[0];
  const match = /^([A-Z]+)(\d+)$/i.exec(clean);
  if (!match) return null;
  let column = 0;
  for (const char of match[1].toUpperCase()) column = (column * 26) + char.charCodeAt(0) - 64;
  return { rowIndex: Number(match[2]) - 1, columnIndex: column - 1 };
};

const pointInsideRange = (point, range) => point &&
  point.rowIndex >= range.rowIndex && point.rowIndex < range.rowIndex + range.rowCount &&
  point.columnIndex >= range.columnIndex && point.columnIndex < range.columnIndex + range.columnCount;

export class WorkbookService {
  constructor({ excel } = {}) {
    this.excel = excel || null;
    this.selectionHandlers = [];
  }

  get runtime() {
    return this.excel || excelApi();
  }

  async captureSelectedColumn() {
    try {
      return await this.runtime.run(async (context) =>
        validateSelectedColumnSnapshot(await getSelectionSnapshot(context)));
    } catch (error) {
      const message = String(error?.message || '');
      if (error?.code === 'InvalidArgument' || /multiple ranges|multiple selection/i.test(message)) {
        throw new WorkbookValidationError(
          'Select one contiguous column, including its header and data rows.',
          'DISCONTIGUOUS_SELECTION',
        );
      }
      throw error;
    }
  }

  async writeTranslationRun(run) {
    return this.runtime.run(async (context) => {
      const runId = String(run.runId || run.id || `run-${Date.now()}`);
      const existingRuns = await readRunsInContext(context, { allowMetadataRecovery: true });
      const refreshRunId = run.refreshRunId ? String(run.refreshRunId) : '';
      if (refreshRunId) {
        const priorIndex = existingRuns.findIndex((item) => item.runId === refreshRunId);
        if (priorIndex < 0) {
          throw new Error(`The CatMapper translation block ${refreshRunId} is no longer available to refresh.`);
        }
        const priorRun = existingRuns[priorIndex];
        const plan = buildTranslationPlan(run, []);
        if (plan.outputFields.length !== priorRun.outputFields?.length) {
          throw new Error(
            `Refresh returned ${plan.outputFields.length} output columns, but the existing block has ${priorRun.outputFields?.length || 0}. Create a new translation block instead.`,
          );
        }
        const outputRange = await loadNamedRange(context, priorRun.outputRangeName);
        const sourceRange = await loadNamedRange(context, priorRun.sourceRangeName);
        if (!outputRange || !sourceRange) {
          throw new Error('The translated column metadata is missing. Create a new translation block.');
        }
        if (outputRange.rowCount !== plan.data.length + 1 || outputRange.columnCount !== plan.outputFields.length) {
          throw new Error('The translated block size changed in Excel. Create a new translation block instead of refreshing it.');
        }
        const sameFields = plan.outputFields.every((field, index) => field === priorRun.outputFields[index]);
        const existingHeaders = sameFields
          ? []
          : await loadExistingHeaders(context, {
            worksheetName: priorRun.worksheetName,
            rowIndex: sourceRange.rowIndex,
          });
        const priorHeaderSet = new Set((priorRun.worksheetHeaders || []).map(String));
        const headers = sameFields
          ? (priorRun.worksheetHeaders || plan.headers)
          : createUniqueHeaders(
            plan.outputFields,
            existingHeaders.filter((header) => !priorHeaderSet.has(String(header))),
          );
        await writeOutputValues(context, outputRange, headers, plan.data, plan.rowFillColors);
        const persisted = {
          ...priorRun,
          outputFields: plan.outputFields,
          worksheetHeaders: headers,
          rowIds: plan.rowIds,
          selectedIndices: plan.selectedIndices,
          candidatesByRow: plan.candidatesByRow,
          configuration: run.configuration || run.config || {},
          sourceAddress: sourceRange.address,
          refreshedAt: new Date().toISOString(),
        };
        existingRuns[priorIndex] = persisted;
        await writeRunsInContext(context, existingRuns);
        await context.sync();
        return persisted;
      }

      const duplicateId = existingRuns.find((item) => item.runId === runId);
      if (duplicateId) throw new ExistingTranslationError(duplicateId.runId);
      if (!run.allowDuplicateSource) {
        for (const existing of existingRuns) {
          if (existing.worksheetName !== run.selection.worksheetName) continue;
          const existingSource = await loadNamedRange(context, existing.sourceRangeName);
          if (existingSource &&
            existingSource.rowIndex === run.selection.rowIndex &&
            existingSource.columnIndex === run.selection.columnIndex) {
            throw new ExistingTranslationError(existing.runId);
          }
        }
      }
      const existingHeaders = await loadExistingHeaders(context, run.selection);
      const plan = buildTranslationPlan(run, existingHeaders);
      const { outputRange, insertedAsTableColumns } = await insertOutputColumns(context, run.selection, plan);
      const sourceSheet = context.workbook.worksheets.getItem(run.selection.worksheetName);
      const sourceRange = sourceSheet.getRangeByIndexes(
        run.selection.rowIndex,
        run.selection.columnIndex,
        run.selection.rowCount,
        1,
      );
      const sourceRangeName = namedRangeName('SOURCE', runId);
      const outputRangeName = namedRangeName('OUTPUT', runId);
      await addNamedRange(context, sourceRangeName, sourceRange);
      await addNamedRange(context, outputRangeName, outputRange);

      const persisted = {
        runId,
        worksheetId: run.selection.worksheetId,
        worksheetName: run.selection.worksheetName,
        sourceRangeName,
        outputRangeName,
        sourceAddress: run.selection.address,
        outputFields: plan.outputFields,
        worksheetHeaders: plan.headers,
        rowIds: plan.rowIds,
        selectedIndices: plan.selectedIndices,
        candidatesByRow: plan.candidatesByRow,
        configuration: run.configuration || run.config || {},
        insertedAsTableColumns,
        createdAt: run.createdAt || new Date().toISOString(),
      };
      await writeRunsInContext(context, [...existingRuns, persisted]);
      await context.sync();
      return persisted;
    });
  }

  async loadPersistedRuns() {
    return this.runtime.run((context) => readRunsInContext(context));
  }

  async applyCandidateChoice(runId, rowId, candidateIndex) {
    return this.runtime.run(async (context) => {
      const runs = await readRunsInContext(context);
      const run = runs.find((item) => item.runId === String(runId));
      if (!run) throw new Error(`CatMapper translation run ${runId} was not found.`);
      const rowPosition = (run.rowIds || []).indexOf(String(rowId));
      if (rowPosition < 0) throw new Error(`Source row ${rowId} was not found in run ${runId}.`);
      const candidates = run.candidatesByRow?.[String(rowId)] || [];
      if (!Number.isInteger(candidateIndex) || candidateIndex < 0 || candidateIndex >= candidates.length) {
        throw new Error('The selected CatMapper candidate is no longer available.');
      }
      const outputRange = await loadNamedRange(context, run.outputRangeName);
      if (!outputRange) {
        throw new Error('The translated column metadata is missing. Rerun translation to restore candidate selection.');
      }
      if (outputRange.rowCount !== (run.rowIds || []).length + 1 ||
          outputRange.columnCount !== (run.outputFields || []).length) {
        throw new Error(
          'The translated block structure changed in Excel. Worksheet values were not changed; rerun translation to restore alternative selection.',
        );
      }
      const candidate = candidates[candidateIndex];
      outputRange.getCell(rowPosition + 1, 0)
        .getResizedRange(0, run.outputFields.length - 1).values = [
          run.outputFields.map((field) => toExcelValue(candidate[field])),
        ];
      run.selectedIndices = { ...(run.selectedIndices || {}), [String(rowId)]: candidateIndex };
      await writeRunsInContext(context, runs);
      await context.sync();
      return { runId: run.runId, rowId: String(rowId), candidateIndex, candidate };
    });
  }

  async subscribeToSelection(callback) {
    if (typeof callback !== 'function') throw new TypeError('Selection callback must be a function.');
    const handler = async (event) => {
      try {
        const result = await this.runtime.run(async (context) => {
          const runs = await readRunsInContext(context);
          const applicable = runs.filter((run) => !event.worksheetId || !run.worksheetId || run.worksheetId === event.worksheetId);
          const loaded = [];
          for (const run of applicable) {
            const source = await loadNamedRange(context, run.sourceRangeName);
            const output = await loadNamedRange(context, run.outputRangeName);
            if (!source || !output) continue;
            const expectedRows = (run.rowIds || []).length + 1;
            if (source.rowCount !== expectedRows || output.rowCount !== expectedRows ||
                output.columnCount !== (run.outputFields || []).length) {
              throw new Error(
                'The CatMapper block structure changed in Excel. Existing values were not changed; rerun translation to restore alternative selection.',
              );
            }
            loaded.push({ run, source, output });
          }
          const point = parseCellAddress(event.address);
          const match = loaded.find(({ source, output }) => pointInsideRange(point, source) || pointInsideRange(point, output));
          if (!match || !point || point.rowIndex === match.source.rowIndex) return null;
          const rowPosition = point.rowIndex - match.source.rowIndex - 1;
          const rowId = match.run.rowIds?.[rowPosition];
          if (!rowId) return null;
          return {
            run: match.run,
            runId: match.run.runId,
            rowId,
            rowPosition,
            candidates: match.run.candidatesByRow?.[rowId] || [],
            selectedIndex: Number(match.run.selectedIndices?.[rowId] || 0),
          };
        });
        callback(result);
      } catch (error) {
        callback({ error });
      }
    };
    await this.runtime.run(async (context) => {
      context.workbook.worksheets.onSelectionChanged.add(handler);
      await context.sync();
    });
    this.selectionHandlers.push(handler);
    return () => this.disposeSubscription(handler);
  }

  async disposeSubscription(handler) {
    const index = this.selectionHandlers.indexOf(handler);
    if (index < 0) return;
    await this.runtime.run(async (context) => {
      context.workbook.worksheets.onSelectionChanged.remove(handler);
      await context.sync();
    });
    this.selectionHandlers.splice(index, 1);
  }

  async dispose() {
    const handlers = [...this.selectionHandlers];
    if (!handlers.length) return;
    await this.runtime.run(async (context) => {
      handlers.forEach((handler) => context.workbook.worksheets.onSelectionChanged.remove(handler));
      await context.sync();
    });
    this.selectionHandlers = [];
  }
}

const defaultService = new WorkbookService();

export const captureSelectedColumn = () => defaultService.captureSelectedColumn();
export const writeTranslationRun = (run) => defaultService.writeTranslationRun(run);
export const loadPersistedRuns = () => defaultService.loadPersistedRuns();
export const applyCandidateChoice = (runId, rowId, candidateIndex) =>
  defaultService.applyCandidateChoice(runId, rowId, candidateIndex);
export const subscribeToSelection = (callback) => defaultService.subscribeToSelection(callback);
export const disposeSubscriptions = () => defaultService.dispose();
