const PROPERTY_KEYWORDS = {
  name: "Name",
  key: "Key",
  cmid: "CMID",
  "catmapper id": "CMID"
};

const DOMAIN_ALIASES = {
  area: "DISTRICT",
  district: "DISTRICT",
  all: "ALL NODES",
  "all nodes": "ALL NODES",
  any: "ANY DOMAIN",
  "any domain": "ANY DOMAIN"
};

const NOISE_WORDS_REGEX =
  /\b(find|lookup|look up|search|show|list|get|me|please|categories|category|records|entries|node|nodes|for)\b/gi;

const normalizeWhitespace = (value = "") => value.replace(/\s+/g, " ").trim();

const cleanQueryText = (value = "") =>
  normalizeWhitespace(value.replace(/[?.,;]+$/g, ""));

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeProperty = (value = "Name") => {
  const normalized = value.toLowerCase();
  if (normalized.includes("cmid")) return "CMID";
  if (normalized.includes("key")) return "Key";
  return "Name";
};

export const toUiProperty = (property = "Name") =>
  property === "CMID" ? "CatMapper ID (CMID)" : property;

const getExplicitProperty = (value = "") => {
  const propertyMatch = value.match(
    /\b(?:property|by)\s*(?:is|=|:)?\s*(name|key|cmid|catmapper\s*id)\b/i
  );

  if (!propertyMatch) return "";
  const key = propertyMatch[1].toLowerCase().replace(/\s+/g, " ").trim();
  return PROPERTY_KEYWORDS[key] || "";
};

const findDomainInQuery = (query = "", availableSubdomains = []) => {
  const lowered = query.toLowerCase();

  const explicitMatch = query.match(
    /\b(?:domain|subdomain)\s*(?:is|=|:)?\s*([A-Za-z0-9 _-]{2,40})\b/i
  );
  if (explicitMatch) {
    const candidate = normalizeDomainCandidate(explicitMatch[1], availableSubdomains);
    if (candidate) return candidate;
  }

  const sorted = [...new Set(availableSubdomains)]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  for (const subdomain of sorted) {
    const aliasKey = subdomain.toLowerCase();
    const re = new RegExp(`\\b${escapeRegex(aliasKey)}\\b`, "i");
    if (re.test(lowered)) return subdomain;
  }

  return "";
};

const normalizeDomainCandidate = (candidate = "", availableSubdomains = []) => {
  const cleaned = normalizeWhitespace(candidate).toLowerCase();
  if (!cleaned) return "";

  const alias = DOMAIN_ALIASES[cleaned] || cleaned.toUpperCase();
  const fromAlias = availableSubdomains.find(
    (value) => value.toLowerCase() === alias.toLowerCase()
  );
  if (fromAlias) return fromAlias;

  const direct = availableSubdomains.find(
    (value) => value.toLowerCase() === cleaned.toLowerCase()
  );
  if (direct) return direct;

  return "";
};

const extractCountryPhrase = (query = "") => {
  const explicitCountry = query.match(
    /\bcountry\s*(?:is|=|:)?\s*([A-Za-z][A-Za-z .'-]{1,50})\b/i
  );
  if (explicitCountry) return normalizeWhitespace(explicitCountry[1]);

  const trailingIn = query.match(/\b(?:in|within|inside)\s+([A-Za-z][A-Za-z .'-]{1,50})$/i);
  if (trailingIn) return normalizeWhitespace(trailingIn[1]);

  return "";
};

const extractTerm = (query = "") => {
  const quoted = query.match(/"([^"]+)"/);
  if (quoted) return normalizeWhitespace(quoted[1]);

  const named = query.match(/\b(?:named|called|term)\s*(?:is|=|:)?\s*([A-Za-z0-9 ._'-]{2,80})/i);
  if (named) return cleanQueryText(named[1]);

  return "";
};

const removeMatchedClause = (source = "", regex) =>
  normalizeWhitespace(source.replace(regex, " "));

export function parseNaturalLanguageSearch({
  query = "",
  fallbackDomain = "ALL NODES",
  fallbackProperty = "Name",
  availableSubdomains = []
} = {}) {
  const normalizedQuery = cleanQueryText(query);
  const parsed = {
    term: "",
    domain: fallbackDomain,
    property: normalizeProperty(fallbackProperty),
    contextID: "",
    datasetID: "",
    yearStart: "",
    yearEnd: "",
    countryName: ""
  };

  if (!normalizedQuery) return parsed;

  let working = normalizedQuery;

  const contextMatch = working.match(/\bcontext(?:\s*id)?\s*(?:=|:)?\s*([A-Za-z0-9._:-]+)/i);
  if (contextMatch) {
    parsed.contextID = contextMatch[1];
    working = removeMatchedClause(working, contextMatch[0]);
  }

  const datasetMatch = working.match(/\bdataset(?:\s*id)?\s*(?:=|:)?\s*([A-Za-z0-9._:-]+)/i);
  if (datasetMatch) {
    parsed.datasetID = datasetMatch[1];
    working = removeMatchedClause(working, datasetMatch[0]);
  }

  const betweenYears = working.match(/\b(?:between|from)\s*(-?\d{1,4})\s*(?:and|to)\s*(-?\d{1,4})\b/i);
  if (betweenYears) {
    parsed.yearStart = betweenYears[1];
    parsed.yearEnd = betweenYears[2];
    working = removeMatchedClause(working, betweenYears[0]);
  }

  const sinceYear = working.match(/\b(?:since|after)\s*(-?\d{1,4})\b/i);
  if (sinceYear && !parsed.yearStart) {
    parsed.yearStart = sinceYear[1];
    working = removeMatchedClause(working, sinceYear[0]);
  }

  const untilYear = working.match(/\b(?:until|before)\s*(-?\d{1,4})\b/i);
  if (untilYear && !parsed.yearEnd) {
    parsed.yearEnd = untilYear[1];
    working = removeMatchedClause(working, untilYear[0]);
  }

  const explicitProperty = getExplicitProperty(working);
  if (explicitProperty) {
    parsed.property = explicitProperty;
    working = removeMatchedClause(
      working,
      /\b(?:property|by)\s*(?:is|=|:)?\s*(name|key|cmid|catmapper\s*id)\b/i
    );
  }

  const cmidMatch = working.match(/\bcmid\s*(?:=|:)?\s*([A-Za-z0-9._:-]+)/i);
  if (cmidMatch) {
    parsed.property = "CMID";
    parsed.term = cmidMatch[1];
    working = removeMatchedClause(working, cmidMatch[0]);
  }

  const keyMatch = working.match(/\bkey\s*(?:=|:)?\s*([A-Za-z0-9._:-]+)/i);
  if (keyMatch && !parsed.term) {
    parsed.property = "Key";
    parsed.term = keyMatch[1];
    working = removeMatchedClause(working, keyMatch[0]);
  }

  const domain = findDomainInQuery(working, availableSubdomains);
  if (domain) {
    parsed.domain = domain;
    working = removeMatchedClause(
      working,
      new RegExp(`\\b${escapeRegex(domain)}\\b`, "ig")
    );
    working = removeMatchedClause(working, /\b(?:domain|subdomain)\s*(?:is|=|:)?\s*[A-Za-z0-9 _-]{2,40}\b/i);
  }

  const countryName = extractCountryPhrase(working);
  if (countryName) {
    parsed.countryName = countryName;
    working = removeMatchedClause(
      working,
      /\b(?:country\s*(?:is|=|:)?\s*[A-Za-z][A-Za-z .'-]{1,50}|(?:in|within|inside)\s+[A-Za-z][A-Za-z .'-]{1,50})\b/i
    );
  }

  if (!parsed.term) {
    const explicitTerm = extractTerm(working);
    if (explicitTerm) {
      parsed.term = explicitTerm;
    } else {
      parsed.term = cleanQueryText(working.replace(NOISE_WORDS_REGEX, " "));
    }
  }

  parsed.term = normalizeWhitespace(parsed.term.replace(/^["']|["']$/g, ""));
  return parsed;
}

const rankCountryCandidate = (candidate = {}, countryName = "") => {
  const matchName = normalizeWhitespace(candidate.CMName || "").toLowerCase();
  const target = normalizeWhitespace(countryName).toLowerCase();
  if (!matchName) return 99;
  if (matchName === target) return 0;
  if (matchName.startsWith(target)) return 1;
  if (matchName.includes(target)) return 2;
  return 3;
};

export async function resolveCountryContext({
  apiUrl,
  database,
  countryName
} = {}) {
  if (!apiUrl || !database || !countryName) return null;

  const params = new URLSearchParams({
    database,
    term: countryName,
    domain: "DISTRICT",
    property: "Name"
  });

  try {
    const response = await fetch(`${apiUrl}/search?${params.toString()}&query=false`, {
      method: "GET"
    });
    if (!response.ok) return null;

    const payload = await response.json();
    const candidates = Array.isArray(payload?.data) ? payload.data : [];
    if (!candidates.length) return null;

    const bestMatch = [...candidates].sort(
      (left, right) =>
        rankCountryCandidate(left, countryName) - rankCountryCandidate(right, countryName)
    )[0];

    return bestMatch?.CMID || null;
  } catch (error) {
    console.error("Country resolver failed:", error);
    return null;
  }
}
