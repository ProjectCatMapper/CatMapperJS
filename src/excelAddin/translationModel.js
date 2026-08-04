export const MAX_PAYLOAD_BYTES = 25 * 1024 * 1024;
export const TRANSLATION_BATCH_SIZE = 500;
export const METADATA_VERSION = 1;

const MAPPING_KEYS = ['country', 'context', 'dataset'];

export class TranslationModelError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'TranslationModelError';
    this.code = code;
    this.details = details;
  }
}

const isBlank = (value) =>
  value === null || value === undefined || (typeof value === 'string' && value.trim() === '');

const cleanHeader = (value) => String(value ?? '').trim();

const requireText = (value, field) => {
  const text = cleanHeader(value);
  if (!text) {
    throw new TranslationModelError(
      `missing_${field}`,
      `${field[0].toUpperCase()}${field.slice(1)} is required.`
    );
  }
  return text;
};

const truthyBoolean = (value) =>
  value === true || (typeof value === 'string' && value.trim().toLowerCase() === 'true');

/**
 * Validates and normalizes the one-column Excel selection consumed by the
 * translation model. The first cell is the required header. Trailing empty
 * cells are discarded, while empty cells between populated rows remain in
 * place so API row IDs continue to line up with worksheet rows.
 */
export const normalizeSelectionMatrix = (matrix) => {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new TranslationModelError(
      'empty_selection',
      'Select one column containing a header and at least one data value.'
    );
  }

  if (matrix.some((row) => !Array.isArray(row) || row.length !== 1)) {
    throw new TranslationModelError(
      'invalid_column_count',
      'Select one contiguous column only.'
    );
  }

  const header = cleanHeader(matrix[0][0]);
  if (!header) {
    throw new TranslationModelError(
      'missing_header',
      'The first selected cell must contain a column header.'
    );
  }

  const values = matrix.slice(1).map((row) => row[0]);
  while (values.length && isBlank(values[values.length - 1])) {
    values.pop();
  }

  if (!values.length) {
    throw new TranslationModelError(
      'missing_data',
      'The selected column must contain at least one data value below its header.'
    );
  }

  return {
    header,
    values,
    rowCount: values.length,
    matrix: [[header], ...values.map((value) => [value])],
  };
};

const normalizeMapping = (mapping, key, rowCount) => {
  if (mapping === null || mapping === undefined || mapping === '') return null;
  if (typeof mapping !== 'object' || Array.isArray(mapping)) {
    throw new TranslationModelError(
      `invalid_${key}_mapping`,
      `${key} mapping must provide a header and one value per selected data row.`
    );
  }

  const header = requireText(mapping.header, `${key} mapping header`);
  if (!Array.isArray(mapping.values) || mapping.values.length !== rowCount) {
    throw new TranslationModelError(
      `invalid_${key}_mapping_length`,
      `${key} mapping must contain exactly ${rowCount} data values.`,
      { expected: rowCount, actual: mapping.values?.length }
    );
  }
  return { header, values: mapping.values };
};

export const buildTranslationTable = (normalizedSelection, mappings = {}) => {
  if (!normalizedSelection?.header || !Array.isArray(normalizedSelection.values)) {
    throw new TranslationModelError(
      'invalid_selection',
      'A normalized one-column selection is required.'
    );
  }

  const normalizedMappings = Object.fromEntries(
    MAPPING_KEYS.map((key) => [
      key,
      normalizeMapping(mappings[key], key, normalizedSelection.values.length),
    ])
  );

  const table = normalizedSelection.values.map((value, rowIndex) => {
    const row = { [normalizedSelection.header]: value ?? '' };
    MAPPING_KEYS.forEach((key) => {
      const mapping = normalizedMappings[key];
      if (mapping) row[mapping.header] = mapping.values[rowIndex] ?? '';
    });
    return row;
  });

  return { table, mappings: normalizedMappings };
};

const normalizeYearBounds = (yearStart, yearEnd) => {
  const hasStart = !isBlank(yearStart);
  const hasEnd = !isBlank(yearEnd);
  if (hasStart !== hasEnd) {
    throw new TranslationModelError(
      'incomplete_year_range',
      'Specify both the start year and end year, or leave both blank.'
    );
  }
  if (!hasStart) return { yearStart: null, yearEnd: null };

  const start = Number(yearStart);
  const end = Number(yearEnd);
  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    throw new TranslationModelError(
      'invalid_year_range',
      'Start year and end year must be whole numbers.'
    );
  }
  if (start > end) {
    throw new TranslationModelError(
      'reversed_year_range',
      'Start year must be less than or equal to end year.'
    );
  }
  return { yearStart: start, yearEnd: end };
};

export const payloadByteLength = (payload) => {
  let serialized;
  try {
    serialized = JSON.stringify(payload);
  } catch (error) {
    throw new TranslationModelError(
      'invalid_payload',
      'The translation request could not be serialized.',
      { cause: error }
    );
  }
  if (serialized === undefined) {
    throw new TranslationModelError('invalid_payload', 'The translation request is empty.');
  }
  return new TextEncoder().encode(serialized).byteLength;
};

export const assertPayloadSize = (payload, maximumBytes = MAX_PAYLOAD_BYTES) => {
  const byteLength = payloadByteLength(payload);
  if (byteLength > maximumBytes) {
    throw new TranslationModelError(
      'payload_too_large',
      'The translation request is larger than 25 MiB. Select fewer rows and try again.',
      { byteLength, maximumBytes }
    );
  }
  return byteLength;
};

/**
 * Builds the existing CatMapper /translate/start request without changing its
 * backend contract. `mappings` may contain country/context/dataset descriptors
 * shaped as { header, values }.
 */
export const buildTranslationPayload = ({
  selectionMatrix,
  normalizedSelection,
  database,
  property,
  domain,
  key = false,
  mappings = {},
  country,
  context,
  dataset,
  yearStart,
  yearEnd,
} = {}) => {
  const selection = normalizedSelection || normalizeSelectionMatrix(selectionMatrix);
  const suppliedMappings = {
    ...mappings,
    ...(country !== undefined ? { country } : {}),
    ...(context !== undefined ? { context } : {}),
    ...(dataset !== undefined ? { dataset } : {}),
  };
  const { table, mappings: normalizedMappings } = buildTranslationTable(selection, suppliedMappings);
  const years = normalizeYearBounds(yearStart, yearEnd);

  const payload = {
    database: requireText(database, 'database'),
    property: requireText(property, 'property'),
    domain: requireText(domain, 'domain'),
    key: String(truthyBoolean(key)),
    term: selection.header,
    country: normalizedMappings.country?.header ?? null,
    context: normalizedMappings.context?.header ?? null,
    dataset: normalizedMappings.dataset?.header ?? null,
    yearStart: years.yearStart,
    yearEnd: years.yearEnd,
    table,
    query: 'false',
    countsamename: false,
    uniqueRows: false,
    batchSize: TRANSLATION_BATCH_SIZE,
  };

  assertPayloadSize(payload);
  return payload;
};

export const deriveOutputFields = (responseOrder = [], inputFields = []) => {
  const excluded = new Set([...inputFields, 'CMuniqueRowID']);
  const seen = new Set();
  return (Array.isArray(responseOrder) ? responseOrder : []).filter((field) => {
    if (typeof field !== 'string' || !field || excluded.has(field) || seen.has(field)) {
      return false;
    }
    seen.add(field);
    return true;
  });
};

const findField = (row, exactName, prefixes = []) => {
  if (!row || typeof row !== 'object') return undefined;
  if (Object.prototype.hasOwnProperty.call(row, exactName)) return row[exactName];
  const keys = Object.keys(row);
  const found = keys.find((key) => prefixes.some((prefix) => key.startsWith(prefix)));
  return found === undefined ? undefined : row[found];
};

const comparableText = (value) => String(value ?? '').trim();

const numericDistance = (candidate) => {
  const value = findField(candidate, 'matchingDistance', ['matchingDistance_']);
  if (isBlank(value)) return Number.POSITIVE_INFINITY;
  const number = Number(value);
  return Number.isFinite(number) ? number : Number.POSITIVE_INFINITY;
};

const candidateName = (candidate) =>
  comparableText(findField(candidate, 'CMName', ['CMName_']));

const candidateCmid = (candidate) =>
  comparableText(findField(candidate, 'CMID', ['CMID_']));

export const sortCandidates = (candidates = []) =>
  (Array.isArray(candidates) ? candidates : [])
    .map((candidate, originalIndex) => ({ candidate, originalIndex }))
    .sort((left, right) => {
      const distanceDifference = numericDistance(left.candidate) - numericDistance(right.candidate);
      if (distanceDifference) return distanceDifference;

      const nameDifference = candidateName(left.candidate).localeCompare(
        candidateName(right.candidate),
        undefined,
        { sensitivity: 'base' }
      );
      if (nameDifference) return nameDifference;

      const cmidDifference = candidateCmid(left.candidate).localeCompare(
        candidateCmid(right.candidate)
      );
      return cmidDifference || left.originalIndex - right.originalIndex;
    })
    .map(({ candidate }) => candidate);

export const isMatchedCandidate = (candidate) =>
  Boolean(candidateCmid(candidate) || candidateName(candidate));

/**
 * Groups API rows by the row IDs assigned by the backend. If sourceRowCount is
 * supplied, the returned array contains one entry for every original row,
 * including blanks and rows with no match.
 */
export const groupCandidatesByRow = (responseRows = [], sourceRowCount) => {
  const grouped = new Map();
  (Array.isArray(responseRows) ? responseRows : []).forEach((row) => {
    const id = row?.CMuniqueRowID;
    if (id === null || id === undefined || id === '') return;
    const key = String(id);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  });

  const toGroup = (rowId, rows) => {
    const candidates = sortCandidates(rows.filter(isMatchedCandidate));
    return {
      rowId: String(rowId),
      sourceRowIndex: /^\d+$/.test(String(rowId)) ? Number(rowId) : null,
      candidates,
      selectedIndex: candidates.length ? 0 : -1,
      noMatch: candidates.length === 0,
      noMatchRow: candidates.length === 0 ? rows[0] ?? null : null,
    };
  };

  if (Number.isInteger(sourceRowCount) && sourceRowCount >= 0) {
    return Array.from({ length: sourceRowCount }, (_, rowIndex) => {
      const key = String(rowIndex);
      return toGroup(key, grouped.get(key) || []);
    });
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => {
      const leftNumber = Number(left);
      const rightNumber = Number(right);
      if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) return leftNumber - rightNumber;
      return left.localeCompare(right, undefined, { numeric: true });
    })
    .map(([rowId, rows]) => toGroup(rowId, rows));
};

const excelValue = (value) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join('; ');
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
};

export const candidateOutputValues = (candidate, outputFields = []) =>
  outputFields.map((field) => excelValue(candidate?.[field]));

export const selectedOutputMatrix = (groups = [], outputFields = []) =>
  groups.map((group) => {
    const selected = group.selectedIndex >= 0
      ? group.candidates[group.selectedIndex]
      : group.noMatchRow;
    return candidateOutputValues(selected, outputFields);
  });

export const describeCandidate = (candidate) => ({
  name: excelValue(findField(candidate, 'CMName', ['CMName_'])),
  cmid: excelValue(findField(candidate, 'CMID', ['CMID_'])),
  domain: excelValue(findField(candidate, 'label', ['label_', 'domain_'])),
  matchedTerm: excelValue(findField(candidate, 'matching', ['matching_'])),
  distance: excelValue(findField(candidate, 'matchingDistance', ['matchingDistance_'])),
  country: excelValue(findField(candidate, 'CMcountry', ['CMcountry_', 'country_'])),
  key: excelValue(findField(candidate, 'Key', ['Key_'])),
});

export const buildHeaderMapping = (apiFields = [], existingHeaders = []) => {
  const used = new Set(existingHeaders.map((header) => cleanHeader(header).toLocaleLowerCase()));
  return apiFields.map((apiField) => {
    const base = cleanHeader(apiField) || 'CatMapper Result';
    let worksheetHeader = base;
    let suffix = 1;
    while (used.has(worksheetHeader.toLocaleLowerCase())) {
      worksheetHeader = suffix === 1
        ? `${base} (CatMapper)`
        : `${base} (CatMapper ${suffix})`;
      suffix += 1;
    }
    used.add(worksheetHeader.toLocaleLowerCase());
    return { apiField, worksheetHeader };
  });
};

export const serializeRunMetadata = (run) => JSON.stringify({
  ...run,
  version: METADATA_VERSION,
});

export const deserializeRunMetadata = (serialized) => {
  let parsed;
  try {
    parsed = JSON.parse(serialized);
  } catch (error) {
    throw new TranslationModelError('damaged_metadata', 'CatMapper add-in metadata is not valid JSON.', {
      cause: error,
    });
  }
  if (!parsed || typeof parsed !== 'object' || parsed.version !== METADATA_VERSION) {
    throw new TranslationModelError(
      'unsupported_metadata',
      'CatMapper add-in metadata is missing or uses an unsupported version.'
    );
  }
  return parsed;
};

export const candidatesToLongFormRows = (runId, groups = []) =>
  groups.flatMap((group) => group.candidates.map((candidate, candidateIndex) => ({
    RunId: runId,
    SourceRowId: group.rowId,
    CandidateIndex: candidateIndex,
    Selected: candidateIndex === group.selectedIndex,
    CandidateJson: JSON.stringify(candidate),
  })));

export const candidatesFromLongFormRows = (rows = [], runId) => {
  const grouped = new Map();
  rows
    .filter((row) => runId === undefined || String(row.RunId) === String(runId))
    .forEach((row) => {
      const rowId = String(row.SourceRowId);
      if (!grouped.has(rowId)) grouped.set(rowId, []);
      let candidate;
      try {
        candidate = JSON.parse(row.CandidateJson);
      } catch (error) {
        throw new TranslationModelError(
          'damaged_candidate_metadata',
          `Candidate metadata for source row ${rowId} is damaged.`,
          { cause: error }
        );
      }
      grouped.get(rowId).push({
        candidate,
        candidateIndex: Number(row.CandidateIndex),
        selected: row.Selected === true || String(row.Selected).toLowerCase() === 'true',
      });
    });

  return Array.from(grouped.entries()).map(([rowId, entries]) => {
    entries.sort((left, right) => left.candidateIndex - right.candidateIndex);
    const selectedIndex = entries.findIndex((entry) => entry.selected);
    return {
      rowId,
      sourceRowIndex: /^\d+$/.test(rowId) ? Number(rowId) : null,
      candidates: entries.map((entry) => entry.candidate),
      selectedIndex: selectedIndex >= 0 ? selectedIndex : (entries.length ? 0 : -1),
      noMatch: entries.length === 0,
      noMatchRow: null,
    };
  });
};
