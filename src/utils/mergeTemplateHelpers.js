export function summarizeMergeTemplate(summary) {
  const nodeType = String(summary?.nodeType || '').toUpperCase();
  const variableCount = Number(summary?.stackSummaryTotals?.variableCount || 0);
  const equivalenceTieCount = Array.isArray(summary?.equivalenceTies)
    ? summary.equivalenceTies.length
    : 0;

  return {
    nodeType,
    isMergingTemplate: nodeType === 'MERGING',
    hasVariableMappings: variableCount > 0,
    canDownloadLinkFile: nodeType === 'MERGING' && equivalenceTieCount > 0,
    variableCount,
    equivalenceTieCount,
  };
}

export function parseKeyExpression(key) {
  const text = String(key || '').trim();
  if (!text) return {};

  const parts = text
    .split(' && ')
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.reduce((acc, part, index) => {
    const marker = ' == ';
    const markerIndex = part.indexOf(marker);

    if (markerIndex === -1) {
      acc[`KeyPart${index + 1}`] = part;
      return acc;
    }

    const rawName = part.slice(0, markerIndex).trim() || `KeyPart${index + 1}`;
    const rawValue = part.slice(markerIndex + marker.length).trim();
    let name = rawName;
    let suffix = 2;

    while (Object.prototype.hasOwnProperty.call(acc, name)) {
      name = `${rawName}_${suffix}`;
      suffix += 1;
    }

    acc[name] = rawValue;
    return acc;
  }, {});
}

export function buildLinkFileSheets(templateRows = [], equivalenceTies = []) {
  const datasetLookup = new Map(
    (templateRows || [])
      .filter((row) => row?.datasetID)
      .map((row) => [String(row.datasetID), row])
  );

  const longRows = (equivalenceTies || []).map((row) => {
    const datasetID = String(row?.datasetID || '');
    const datasetMeta = datasetLookup.get(datasetID) || {};
    const canonicalCMID = row?.equivalentCMID || row?.originalCMID || '';
    const canonicalCMName = row?.equivalentCMName || row?.originalCMName || '';

    return {
      stackID: row?.stackID || '',
      datasetID,
      datasetName: datasetMeta?.datasetName || '',
      CMID: canonicalCMID,
      CMName: canonicalCMName,
      originalCMID: row?.originalCMID || '',
      originalCMName: row?.originalCMName || '',
      Key: row?.Key || '',
      ...parseKeyExpression(row?.Key || ''),
    };
  });

  const wideByCategory = new Map();
  longRows.forEach((row) => {
    const rowKey = `${row.CMID}||${row.CMName}`;
    const existing = wideByCategory.get(rowKey) || {
      CMID: row.CMID,
      CMName: row.CMName,
    };

    existing[`${row.datasetID} Key`] = row.Key;

    const parsedKeys = parseKeyExpression(row.Key);
    Object.entries(parsedKeys).forEach(([keyName, keyValue]) => {
      existing[`${row.datasetID} ${keyName}`] = keyValue;
    });

    wideByCategory.set(rowKey, existing);
  });

  return [
    {
      sheetName: 'LinkFileWide',
      rows: Array.from(wideByCategory.values()),
    },
    {
      sheetName: 'LinkFileLong',
      rows: longRows,
    },
  ];
}
