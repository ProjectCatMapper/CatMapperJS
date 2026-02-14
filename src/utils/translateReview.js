export const MATCH_PREFIXES = [
  'matching_',
  'matchingDistance_',
  'matchType_',
  'CMName_',
  'CMID_',
  'label_',
  'CMcountry_',
];

export const getMatchColumns = (columns = [], termColumn = '') => {
  if (!termColumn) return [];
  const expected = MATCH_PREFIXES.map((prefix) => `${prefix}${termColumn}`);
  return expected.filter((col) => columns.includes(col));
};

export const addReviewIds = (rows = []) =>
  rows.map((row, idx) => ({
    ...row,
    __reviewId: row.__reviewId || `r-${idx + 1}`,
  }));

const clearGeneratedValues = (row, matchColumns) => {
  const next = { ...row };
  matchColumns.forEach((col) => {
    next[col] = '';
  });
  return next;
};

export const removeMatchFromRow = (row, columns = [], termColumn = '') => {
  const matchColumns = getMatchColumns(columns, termColumn);
  return clearGeneratedValues(row, matchColumns);
};

export const setBookmarkOrManualCmid = (row, columns = [], termColumn = '', cmid = '') => {
  const matchColumns = getMatchColumns(columns, termColumn);
  const cmidColumn = `CMID_${termColumn}`;
  const next = clearGeneratedValues(row, matchColumns);
  if (columns.includes(cmidColumn)) {
    next[cmidColumn] = cmid || '';
  }
  return next;
};

export const applyToSelectedRows = (rows = [], selectedIds = [], updater) => {
  const selectedSet = new Set(selectedIds);
  return rows.map((row) => {
    if (!selectedSet.has(row.__reviewId)) return row;
    return updater(row);
  });
};

export const getOneToManyGroups = (rows = []) => {
  const grouped = new Map();
  rows.forEach((row) => {
    const key = row.CMuniqueRowID;
    if (key === undefined || key === null || key === '') return;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  });

  return Array.from(grouped.entries())
    .filter(([, groupRows]) => groupRows.length > 1)
    .map(([groupId, groupRows]) => ({ groupId, rows: groupRows }));
};

export const resolveOneToManyGroup = ({
  rows = [],
  columns = [],
  termColumn = '',
  groupId,
  keepRowId = null,
}) => {
  const matchColumns = getMatchColumns(columns, termColumn);
  const next = rows.map((row) => {
    if (row.CMuniqueRowID !== groupId) return row;
    if (keepRowId && row.__reviewId === keepRowId) return row;
    return clearGeneratedValues(row, matchColumns);
  });
  return next;
};

export const stripReviewFields = (rows = []) =>
  rows.map(({ __reviewId, ...rest }) => rest);

export const getMatchTypePercentages = (rows = [], termColumn = '') => {
  const key = `matchType_${termColumn}`;
  const total = rows.length || 0;
  if (!total) return {};
  const counts = rows.reduce((acc, row) => {
    const value = String(row[key] || '').trim() || 'none';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(counts).reduce((acc, type) => {
    acc[type] = `${((counts[type] / total) * 100).toFixed(2)}%`;
    return acc;
  }, {});
};
