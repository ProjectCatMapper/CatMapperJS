const PRIMARY_ORDER = ["cmname", "cmid", "domains"];
const STATS_ORDER = ["directchildren", "alldescendants", "directparents"];
const COMPACT_ORDER = [
  "location",
  "language",
  "religion",
  "timespan",
  "yearpublished",
  "datasetlocation",
  "foci",
  "parent",
];
const CITATION_KEYS = new Set(["citation", "datasetcitation"]);
const LONG_TEXT_KEYS = new Set(["citation", "datasetcitation", "note", "description"]);
const STATS_SET = new Set(STATS_ORDER);
const DETAIL_AUTO_THRESHOLD = 140;

const dedupeStringList = (values) => {
  const seen = new Set();
  const unique = [];

  values.forEach((value) => {
    const normalized = String(value ?? "").trim();
    if (!normalized) return;

    const dedupeKey = normalized.toLowerCase();
    if (seen.has(dedupeKey)) return;

    seen.add(dedupeKey);
    unique.push(normalized);
  });

  return unique;
};

const normalizeEntryValue = (normalizedKey, value) => {
  if (normalizedKey !== "location") return value;

  if (Array.isArray(value)) {
    return dedupeStringList(value);
  }

  if (typeof value === "string" && value.includes(",")) {
    const deduped = dedupeStringList(value.split(","));
    return deduped.length > 0 ? deduped.join(", ") : value;
  }

  return value;
};

export const CATEGORY_INFO_PREVIEW_LIMITS = {
  compact: 90,
  detail: 240,
};

const buildOrderMap = (values) => new Map(values.map((value, index) => [value, index]));

const normalizeKey = (key) =>
  String(key || "")
    .toLowerCase()
    .replace(/[\s_]/g, "");

const hasDisplayValue = (normalized, value) => {
  if (value === null || value === undefined) return false;

  if (Array.isArray(value)) {
    return value.some((item) => String(item ?? "").trim() !== "");
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (STATS_SET.has(normalized)) return trimmed !== "";
    return trimmed !== "" && trimmed.toLowerCase() !== "null";
  }

  if (typeof value === "number") {
    return STATS_SET.has(normalized) ? true : value !== 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length > 0;
  }

  return Boolean(value);
};

export function getCategoryInfoPlainValue(rawValue) {
  if (rawValue === null || rawValue === undefined) return "";
  if (Array.isArray(rawValue)) {
    return rawValue
      .map((value) => String(value ?? "").trim())
      .filter(Boolean)
      .join(", ");
  }
  if (typeof rawValue === "object") {
    try {
      return JSON.stringify(rawValue);
    } catch (_error) {
      return String(rawValue);
    }
  }
  return String(rawValue);
}

export function getCategoryInfoPreview(rawValue, limit) {
  const plainValue = getCategoryInfoPlainValue(rawValue);
  if (plainValue.length <= limit) {
    return { text: plainValue, truncated: false };
  }
  return { text: `${plainValue.slice(0, limit).trimEnd()} . . .`, truncated: true };
}

const toDisplayKey = (key, normalized) => {
  if (normalized === "cmname") return "CatMapper Name";
  if (normalized === "cmid") return "CatMapper ID";
  if (normalized === "domains") return "Domain";
  return String(key).replace(/_/g, " ");
};

const sortEntriesByPreferredOrder = (entries, preferredOrder) => {
  const orderMap = buildOrderMap(preferredOrder);
  return [...entries].sort((left, right) => {
    const leftRank = orderMap.has(left.normalized) ? orderMap.get(left.normalized) : Number.MAX_SAFE_INTEGER;
    const rightRank = orderMap.has(right.normalized) ? orderMap.get(right.normalized) : Number.MAX_SAFE_INTEGER;
    if (leftRank !== rightRank) return leftRank - rightRank;
    return left.sortIndex - right.sortIndex;
  });
};

const isDetailEntry = (entry) => {
  if (entry.normalized === "datasetlocation") return false;
  if (LONG_TEXT_KEYS.has(entry.normalized)) return true;
  return entry.plainValue.length > DETAIL_AUTO_THRESHOLD;
};

const toSectionEntry = (entry, section) => ({
  key: entry.key,
  value: entry.value,
  plainValue: entry.plainValue,
  displayKey: toDisplayKey(entry.key, entry.normalized),
  normalized: entry.normalized,
  section,
});

export function buildCategoryInfoSections(rev) {
  if (!rev || typeof rev !== "object") {
    return { primary: [], compact: [], detail: [], stats: [] };
  }

  const filteredEntries = Object.entries(rev)
    .map(([key, value], sortIndex) => {
      const normalized = normalizeKey(key);
      const normalizedValue = normalizeEntryValue(normalized, value);
      return {
        key,
        value: normalizedValue,
        plainValue: getCategoryInfoPlainValue(normalizedValue),
        normalized,
        sortIndex,
      };
    })
    .filter((entry) => hasDisplayValue(entry.normalized, entry.value));

  const used = new Set();

  const primary = PRIMARY_ORDER.map((normalizedKey) => {
    const match = filteredEntries.find(
      (entry) => entry.normalized === normalizedKey && !used.has(entry.sortIndex)
    );
    if (!match) return null;
    used.add(match.sortIndex);
    return toSectionEntry(match, "primary");
  }).filter(Boolean);

  const remaining = filteredEntries.filter((entry) => !used.has(entry.sortIndex));

  const compact = [];
  const detail = [];
  const stats = [];

  remaining.forEach((entry) => {
    if (STATS_SET.has(entry.normalized)) {
      stats.push(toSectionEntry(entry, "stats"));
      return;
    }

    if (isDetailEntry(entry)) {
      detail.push(toSectionEntry(entry, "detail"));
      return;
    }

    compact.push(toSectionEntry(entry, "compact"));
  });

  const sortedDetail = [
    ...detail.filter((entry) => !CITATION_KEYS.has(entry.normalized)),
    ...detail.filter((entry) => CITATION_KEYS.has(entry.normalized)),
  ];

  return {
    primary,
    compact: sortEntriesByPreferredOrder(compact, COMPACT_ORDER),
    detail: sortedDetail,
    stats: sortEntriesByPreferredOrder(stats, STATS_ORDER),
  };
}
