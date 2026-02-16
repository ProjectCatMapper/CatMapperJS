import {
  MATCH_PREFIXES,
  getMatchColumns,
  addReviewIds,
  removeMatchFromRow,
  setBookmarkOrManualCmid,
  applyToSelectedRows,
  getOneToManyGroups,
  resolveOneToManyGroup,
  stripReviewFields,
  getMatchTypePercentages,
} from './translateReview';

describe('translateReview utils', () => {
  const term = 'Name';
  const columns = [
    'Name',
    'CMuniqueRowID',
    ...MATCH_PREFIXES.map((p) => `${p}${term}`),
    'Country',
  ];

  const row = {
    __reviewId: 'r-1',
    Name: 'Yoruba',
    CMuniqueRowID: 'u1',
    matching_Name: 'Yoruba',
    matchingDistance_Name: 0,
    matchType_Name: 'exact match',
    CMName_Name: 'Yoruba',
    CMID_Name: 'SM1',
    label_Name: 'ETHNICITY',
    CMcountry_Name: 'Nigeria',
    Country: 'Nigeria',
  };

  test('getMatchColumns returns generated columns for term', () => {
    const found = getMatchColumns(columns, term);
    expect(found).toHaveLength(7);
    expect(found).toContain('CMID_Name');
  });

  test('addReviewIds creates stable review ids when absent', () => {
    const out = addReviewIds([{ a: 1 }, { a: 2 }]);
    expect(out[0].__reviewId).toBe('r-1');
    expect(out[1].__reviewId).toBe('r-2');
  });

  test('addReviewIds preserves existing review ids', () => {
    const out = addReviewIds([{ __reviewId: 'keep-me', a: 1 }]);
    expect(out[0].__reviewId).toBe('keep-me');
  });

  test('removeMatchFromRow clears all generated columns and keeps source data', () => {
    const out = removeMatchFromRow(row, columns, term);
    expect(out.Name).toBe('Yoruba');
    expect(out.Country).toBe('Nigeria');
    expect(out.CMID_Name).toBe('');
    expect(out.matchType_Name).toBe('');
    expect(out.label_Name).toBe('');
  });

  test('setBookmarkOrManualCmid clears generated match fields and sets CMID only', () => {
    const out = setBookmarkOrManualCmid(row, columns, term, 'SM999');
    expect(out.CMID_Name).toBe('SM999');
    expect(out.CMName_Name).toBe('');
    expect(out.matchType_Name).toBe('');
    expect(out.matching_Name).toBe('');
    expect(out.Name).toBe('Yoruba');
  });

  test('setBookmarkOrManualCmid supports explicit empty CMID', () => {
    const out = setBookmarkOrManualCmid(row, columns, term, '');
    expect(out.CMID_Name).toBe('');
    expect(out.CMName_Name).toBe('');
    expect(out.matchType_Name).toBe('');
    expect(out.Name).toBe('Yoruba');
  });

  test('applyToSelectedRows updates only selected rows', () => {
    const rows = [row, { ...row, __reviewId: 'r-2', Name: 'Hausa' }];
    const out = applyToSelectedRows(rows, ['r-2'], (r) => setBookmarkOrManualCmid(r, columns, term, 'SM888'));
    expect(out[0].CMID_Name).toBe('SM1');
    expect(out[1].CMID_Name).toBe('SM888');
  });

  test('getOneToManyGroups returns only duplicated CMuniqueRowID groups', () => {
    const rows = [
      { ...row, __reviewId: 'r-1', CMuniqueRowID: 'u1' },
      { ...row, __reviewId: 'r-2', CMuniqueRowID: 'u1', CMID_Name: 'SM2' },
      { ...row, __reviewId: 'r-3', CMuniqueRowID: 'u2' },
    ];
    const groups = getOneToManyGroups(rows);
    expect(groups).toHaveLength(1);
    expect(groups[0].groupId).toBe('u1');
    expect(groups[0].rows).toHaveLength(2);
  });

  test('getOneToManyGroups ignores rows without unique id', () => {
    const rows = [
      { ...row, __reviewId: 'r-1', CMuniqueRowID: '' },
      { ...row, __reviewId: 'r-2', CMuniqueRowID: null },
      { ...row, __reviewId: 'r-3', CMuniqueRowID: undefined },
    ];
    const groups = getOneToManyGroups(rows);
    expect(groups).toHaveLength(0);
  });

  test('resolveOneToManyGroup keeps chosen row and clears others in group', () => {
    const rows = [
      { ...row, __reviewId: 'r-1', CMuniqueRowID: 'u1', CMID_Name: 'SM1' },
      { ...row, __reviewId: 'r-2', CMuniqueRowID: 'u1', CMID_Name: 'SM2' },
      { ...row, __reviewId: 'r-3', CMuniqueRowID: 'u2', CMID_Name: 'SM3' },
    ];
    const out = resolveOneToManyGroup({ rows, columns, termColumn: term, groupId: 'u1', keepRowId: 'r-2' });
    expect(out.find((r) => r.__reviewId === 'r-1').CMID_Name).toBe('');
    expect(out.find((r) => r.__reviewId === 'r-2').CMID_Name).toBe('SM2');
    expect(out.find((r) => r.__reviewId === 'r-3').CMID_Name).toBe('SM3');
  });

  test('resolveOneToManyGroup with no selection keeps one row, clears it, and removes duplicates', () => {
    const rows = [
      { ...row, __reviewId: 'r-1', CMuniqueRowID: 'u1', CMID_Name: 'SM1' },
      { ...row, __reviewId: 'r-2', CMuniqueRowID: 'u1', CMID_Name: 'SM2' },
    ];
    const out = resolveOneToManyGroup({ rows, columns, termColumn: term, groupId: 'u1', keepRowId: null });
    expect(out).toHaveLength(1);
    expect(out[0].__reviewId).toBe('r-1');
    expect(out[0].CMID_Name).toBe('');
    expect(out[0].matchType_Name).toBe('');
  });

  test('stripReviewFields removes internal review id', () => {
    const out = stripReviewFields([row]);
    expect(out[0].__reviewId).toBeUndefined();
    expect(out[0].CMID_Name).toBe('SM1');
  });

  test('getMatchTypePercentages computes percentages and defaults empty to none', () => {
    const rows = [
      { matchType_Name: 'exact match' },
      { matchType_Name: 'fuzzy match' },
      { matchType_Name: '' },
      { matchType_Name: null },
    ];
    const out = getMatchTypePercentages(rows, term);
    expect(out['exact match']).toBe('25.00%');
    expect(out['fuzzy match']).toBe('25.00%');
    expect(out['none']).toBe('50.00%');
  });

  test('getMatchTypePercentages returns empty object for empty row set', () => {
    const out = getMatchTypePercentages([], term);
    expect(out).toEqual({});
  });
});
