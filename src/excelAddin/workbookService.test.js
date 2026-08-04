// @vitest-environment node

import {
  WorkbookService,
  WorkbookValidationError,
  buildTranslationPlan,
  columnNumberToName,
  createUniqueHeaders,
  deriveOutputFields,
  deserializeRuns,
  serializeRuns,
  validateSelectedColumnSnapshot,
} from './workbookService';

const noOpLoad = function load() { return this; };

class FakeRange {
  constructor(sheet, rowIndex, columnIndex, rowCount, columnCount, { isNullObject = false } = {}) {
    this.sheet = sheet;
    this.worksheet = sheet;
    this.rowIndex = rowIndex;
    this.columnIndex = columnIndex;
    this.rowCount = rowCount;
    this.columnCount = columnCount;
    this.isNullObject = isNullObject;
    this.load = noOpLoad;
    Object.defineProperty(this, 'format', {
      value: {
        fill: {
          set color(value) {
            sheet.setFillRange(rowIndex, columnIndex, rowCount, columnCount, value);
          },
        },
      },
    });
  }

  get address() {
    if (this.isNullObject) return '';
    const first = `${columnNumberToName(this.columnIndex)}${this.rowIndex + 1}`;
    const last = `${columnNumberToName(this.columnIndex + this.columnCount - 1)}${this.rowIndex + this.rowCount}`;
    return `${this.sheet.name}!${first}:${last}`;
  }

  get values() {
    if (this.isNullObject) return [];
    return Array.from({ length: this.rowCount }, (_, rowOffset) =>
      Array.from({ length: this.columnCount }, (_, columnOffset) =>
        this.sheet.grid[this.rowIndex + rowOffset]?.[this.columnIndex + columnOffset] ?? '',
      ));
  }

  set values(values) {
    values.forEach((row, rowOffset) => {
      const sheetRow = this.rowIndex + rowOffset;
      while (this.sheet.grid.length <= sheetRow) this.sheet.grid.push([]);
      row.forEach((value, columnOffset) => {
        this.sheet.grid[sheetRow][this.columnIndex + columnOffset] = value;
      });
    });
  }

  getMergedAreasOrNullObject() {
    return { isNullObject: !this.sheet.hasMergedCells, load: noOpLoad };
  }

  getTables() {
    return { items: [], load: noOpLoad };
  }

  insert() {
    for (let rowIndex = 0; rowIndex < this.sheet.grid.length; rowIndex += 1) {
      this.sheet.grid[rowIndex].splice(this.columnIndex, 0, ...Array(this.columnCount).fill(''));
      this.sheet.fills[rowIndex].splice(this.columnIndex, 0, ...Array(this.columnCount).fill(''));
    }
  }

  clear() {
    for (let row = 0; row < this.rowCount; row += 1) {
      for (let column = 0; column < this.columnCount; column += 1) {
        if (this.sheet.grid[this.rowIndex + row]) {
          this.sheet.grid[this.rowIndex + row][this.columnIndex + column] = '';
        }
      }
    }
  }

  delete() {
    for (let rowIndex = 0; rowIndex < this.sheet.grid.length; rowIndex += 1) {
      this.sheet.grid[rowIndex].splice(this.columnIndex, this.columnCount);
      this.sheet.fills[rowIndex].splice(this.columnIndex, this.columnCount);
    }
  }

  getCell(rowOffset, columnOffset) {
    return new FakeRange(this.sheet, this.rowIndex + rowOffset, this.columnIndex + columnOffset, 1, 1);
  }

  getResizedRange(rowDelta, columnDelta) {
    return new FakeRange(
      this.sheet,
      this.rowIndex,
      this.columnIndex,
      this.rowCount + rowDelta,
      this.columnCount + columnDelta,
    );
  }
}

class FakeSheet {
  constructor(name, grid = [], id = name) {
    this.name = name;
    this.id = id;
    this.grid = grid.map((row) => [...row]);
    this.fills = grid.map((row) => row.map(() => ''));
    this.isNullObject = false;
    this.visibility = 'Visible';
    this.hasMergedCells = false;
    this.protection = { protected: false, load: noOpLoad };
    this.load = noOpLoad;
    this.tables = {
      getItemOrNullObject: () => ({ isNullObject: true, load: noOpLoad }),
    };
  }

  getRangeByIndexes(row, column, rowCount, columnCount) {
    return new FakeRange(this, row, column, rowCount, columnCount);
  }

  setFillRange(rowIndex, columnIndex, rowCount, columnCount, color) {
    for (let rowOffset = 0; rowOffset < rowCount; rowOffset += 1) {
      const row = rowIndex + rowOffset;
      while (this.fills.length <= row) this.fills.push([]);
      for (let columnOffset = 0; columnOffset < columnCount; columnOffset += 1) {
        this.fills[row][columnIndex + columnOffset] = color;
      }
    }
  }

  getRange(address) {
    const match = /^([A-Z]+):([A-Z]+)$/i.exec(address);
    const toNumber = (letters) => [...letters.toUpperCase()].reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0) - 1;
    const first = toNumber(match[1]);
    const last = toNumber(match[2]);
    return new FakeRange(this, 0, first, Math.max(this.grid.length, 1), last - first + 1);
  }

  getUsedRangeOrNullObject() {
    const hasValues = this.grid.some((row) => row.some((value) => value !== ''));
    if (!hasValues) return new FakeRange(this, 0, 0, 0, 0, { isNullObject: true });
    const width = Math.max(...this.grid.map((row) => row.length), 1);
    return new FakeRange(this, 0, 0, this.grid.length, width);
  }
}

const makeFakeExcel = (sourceGrid = [['Term', 'Keep'], ['Yoruba', 1], ['Hausa', 2]]) => {
  const source = new FakeSheet('Sheet1', sourceGrid, 'sheet-1');
  const handlers = new Set();
  const sheetMap = new Map([['Sheet1', source]]);
  const nameMap = new Map();
  const worksheets = {
    getItem: (name) => sheetMap.get(name),
    getItemOrNullObject: (name) => sheetMap.get(name) || { isNullObject: true, load: noOpLoad },
    add: (name) => {
      const sheet = new FakeSheet(name);
      sheet.delete = () => sheetMap.delete(name);
      sheetMap.set(name, sheet);
      return sheet;
    },
    onSelectionChanged: {
      add: (handler) => handlers.add(handler),
      remove: (handler) => handlers.delete(handler),
    },
  };
  const names = {
    add: (name, range) => nameMap.set(name, {
      isNullObject: false,
      load: noOpLoad,
      delete: () => nameMap.delete(name),
      getRange: () => range,
    }),
    getItemOrNullObject: (name) => nameMap.get(name) || {
      isNullObject: true,
      load: noOpLoad,
      delete: () => {},
    },
  };
  const workbook = {
    worksheets,
    names,
    getSelectedRange: () => new FakeRange(source, 0, 0, source.grid.length, 1),
  };
  const context = { workbook, sync: vi.fn(async () => {}) };
  return {
    run: vi.fn(async (callback) => callback(context)),
    SheetVisibility: { veryHidden: 'VeryHidden' },
    InsertShiftDirection: { right: 'Right' },
    ClearApplyTo: { all: 'All' },
    source,
    sheetMap,
    nameMap,
    handlers,
    context,
  };
};

const selection = {
  address: 'Sheet1!A1:A3',
  worksheetId: 'sheet-1',
  worksheetName: 'Sheet1',
  rowIndex: 0,
  columnIndex: 0,
  rowCount: 3,
  columnCount: 1,
  header: 'Term',
  values: [['Term'], ['Yoruba'], ['Hausa']],
  rowData: [
    { rowId: 'r1', relativeRowIndex: 0, worksheetRowIndex: 1, value: 'Yoruba' },
    { rowId: 'r2', relativeRowIndex: 1, worksheetRowIndex: 2, value: 'Hausa' },
  ],
  table: null,
};

describe('workbookService pure helpers', () => {
  test('validates and trims a headed column while preserving interior blanks', () => {
    const result = validateSelectedColumnSnapshot({
      address: 'Sheet1!B2:B6',
      columnCount: 1,
      rowIndex: 1,
      columnIndex: 1,
      values: [['Name'], ['A'], [''], ['B'], ['']],
    });
    expect(result.header).toBe('Name');
    expect(result.values).toEqual([['Name'], ['A'], [''], ['B']]);
    expect(result.rowData[1]).toMatchObject({ isBlank: true, worksheetRowIndex: 3 });
  });

  test.each([
    [{ address: 'A1:A3,C1:C3', areaCount: 2, columnCount: 1, values: [['H'], ['a']] }, 'DISCONTIGUOUS_SELECTION'],
    [{ address: 'A1:B3', columnCount: 2, values: [['H'], ['a']] }, 'MULTIPLE_COLUMNS'],
    [{ address: 'A1:A3', columnCount: 1, isMerged: true, values: [['H'], ['a']] }, 'MERGED_CELLS'],
    [{ address: 'A1:A3', columnCount: 1, isProtected: true, values: [['H'], ['a']] }, 'PROTECTED_SHEET'],
    [{ address: 'A1:A3', columnCount: 1, values: [[''], ['a']] }, 'MISSING_HEADER'],
    [{ address: 'A1:A3', columnCount: 1, values: [['H'], [''], ['']] }, 'MISSING_DATA'],
  ])('rejects invalid selections with actionable error codes', (snapshot, code) => {
    expect(() => validateSelectedColumnSnapshot(snapshot)).toThrow(WorkbookValidationError);
    try { validateSelectedColumnSnapshot(snapshot); } catch (error) { expect(error.code).toBe(code); }
  });

  test('uses response order and removes source/internal fields', () => {
    expect(deriveOutputFields({
      selection: { header: 'Term' },
      response: { order: ['Term', 'CMName', 'CMuniqueRowID', 'CMID', 'CMName'] },
    })).toEqual(['CMName', 'CMID']);
  });

  test('creates stable unique headers without renaming unrelated source headers', () => {
    expect(createUniqueHeaders(['CMID', 'CMName', 'CMID'], ['Term', 'CMID']))
      .toEqual(['CMID (2)', 'CMName', 'CMID (3)']);
  });

  test('builds output values from first candidates and leaves no-match rows blank', () => {
    const plan = buildTranslationPlan({
      selection,
      order: ['Term', 'CMuniqueRowID', 'CMName', 'CMID', 'matching_Name', 'matchType_Name'],
      candidates: [
        { CMuniqueRowID: 'r1', CMName: 'Yoruba', CMID: 'CM1', matching_Name: 'yoruba', matchType_Name: 'one-to-many' },
        { CMuniqueRowID: 'r1', CMName: 'Yoruba alt', CMID: 'CM2', matching_Name: 'yoruba alt', matchType_Name: 'one-to-many' },
        { CMuniqueRowID: 'r2', matchType_Name: 'none' },
      ],
      selectedIndices: { r1: -1 },
    });
    expect(plan.outputFields).toEqual(['CMName', 'CMID', 'matching_Name', 'matchType_Name']);
    expect(plan.data).toEqual([
      ['multiple', 'multiple', 'multiple', 'one-to-many'],
      ['', '', '', 'none'],
    ]);
    expect(plan.rowFillColors).toEqual(['#F6AD94', '#FFFFCC']);
    expect(plan.selectedIndices.r1).toBe(-1);
    expect(plan.candidatesByRow.r1).toHaveLength(2);
  });

  test('normalizes non-scalar API values for Excel cells', () => {
    const plan = buildTranslationPlan({
      selection: { ...selection, rowData: [selection.rowData[0]] },
      order: ['Term', 'CMuniqueRowID', 'Countries', 'CountryText', 'SingleCountryText', 'Metadata', 'Distance'],
      candidates: [{
        CMuniqueRowID: 'r1',
        Countries: ['Ghana', 'Togo'],
        CountryText: "['Mexico', 'United States of America']",
        SingleCountryText: "['United States of America']",
        Metadata: { source: 'CatMapper' },
        Distance: Number.NaN,
      }],
    });
    expect(plan.data[0]).toEqual([
      'Ghana; Togo',
      'Mexico; United States of America',
      'United States of America',
      '{"source":"CatMapper"}',
      '',
    ]);
  });

  test('metadata serialization round-trips long-form candidates and selections', () => {
    const original = [{
      runId: 'run-1', rowIds: ['r1'], outputFields: ['CMName'],
      selectedIndices: { r1: 1 },
      candidatesByRow: { r1: [{ CMName: 'A' }, { CMName: 'B' }] },
    }];
    const restored = deserializeRuns(serializeRuns(original));
    expect(restored).toHaveLength(1);
    expect(restored[0].candidatesByRow.r1[1].CMName).toBe('B');
    expect(restored[0].selectedIndices.r1).toBe(1);
  });

  test('rejects damaged metadata without modifying worksheet values', () => {
    expect(() => deserializeRuns([
      ['recordType', 'runId', 'rowId', 'candidateIndex', 'selectedIndex', 'payloadJson'],
      ['RUN', 'run-1', '', '', '', '{not-json'],
    ])).toThrow(/metadata is damaged/i);
  });

  test('converts zero-based columns beyond Z', () => {
    expect(columnNumberToName(0)).toBe('A');
    expect(columnNumberToName(25)).toBe('Z');
    expect(columnNumberToName(26)).toBe('AA');
  });
});

describe('WorkbookService with mocked Office.js runtime', () => {
  test('captures a valid selected column through Excel.run', async () => {
    const excel = makeFakeExcel();
    const service = new WorkbookService({ excel });
    const result = await service.captureSelectedColumn();
    expect(result).toMatchObject({ header: 'Term', rowCount: 3, worksheetName: 'Sheet1' });
    expect(result.rowData.map((row) => row.value)).toEqual(['Yoruba', 'Hausa']);
    expect(result.availableColumns).toEqual([
      { header: 'Term', columnIndex: 0, values: ['Yoruba', 'Hausa'] },
      { header: 'Keep', columnIndex: 1, values: [1, 2] },
    ]);
  });

  test('inserts output columns, persists alternatives, and applies a candidate atomically', async () => {
    const excel = makeFakeExcel();
    const service = new WorkbookService({ excel });
    const persisted = await service.writeTranslationRun({
      runId: 'run-1',
      selection,
      order: ['Term', 'CMuniqueRowID', 'CMName', 'CMID'],
      candidates: [
        { CMuniqueRowID: 'r1', CMName: 'Yoruba', CMID: 'CM1', matchType_Term: 'one-to-many' },
        {
          CMuniqueRowID: 'r1',
          CMName: 'Yoruba alternate',
          CMID: 'CM2',
          CMcountry_Name: "['Ghana', 'Togo']",
          matchType_Term: 'fuzzy match',
        },
        { CMuniqueRowID: 'r2', CMName: 'Hausa', CMID: 'CM3', matchType_Term: 'fuzzy match' },
      ],
    });

    expect(excel.source.grid[0]).toEqual(['Term', 'CMName', 'CMID', 'Keep']);
    expect(excel.source.grid[1]).toEqual(['Yoruba', 'multiple', 'multiple', 1]);
    expect(excel.source.fills[1].slice(1, 3)).toEqual(['#F6AD94', '#F6AD94']);
    expect(excel.source.fills[2].slice(1, 3)).toEqual(['#F6C594', '#F6C594']);
    expect(persisted.candidatesByRow.r1).toHaveLength(2);
    expect(excel.sheetMap.get('_CatMapper_Addin').visibility).toBe('VeryHidden');
    expect(await service.loadPersistedRuns()).toHaveLength(1);

    await service.applyCandidateChoice('run-1', 'r1', 1);
    expect(excel.source.grid[1]).toEqual(['Yoruba', 'Yoruba alternate', 'CM2', 1]);
    expect(excel.source.fills[1].slice(1, 3)).toEqual(['#F6C594', '#F6C594']);
    const reloaded = await service.loadPersistedRuns();
    expect(reloaded[0].selectedIndices.r1).toBe(1);
  });

  test('clears generated translation columns, named ranges, and hidden metadata', async () => {
    const excel = makeFakeExcel();
    const service = new WorkbookService({ excel });
    await service.writeTranslationRun({
      runId: 'run-clear',
      selection,
      order: ['Term', 'CMuniqueRowID', 'CMName', 'CMID'],
      candidates: [
        { CMuniqueRowID: 'r1', CMName: 'Yoruba', CMID: 'CM1' },
        { CMuniqueRowID: 'r2', CMName: 'Hausa', CMID: 'CM2' },
      ],
    });

    const result = await service.clearTranslations();

    expect(result).toEqual({ removedRuns: 1, removedBlocks: 1 });
    expect(excel.source.grid[0]).toEqual(['Term', 'Keep']);
    expect(excel.source.grid[1]).toEqual(['Yoruba', 1]);
    expect(excel.source.grid[2]).toEqual(['Hausa', 2]);
    expect(excel.sheetMap.has('_CatMapper_Addin')).toBe(false);
    expect(excel.nameMap.size).toBe(0);
    expect(await service.loadPersistedRuns()).toEqual([]);
  });

  test('formats list-like country strings when a candidate choice is applied', async () => {
    const excel = makeFakeExcel();
    const service = new WorkbookService({ excel });
    await service.writeTranslationRun({
      runId: 'run-country',
      selection,
      order: ['Term', 'CMuniqueRowID', 'CMName', 'CMcountry_Name'],
      candidates: [
        { CMuniqueRowID: 'r1', CMName: 'Yoruba', CMcountry_Name: "['Nigeria']" },
        { CMuniqueRowID: 'r2', CMName: 'Hausa', CMcountry_Name: "['Niger', 'Nigeria']" },
      ],
    });

    expect(excel.source.grid[1]).toEqual(['Yoruba', 'Yoruba', 'Nigeria', 1]);
    expect(excel.source.grid[2]).toEqual(['Hausa', 'Hausa', 'Niger; Nigeria', 2]);
  });

  test('adds generated fields as Excel table columns and preserves adjacent data', async () => {
    const excel = makeFakeExcel();
    const addedColumns = [];
    excel.source.tables.getItemOrNullObject = () => ({
      isNullObject: false,
      load: noOpLoad,
      columns: {
        add: (index, _values, name) => {
          addedColumns.push({ index, name });
          excel.source.grid.forEach((row, rowIndex) => row.splice(index, 0, rowIndex === 0 ? name : ''));
          excel.source.fills.forEach((row) => row.splice(index, 0, ''));
        },
      },
    });
    const service = new WorkbookService({ excel });
    const persisted = await service.writeTranslationRun({
      runId: 'table-run',
      selection: {
        ...selection,
        table: { id: 'table-1', name: 'Terms', sourceColumnIndex: 0 },
      },
      order: ['Term', 'CMuniqueRowID', 'CMName', 'CMID'],
      candidates: [
        { CMuniqueRowID: 'r1', CMName: 'Yoruba', CMID: 'CM1' },
        { CMuniqueRowID: 'r2', CMName: 'Hausa', CMID: 'CM2' },
      ],
    });

    expect(addedColumns).toEqual([
      { index: 1, name: 'CMName' },
      { index: 2, name: 'CMID' },
    ]);
    expect(excel.source.grid[0]).toEqual(['Term', 'CMName', 'CMID', 'Keep']);
    expect(excel.source.grid[1]).toEqual(['Yoruba', 'Yoruba', 'CM1', 1]);
    expect(persisted.insertedAsTableColumns).toBe(true);
  });

  test('keeps table-created output headers on the table header row', async () => {
    const excel = makeFakeExcel([
      ['Term', 'Keep'],
      ['Yoruba', 1],
      ['Hausa', 2],
      ['Igbo', 3],
    ]);
    const addedColumns = [];
    excel.source.tables.getItemOrNullObject = () => ({
      isNullObject: false,
      load: noOpLoad,
      columns: {
        add: (index, _values, name) => {
          addedColumns.push({ index, name });
          excel.source.grid.forEach((row, rowIndex) => row.splice(index, 0, rowIndex === 0 ? name : ''));
          excel.source.fills.forEach((row) => row.splice(index, 0, ''));
        },
      },
    });
    const service = new WorkbookService({ excel });
    await service.writeTranslationRun({
      runId: 'table-body-selection',
      selection: {
        ...selection,
        rowIndex: 1,
        rowCount: 3,
        values: [['Term'], ['Yoruba'], ['Hausa']],
        rowData: [
          { rowId: 'r1', relativeRowIndex: 0, worksheetRowIndex: 1, value: 'Yoruba' },
          { rowId: 'r2', relativeRowIndex: 1, worksheetRowIndex: 2, value: 'Hausa' },
        ],
        table: { id: 'table-1', name: 'Terms', rowIndex: 0, sourceColumnIndex: 0 },
      },
      order: ['Term', 'CMuniqueRowID', 'CMName', 'CMID'],
      candidates: [
        { CMuniqueRowID: 'r1', CMName: 'Yoruba', CMID: 'CM1' },
        { CMuniqueRowID: 'r2', CMName: 'Hausa', CMID: 'CM2' },
      ],
    });

    expect(addedColumns).toEqual([
      { index: 1, name: 'CMName' },
      { index: 2, name: 'CMID' },
    ]);
    expect(excel.source.grid[0]).toEqual(['Term', 'CMName', 'CMID', 'Keep']);
    expect(excel.source.grid[1]).toEqual(['Yoruba', 'Yoruba', 'CM1', 1]);
    expect(excel.source.grid[2]).toEqual(['Hausa', 'Hausa', 'CM2', 2]);
  });

  test('refreshes a tracked output block in place and replaces persisted candidates', async () => {
    const excel = makeFakeExcel();
    const service = new WorkbookService({ excel });
    await service.writeTranslationRun({
      runId: 'run-1', selection,
      order: ['Term', 'CMuniqueRowID', 'CMName', 'CMID'],
      candidates: [
        { CMuniqueRowID: 'r1', CMName: 'Old Yoruba', CMID: 'OLD1' },
        { CMuniqueRowID: 'r2', CMName: 'Old Hausa', CMID: 'OLD2' },
      ],
    });
    const widthBefore = excel.source.grid[0].length;

    const refreshed = await service.writeTranslationRun({
      refreshRunId: 'run-1', selection,
      order: ['Term', 'CMuniqueRowID', 'CMName', 'CMID'],
      candidates: [
        { CMuniqueRowID: 'r1', CMName: 'New Yoruba', CMID: 'NEW1' },
        { CMuniqueRowID: 'r2', CMName: 'New Hausa', CMID: 'NEW2' },
      ],
      configuration: { domain: 'CULTURE' },
    });

    expect(excel.source.grid[0].length).toBe(widthBefore);
    expect(excel.source.grid[1].slice(1, 3)).toEqual(['New Yoruba', 'NEW1']);
    expect(refreshed.runId).toBe('run-1');
    expect(refreshed.configuration).toEqual({ domain: 'CULTURE' });
    expect((await service.loadPersistedRuns())[0].candidatesByRow.r1[0].CMID).toBe('NEW1');
  });

  test('recreates a translated block when its generated columns were manually deleted', async () => {
    const excel = makeFakeExcel();
    const service = new WorkbookService({ excel });
    await service.writeTranslationRun({
      runId: 'run-1', selection,
      order: ['Term', 'CMuniqueRowID', 'CMName', 'CMID'],
      candidates: [
        { CMuniqueRowID: 'r1', CMName: 'Old Yoruba', CMID: 'OLD1' },
        { CMuniqueRowID: 'r2', CMName: 'Old Hausa', CMID: 'OLD2' },
      ],
    });
    excel.source.getRange('B:C').delete();
    expect(excel.source.grid[0]).toEqual(['Term', 'Keep']);

    const refreshed = await service.writeTranslationRun({
      refreshRunId: 'run-1', selection,
      order: ['Term', 'CMuniqueRowID', 'CMName', 'CMID'],
      candidates: [
        { CMuniqueRowID: 'r1', CMName: 'New Yoruba', CMID: 'NEW1' },
        { CMuniqueRowID: 'r2', CMName: 'New Hausa', CMID: 'NEW2' },
      ],
    });

    expect(excel.source.grid[0]).toEqual(['Term', 'CMName', 'CMID', 'Keep']);
    expect(excel.source.grid[1]).toEqual(['Yoruba', 'New Yoruba', 'NEW1', 1]);
    expect(excel.source.grid[2]).toEqual(['Hausa', 'New Hausa', 'NEW2', 2]);
    expect(refreshed.runId).toBe('run-1');
    expect((await service.loadPersistedRuns())[0].worksheetHeaders).toEqual(['CMName', 'CMID']);
  });

  test('can create a separate block for an already translated source column when requested', async () => {
    const excel = makeFakeExcel();
    const service = new WorkbookService({ excel });
    await service.writeTranslationRun({
      runId: 'run-1', selection,
      order: ['Term', 'CMuniqueRowID', 'CMName'],
      candidates: [
        { CMuniqueRowID: 'r1', CMName: 'Old Yoruba' },
        { CMuniqueRowID: 'r2', CMName: 'Old Hausa' },
      ],
    });

    await expect(service.writeTranslationRun({
      runId: 'run-2', selection,
      order: ['Term', 'CMuniqueRowID', 'CMName'],
      candidates: [{ CMuniqueRowID: 'r1', CMName: 'Blocked Yoruba' }],
    })).rejects.toMatchObject({ code: 'EXISTING_TRANSLATION', existingRunId: 'run-1' });

    await service.writeTranslationRun({
      runId: 'run-2',
      allowDuplicateSource: true,
      selection,
      order: ['Term', 'CMuniqueRowID', 'CMName'],
      candidates: [
        { CMuniqueRowID: 'r1', CMName: 'New Yoruba' },
        { CMuniqueRowID: 'r2', CMName: 'New Hausa' },
      ],
    });

    expect(excel.source.grid[0]).toEqual(['Term', 'CMName (2)', 'CMName', 'Keep']);
    expect(excel.source.grid[1]).toEqual(['Yoruba', 'New Yoruba', 'Old Yoruba', 1]);
    expect(await service.loadPersistedRuns()).toHaveLength(2);
  });

  test('rejects refresh when the API output column count changed', async () => {
    const excel = makeFakeExcel();
    const service = new WorkbookService({ excel });
    await service.writeTranslationRun({
      runId: 'run-1', selection,
      order: ['Term', 'CMuniqueRowID', 'CMName'],
      candidates: [{ CMuniqueRowID: 'r1', CMName: 'Yoruba' }],
    });
    await expect(service.writeTranslationRun({
      refreshRunId: 'run-1', selection,
      order: ['Term', 'CMuniqueRowID', 'CMName', 'CMID'],
      candidates: [{ CMuniqueRowID: 'r1', CMName: 'Yoruba', CMID: 'CM1' }],
    })).rejects.toThrow(/Create a new translation block/);
  });

  test('registers and disposes workbook-wide selection handlers', async () => {
    const excel = makeFakeExcel();
    const service = new WorkbookService({ excel });
    const unsubscribe = await service.subscribeToSelection(vi.fn());
    expect(excel.handlers.size).toBe(1);
    await unsubscribe();
    expect(excel.handlers.size).toBe(0);
  });

  test('loads alternatives when any worksheet cell in a translated row is selected', async () => {
    const excel = makeFakeExcel();
    const service = new WorkbookService({ excel });
    await service.writeTranslationRun({
      runId: 'run-1',
      selection,
      order: ['Term', 'CMuniqueRowID', 'CMName', 'CMID'],
      candidates: [
        { CMuniqueRowID: 'r1', CMName: 'Yoruba', CMID: 'CM1' },
        { CMuniqueRowID: 'r1', CMName: 'Yoruba alternate', CMID: 'CM2' },
        { CMuniqueRowID: 'r2', CMName: 'Hausa', CMID: 'CM3' },
      ],
      configuration: { database: 'SocioMap' },
    });
    const callback = vi.fn();
    await service.subscribeToSelection(callback);
    const [handler] = excel.handlers;

    await handler({ worksheetId: 'sheet-1', address: 'Sheet1!D2' });
    await handler({ worksheetId: 'sheet-1', address: 'Sheet1!D1' });

    expect(callback.mock.calls[0][0]).toMatchObject({
      runId: 'run-1',
      rowId: 'r1',
      rowPosition: 0,
      selectedIndex: 0,
    });
    expect(callback.mock.calls[0][0].candidates).toHaveLength(2);
    expect(callback.mock.calls[1][0]).toBeNull();
  });

  test('preserves unresolved row selection state when a worksheet row is selected', async () => {
    const excel = makeFakeExcel();
    const service = new WorkbookService({ excel });
    await service.writeTranslationRun({
      runId: 'run-1',
      selection,
      order: ['Term', 'CMuniqueRowID', 'CMName', 'CMID'],
      candidates: [
        { CMuniqueRowID: 'r1', CMName: 'Yoruba', CMID: 'CM1' },
        { CMuniqueRowID: 'r1', CMName: 'Yoruba alternate', CMID: 'CM2' },
        { CMuniqueRowID: 'r2', CMName: 'Hausa', CMID: 'CM3' },
      ],
      selectedIndices: { r1: -1, r2: 0 },
    });
    const callback = vi.fn();
    await service.subscribeToSelection(callback);
    const [handler] = excel.handlers;

    await handler({ worksheetId: 'sheet-1', address: 'Sheet1!D2' });

    expect(callback.mock.calls[0][0]).toMatchObject({
      runId: 'run-1',
      rowId: 'r1',
      rowPosition: 0,
      selectedIndex: -1,
    });
  });

  test('loads alternatives when Excel coerces the first persisted row ID to numeric zero', async () => {
    const excel = makeFakeExcel();
    const service = new WorkbookService({ excel });
    await service.writeTranslationRun({
      runId: 'numeric-row-run',
      selection,
      order: ['Term', 'CMuniqueRowID', 'CMName', 'CMID'],
      candidates: [
        { CMuniqueRowID: 0, CMName: 'First match', CMID: 'CM1' },
        { CMuniqueRowID: 0, CMName: 'First alternate', CMID: 'CM2' },
        { CMuniqueRowID: 1, CMName: 'Second row', CMID: 'CM3' },
      ],
      rowIds: [0, 1],
      selectedIndices: { 0: -1, 1: 0 },
    });
    const metadata = excel.sheetMap.get('_CatMapper_Addin');
    const runPayload = JSON.parse(metadata.grid[1][5]);
    metadata.grid[1][5] = JSON.stringify({ ...runPayload, rowIds: [0, 1] });
    metadata.grid
      .filter((row) => row[0] === 'CANDIDATE' && row[2] === '0')
      .forEach((row) => { row[2] = 0; });
    const callback = vi.fn();
    await service.subscribeToSelection(callback);
    const [handler] = excel.handlers;

    await handler({ worksheetId: 'sheet-1', address: 'Sheet1!D2' });

    expect(callback.mock.calls[0][0]).toMatchObject({
      runId: 'numeric-row-run',
      rowId: '0',
      rowPosition: 0,
      selectedIndex: -1,
    });
    expect(callback.mock.calls[0][0].candidates).toHaveLength(2);

    await service.applyCandidateChoice('numeric-row-run', 0, 1);

    expect(excel.source.grid[1]).toEqual(['Yoruba', 'First alternate', 'CM2', 1]);
    expect((await service.loadPersistedRuns())[0].selectedIndices['0']).toBe(1);
  });

  test('uses the newest block when translation runs share a source cell', async () => {
    const excel = makeFakeExcel();
    const service = new WorkbookService({ excel });
    await service.writeTranslationRun({
      runId: 'old-run',
      selection,
      order: ['Term', 'CMuniqueRowID', 'CMName', 'CMID'],
      candidates: [
        { CMuniqueRowID: 'r1', CMName: 'Old match', CMID: 'CM1' },
        { CMuniqueRowID: 'r2', CMName: 'Old second row', CMID: 'CM2' },
      ],
      createdAt: '2026-08-04T10:00:00.000Z',
    });
    await service.writeTranslationRun({
      runId: 'new-run',
      allowDuplicateSource: true,
      selection,
      order: ['Term', 'CMuniqueRowID', 'CMName', 'CMID'],
      candidates: [
        { CMuniqueRowID: 'r1', CMName: 'New match one', CMID: 'CM3' },
        { CMuniqueRowID: 'r1', CMName: 'New match two', CMID: 'CM4' },
        { CMuniqueRowID: 'r2', CMName: 'New second row', CMID: 'CM5' },
      ],
      selectedIndices: { r1: -1, r2: 0 },
      createdAt: '2026-08-04T11:00:00.000Z',
    });
    const callback = vi.fn();
    await service.subscribeToSelection(callback);
    const [handler] = excel.handlers;

    await handler({ worksheetId: 'sheet-1', address: 'Sheet1!A2' });

    expect(callback.mock.calls[0][0]).toMatchObject({
      runId: 'new-run',
      rowId: 'r1',
      selectedIndex: -1,
    });
    expect(callback.mock.calls[0][0].candidates).toHaveLength(2);
  });
});
