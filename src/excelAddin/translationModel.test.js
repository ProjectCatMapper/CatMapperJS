// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  MAX_PAYLOAD_BYTES,
  TRANSLATION_BATCH_SIZE,
  TranslationModelError,
  assertPayloadSize,
  buildHeaderMapping,
  buildTranslationPayload,
  candidateOutputValues,
  candidatesFromLongFormRows,
  candidatesToLongFormRows,
  deriveOutputFields,
  describeCandidate,
  deserializeRunMetadata,
  groupCandidatesByRow,
  normalizeSelectionMatrix,
  payloadByteLength,
  selectedOutputMatrix,
  serializeRunMetadata,
  sortCandidates,
} from './translationModel';

describe('Excel add-in translation model', () => {
  describe('selection normalization', () => {
    it('requires exactly one headed column with data', () => {
      expect(() => normalizeSelectionMatrix([])).toThrow(TranslationModelError);
      expect(() => normalizeSelectionMatrix([['Name', 'Country'], ['A', 'US']]))
        .toThrow('one contiguous column');
      expect(() => normalizeSelectionMatrix([['  '], ['A']])).toThrow('header');
      expect(() => normalizeSelectionMatrix([['Name'], [' '], [null]])).toThrow('data value');
    });

    it('trims trailing blanks while retaining interior blanks, duplicates, and value types', () => {
      const selection = normalizeSelectionMatrix([
        ['  Name  '],
        ['Yoruba'],
        [''],
        ['Yoruba'],
        [42],
        [null],
        ['   '],
      ]);

      expect(selection.header).toBe('Name');
      expect(selection.values).toEqual(['Yoruba', '', 'Yoruba', 42]);
      expect(selection.rowCount).toBe(4);
      expect(selection.matrix).toEqual([
        ['Name'], ['Yoruba'], [''], ['Yoruba'], [42],
      ]);
    });
  });

  describe('request construction and size guard', () => {
    it('builds the existing translation request with mapped columns and fixed options', () => {
      const payload = buildTranslationPayload({
        selectionMatrix: [['Term'], ['A'], [''], ['B']],
        database: 'ArchaMap',
        property: 'Name',
        domain: 'SITE',
        key: true,
        country: { header: 'Country ID', values: ['AM1', '', 'AM2'] },
        context: { header: 'Parent ID', values: ['AM5', 'AM5', 'AM6'] },
        dataset: { header: 'Dataset ID', values: ['AD1', 'AD1', 'AD2'] },
        yearStart: '-500',
        yearEnd: 300,
      });

      expect(payload).toEqual({
        database: 'ArchaMap',
        property: 'Name',
        domain: 'SITE',
        key: 'true',
        term: 'Term',
        country: 'Country ID',
        context: 'Parent ID',
        dataset: 'Dataset ID',
        yearStart: -500,
        yearEnd: 300,
        table: [
          { Term: 'A', 'Country ID': 'AM1', 'Parent ID': 'AM5', 'Dataset ID': 'AD1' },
          { Term: '', 'Country ID': '', 'Parent ID': 'AM5', 'Dataset ID': 'AD1' },
          { Term: 'B', 'Country ID': 'AM2', 'Parent ID': 'AM6', 'Dataset ID': 'AD2' },
        ],
        query: 'false',
        countsamename: false,
        uniqueRows: false,
        batchSize: TRANSLATION_BATCH_SIZE,
      });
    });

    it('uses null for omitted optional filters and rejects incomplete or invalid ranges', () => {
      const basic = {
        selectionMatrix: [['Name'], ['A']],
        database: 'SocioMap',
        property: 'Name',
        domain: 'CATEGORY',
      };
      expect(buildTranslationPayload(basic)).toMatchObject({
        country: null,
        context: null,
        dataset: null,
        yearStart: null,
        yearEnd: null,
        key: 'false',
      });
      expect(() => buildTranslationPayload({ ...basic, yearStart: 1900 }))
        .toThrow('both the start year and end year');
      expect(() => buildTranslationPayload({ ...basic, yearStart: 2000, yearEnd: 1900 }))
        .toThrow('less than or equal');
      expect(() => buildTranslationPayload({
        ...basic,
        country: { header: 'Country', values: [] },
      })).toThrow('exactly 1 data values');
    });

    it('measures UTF-8 bytes and rejects payloads over the configured size', () => {
      expect(MAX_PAYLOAD_BYTES).toBe(25 * 1024 * 1024);
      expect(payloadByteLength({ value: 'é' })).toBeGreaterThan(JSON.stringify({ value: 'é' }).length);
      expect(assertPayloadSize({ value: 'small' }, 100)).toBeLessThan(100);
      try {
        assertPayloadSize({ value: 'x'.repeat(100) }, 50);
        throw new Error('Expected the payload size check to fail.');
      } catch (error) {
        expect(error).toMatchObject({ code: 'payload_too_large' });
      }
    });

    it('handles a 10,000-row request without changing row order', () => {
      const matrix = [['Name'], ...Array.from({ length: 10_000 }, (_, index) => [`Term ${index}`])];
      const payload = buildTranslationPayload({
        selectionMatrix: matrix,
        database: 'ArchaMap',
        property: 'Name',
        domain: 'CATEGORY',
      });
      expect(payload.table).toHaveLength(10_000);
      expect(payload.table[0]).toEqual({ Name: 'Term 0' });
      expect(payload.table.at(-1)).toEqual({ Name: 'Term 9999' });
      expect(payloadByteLength(payload)).toBeLessThan(MAX_PAYLOAD_BYTES);
    });
  });

  describe('response shaping', () => {
    const outputFields = [
      'CMID_Name',
      'CMName_Name',
      'matching_Name',
      'matchingDistance_Name',
      'label_Name',
      'CMcountry_Name',
      'Key_Name',
      'matchType_Name',
    ];

    const candidate = (overrides = {}) => ({
      Name: 'source',
      CMuniqueRowID: '0',
      CMID_Name: 'AM10',
      CMName_Name: 'Zulu',
      matching_Name: 'zulu',
      matchingDistance_Name: '1',
      label_Name: 'ETHNICITY',
      CMcountry_Name: ['South Africa', 'Zimbabwe'],
      Key_Name: '42',
      matchType_Name: 'one-to-many',
      ...overrides,
    });

    it('uses response order and excludes echoed input and internal fields', () => {
      const order = [
        'Name', 'Country', 'CMID_Name', 'CMName_Name', 'CMuniqueRowID', 'CMID_Name', 'extra',
      ];
      expect(deriveOutputFields(order, ['Name', 'Country']))
        .toEqual(['CMID_Name', 'CMName_Name', 'extra']);
      expect(deriveOutputFields(null, ['Name'])).toEqual([]);
    });

    it('sorts by numeric distance, case-insensitive name, CMID, then original order', () => {
      const rows = [
        candidate({ CMID_Name: 'AM20', CMName_Name: 'Zulu', matchingDistance_Name: '2' }),
        candidate({ CMID_Name: 'AM10', CMName_Name: 'alpha', matchingDistance_Name: '1' }),
        candidate({ CMID_Name: 'AM2', CMName_Name: 'Alpha', matchingDistance_Name: '1' }),
        candidate({ CMID_Name: 'AM1', CMName_Name: 'Beta', matchingDistance_Name: '1' }),
      ];
      expect(sortCandidates(rows).map((row) => row.CMID_Name))
        .toEqual(['AM10', 'AM2', 'AM1', 'AM20']);
    });

    it('aligns candidates, no-match rows, and interior blank source rows', () => {
      const rows = [
        candidate({ CMuniqueRowID: 0, CMID_Name: 'AM20', matchingDistance_Name: 2 }),
        candidate({ CMuniqueRowID: 0, CMID_Name: 'AM10', CMName_Name: 'Alpha', matchingDistance_Name: 1 }),
        candidate({
          CMuniqueRowID: 2,
          CMID_Name: '',
          CMName_Name: '',
          matching_Name: '',
          matchingDistance_Name: '',
          matchType_Name: 'none',
        }),
      ];
      const groups = groupCandidatesByRow(rows, 4);

      expect(groups).toHaveLength(4);
      expect(groups[0].candidates.map((row) => row.CMID_Name)).toEqual(['AM10', 'AM20']);
      expect(groups[0].selectedIndex).toBe(0);
      expect(groups[1]).toMatchObject({ rowId: '1', candidates: [], noMatch: true });
      expect(groups[2].noMatchRow?.matchType_Name).toBe('none');
      expect(groups[3]).toMatchObject({ rowId: '3', candidates: [], noMatch: true });

      const matrix = selectedOutputMatrix(groups, ['CMID_Name', 'CMName_Name', 'matchType_Name']);
      expect(matrix).toEqual([
        ['AM10', 'Alpha', 'one-to-many'],
        ['', '', ''],
        ['', '', 'none'],
        ['', '', ''],
      ]);
    });

    it('formats candidate cards and Excel output values', () => {
      const row = candidate();
      expect(describeCandidate(row)).toEqual({
        name: 'Zulu',
        cmid: 'AM10',
        domain: 'ETHNICITY',
        matchedTerm: 'zulu',
        distance: '1',
        country: 'South Africa; Zimbabwe',
        key: '42',
      });
      expect(candidateOutputValues(row, outputFields.slice(0, 3)))
        .toEqual(['AM10', 'Zulu', 'zulu']);
    });
  });

  describe('headers and persisted metadata', () => {
    it('creates case-insensitive collision-safe worksheet headers', () => {
      expect(buildHeaderMapping(
        ['CMID_Name', 'CMName_Name', 'CMID_NAME'],
        ['Name', 'cmid_name', 'CMID_Name (CatMapper)']
      )).toEqual([
        { apiField: 'CMID_Name', worksheetHeader: 'CMID_Name (CatMapper 2)' },
        { apiField: 'CMName_Name', worksheetHeader: 'CMName_Name' },
        { apiField: 'CMID_NAME', worksheetHeader: 'CMID_NAME (CatMapper 3)' },
      ]);
    });

    it('round-trips versioned run metadata and rejects damage', () => {
      const run = { runId: 'run-1', sourceRangeName: 'CM_Source_run_1', selected: [0, 1] };
      expect(deserializeRunMetadata(serializeRunMetadata(run))).toMatchObject(run);
      for (const [serialized, code] of [
        ['{bad json', 'damaged_metadata'],
        [JSON.stringify({ version: 99 }), 'unsupported_metadata'],
      ]) {
        try {
          deserializeRunMetadata(serialized);
          throw new Error('Expected metadata parsing to fail.');
        } catch (error) {
          expect(error).toMatchObject({ code });
        }
      }
    });

    it('round-trips long-form candidate rows and selected choices', () => {
      const groups = [{
        rowId: '7',
        candidates: [{ CMID_Name: 'AM1' }, { CMID_Name: 'AM2' }],
        selectedIndex: 1,
      }];
      const rows = candidatesToLongFormRows('run-1', groups);
      rows.push({
        RunId: 'other-run', SourceRowId: '1', CandidateIndex: 0, Selected: true,
        CandidateJson: JSON.stringify({ CMID_Name: 'OTHER' }),
      });

      expect(candidatesFromLongFormRows(rows, 'run-1')).toEqual([{
        rowId: '7',
        sourceRowIndex: 7,
        candidates: [{ CMID_Name: 'AM1' }, { CMID_Name: 'AM2' }],
        selectedIndex: 1,
        noMatch: false,
        noMatchRow: null,
      }]);
    });
  });
});
