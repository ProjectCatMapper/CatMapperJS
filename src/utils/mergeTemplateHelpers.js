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

  // Build a stack-aware "wide" sheet that avoids dataset-ID pivot columns.
  // Datasets in the same stack are concatenated into one row per canonical category.
  const wideByStackAndCategory = new Map();
  longRows.forEach((row) => {
    const rowKey = `${row.stackID}||${row.CMID}||${row.CMName}`;
    const existing = wideByStackAndCategory.get(rowKey) || {
      stackID: row.stackID,
      CMID: row.CMID,
      CMName: row.CMName,
      Key: '',
      datasetIDs: new Set(),
      datasetNames: new Set(),
    };

    if (row.datasetID) existing.datasetIDs.add(row.datasetID);
    if (row.datasetName) existing.datasetNames.add(row.datasetName);

    if (!existing.Key && row.Key) {
      existing.Key = row.Key;
    }

    const parsedKeys = parseKeyExpression(row.Key);
    Object.entries(parsedKeys).forEach(([keyName, keyValue]) => {
      if (!keyValue) return;

      const currentValue = existing[keyName];
      if (!currentValue) {
        existing[keyName] = keyValue;
        return;
      }

      // Keep all distinct values when same-stack datasets carry divergent values.
      if (currentValue !== keyValue) {
        const values = String(currentValue)
          .split(' | ')
          .map((value) => value.trim())
          .filter(Boolean);
        if (!values.includes(keyValue)) {
          existing[keyName] = `${currentValue} | ${keyValue}`;
        }
      }
    });

    wideByStackAndCategory.set(rowKey, existing);
  });

  const wideRows = Array.from(wideByStackAndCategory.values()).map((row) => {
    const { datasetIDs, datasetNames, ...rest } = row;
    return {
      ...rest,
      datasetIDs: Array.from(datasetIDs || []).sort().join(', '),
      datasetNames: Array.from(datasetNames || []).sort().join('; '),
    };
  });

  return [
    {
      sheetName: 'LinkFileWide',
      rows: wideRows,
    },
    {
      sheetName: 'LinkFileLong',
      rows: longRows,
    },
  ];
}
