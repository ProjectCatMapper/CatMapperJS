const PROPERTY_KEYWORDS = {
  name: "Name",
  key: "Key",
  cmid: "CMID",
  "catmapper id": "CMID"
};

const DOMAIN_ALIASES = {
  area: "DISTRICT",
  district: "DISTRICT",
  "all nodes": "ALL NODES",
  all: "ALL NODES",
  "any domain": "ANY DOMAIN",
  any: "ANY DOMAIN"
};

const DOMAIN_SYNONYMS = {
  PROJECTILE_POINT_TYPE: [
    "projectile point",
    "projectile points",
    "arrowhead",
    "arrowheads"
  ]
};

const PLACE_CUES_REGEX =
  /\b(country|state|province|district|city|region|valley|island|county|territory|municipality|prefecture)\b/i;

const DATASET_CUES_REGEX =
  /\b(dataset|project|source|collection|corpus)\b/i;

const GENERIC_TERM_REGEX =
  /^(all|everything|results|records|entries|items|categories|types)$/i;

const NOISE_WORDS_REGEX =
  /\b(find|lookup|look up|search|show|list|get|return|me|please|categories|category|records|entries|node|nodes|for|all)\b/gi;

const SAFE_ID_REGEX = /^[A-Za-z0-9._:-]{1,80}$/;
const SAFE_COUNTRY_CODE_REGEX = /^[A-Za-z0-9_-]{1,10}$/;
const SAFE_YEAR_REGEX = /^-?\d{1,4}$/;
const ALLOWED_CONTEXT_DOMAINS = new Set(["DISTRICT", "CATEGORY", "DATASET"]);
const ALLOWED_PROPERTIES = new Set(["Name", "Key", "CMID"]);
const LEADING_ARTICLE_REGEX = /^(the|a|an)\s+/i;
const LEADING_ARTICLE_EXCEPTIONS = new Set([
  "the gambia",
  "the bahamas",
  "the netherlands",
  "the philippines",
  "the sudan",
  "the hague"
]);

const normalizeWhitespace = (value = "") => value.replace(/\s+/g, " ").trim();

const cleanQueryText = (value = "") => normalizeWhitespace(value.replace(/[?.,;]+$/g, ""));

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizePhrase = (value = "") =>
  normalizeWhitespace(
    value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
  );

const buildPhraseRegex = (phrase = "") => {
  const escaped = escapeRegex(phrase).replace(/\s+/g, "\\s+");
  if (phrase.endsWith("s")) {
    return new RegExp(`\\b${escaped}\\b`, "i");
  }
  return new RegExp(`\\b${escaped}s?\\b`, "i");
};

const normalizeProperty = (value = "Name") => {
  const normalized = String(value).toLowerCase();
  if (normalized.includes("cmid")) return "CMID";
  if (normalized.includes("key")) return "Key";
  return "Name";
};

const sanitizePlainText = (value = "", maxLength = 120) =>
  cleanQueryText(String(value).replace(/[\u0000-\u001F]/g, " ")).slice(0, maxLength);

const stripLeadingFiller = (value = "") => {
  let cleaned = normalizeWhitespace(value);
  let previous = "";

  while (cleaned && cleaned !== previous) {
    previous = cleaned;
    cleaned = cleaned
      .replace(/^(?:i|we)\s+(?:want|need|would\s+like)\s+to\s+/i, "")
      .replace(/^(?:please\s+)?(?:find|lookup|look up|search(?:\s+for)?|show|get|return)\s+/i, "")
      .replace(/^(?:all\s+)?(?:records?|entries|items|results|categories)\s+(?:for|of|from)\s+/i, "")
      .replace(/^(?:for|from|of|about)\s+/i, "");
  }

  return cleaned;
};

const stripLeadingArticle = (value = "") => {
  const cleaned = normalizeWhitespace(value);
  if (!cleaned) return "";
  const normalized = normalizePhrase(cleaned);
  if (LEADING_ARTICLE_EXCEPTIONS.has(normalized)) return cleaned;
  return cleaned.replace(LEADING_ARTICLE_REGEX, "");
};

const normalizeExtractedTerm = (value = "") =>
  stripLeadingArticle(stripLeadingFiller(normalizeWhitespace(value)));

const sanitizeIdentifier = (value = "") => {
  const cleaned = normalizeWhitespace(String(value));
  return SAFE_ID_REGEX.test(cleaned) ? cleaned : "";
};

const sanitizeYear = (value = "") => {
  const cleaned = normalizeWhitespace(String(value));
  return SAFE_YEAR_REGEX.test(cleaned) ? cleaned : "";
};

const toBoolean = (value = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
};

const getExplicitProperty = (value = "") => {
  const propertyMatch = value.match(
    /\b(?:property|by)\s*(?:is|=|:)?\s*(name|key|cmid|catmapper\s*id)\b/i
  );
  if (!propertyMatch) return "";
  const key = propertyMatch[1].toLowerCase().replace(/\s+/g, " ").trim();
  return PROPERTY_KEYWORDS[key] || "";
};

const removeMatchedClause = (source = "", pattern = "") => {
  if (!pattern) return source;
  return normalizeWhitespace(source.replace(pattern, " "));
};

const normalizeDomainCandidate = (candidate = "", availableSubdomains = []) => {
  const cleaned = normalizePhrase(candidate);
  if (!cleaned) return "";

  const available = [...new Set(availableSubdomains)].filter(Boolean);
  const direct = available.find((domain) => normalizePhrase(domain) === cleaned);
  if (direct) return direct;

  const aliasTarget = DOMAIN_ALIASES[cleaned];
  if (aliasTarget) {
    const availableAlias = available.find(
      (domain) => normalizePhrase(domain) === normalizePhrase(aliasTarget)
    );
    return availableAlias || aliasTarget;
  }

  return "";
};

const buildDomainPhrases = (availableSubdomains = []) => {
  const phrases = [];
  const available = [...new Set(availableSubdomains)].filter(Boolean);

  available.forEach((domain) => {
    const normalized = normalizePhrase(domain);
    if (normalized) {
      phrases.push({ phrase: normalized, domain });
    }
  });

  Object.entries(DOMAIN_ALIASES).forEach(([alias, target]) => {
    const availableDomain = available.find(
      (domain) => normalizePhrase(domain) === normalizePhrase(target)
    );
    phrases.push({ phrase: normalizePhrase(alias), domain: availableDomain || target });
  });

  Object.entries(DOMAIN_SYNONYMS).forEach(([target, aliases]) => {
    const availableDomain = available.find(
      (domain) => normalizePhrase(domain) === normalizePhrase(target)
    );
    if (!availableDomain && available.length > 0) return;
    aliases.forEach((alias) => {
      phrases.push({ phrase: normalizePhrase(alias), domain: availableDomain || target });
    });
  });

  return phrases
    .filter((item) => item.phrase && item.domain)
    .sort((a, b) => b.phrase.length - a.phrase.length);
};

const findDomainInQuery = (query = "", availableSubdomains = []) => {
  const explicitMatch = query.match(
    /\b(?:domain|subdomain)\s*(?:is|=|:)?\s*([A-Za-z0-9 _-]{2,50})\b/i
  );
  if (explicitMatch) {
    const domain = normalizeDomainCandidate(explicitMatch[1], availableSubdomains);
    if (domain) return { domain, matchedText: explicitMatch[0] };
  }

  const normalizedQuery = normalizePhrase(query);
  const domainPhrases = buildDomainPhrases(availableSubdomains);

  for (const candidate of domainPhrases) {
    const phraseRegex = buildPhraseRegex(candidate.phrase);
    if (phraseRegex.test(normalizedQuery)) {
      return { domain: candidate.domain, matchedText: candidate.phrase };
    }
  }

  return { domain: "", matchedText: "" };
};

const extractTerm = (query = "") => {
  const quoted = query.match(/"([^"]+)"/);
  if (quoted) return normalizeWhitespace(quoted[1]);

  const named = query.match(/\b(?:named|called|term)\s*(?:is|=|:)?\s*([A-Za-z0-9 ._'-]{2,120})/i);
  if (named) return cleanQueryText(named[1]);

  return "";
};

const cleanContextTerm = (value = "") =>
  normalizeWhitespace(value.replace(/^(the|a|an)\s+/i, ""));

const extractContextClause = (query = "") => {
  const datasetContext =
    query.match(
      /\b(?:from|within|in)\s+(?:the\s+)?([A-Za-z0-9][A-Za-z0-9 ._:'/-]{1,100}?)\s+dataset\b/i
    ) ||
    query.match(/\b(?:from|within|in)?\s*dataset\s+([A-Za-z0-9][A-Za-z0-9 ._:'-]{1,100})$/i) ||
    query.match(/\bdataset\s*(?:is|=|:)?\s*([A-Za-z0-9][A-Za-z0-9 ._:'-]{1,100})$/i);
  if (datasetContext) {
    return {
      contextTerm: cleanContextTerm(datasetContext[1]),
      hint: "dataset",
      matchedText: datasetContext[0]
    };
  }

  const relationContext = query.match(
    /\b(?:associated with|related to|linked to|tied to)\s+([A-Za-z0-9][A-Za-z0-9 ._:'-]{1,100})$/i
  );
  if (relationContext) {
    return {
      contextTerm: cleanContextTerm(relationContext[1]),
      hint: "non_place",
      matchedText: relationContext[0]
    };
  }

  const placeContext = query.match(
    /\b(?:in|within|inside|near|around)\s+([A-Za-z0-9][A-Za-z0-9 ._:'-]{1,100})$/i
  );
  if (placeContext) {
    return {
      contextTerm: cleanContextTerm(placeContext[1]),
      hint: "place",
      matchedText: placeContext[0]
    };
  }

  return {
    contextTerm: "",
    hint: "",
    matchedText: ""
  };
};

const classifyContext = ({ contextTerm = "", hint = "", countryNames = [] } = {}) => {
  const cleanedContext = cleanContextTerm(contextTerm);
  if (!cleanedContext) {
    return { contextType: "", contextDomain: "" };
  }

  const normalizedContext = normalizePhrase(cleanedContext);
  const countrySet = new Set(countryNames.map((name) => normalizePhrase(name)).filter(Boolean));
  const isKnownCountry = countrySet.has(normalizedContext);
  const hasPlaceCue = PLACE_CUES_REGEX.test(cleanedContext);
  const hasDatasetCue = DATASET_CUES_REGEX.test(cleanedContext);

  if (hint === "dataset" || hasDatasetCue) {
    return { contextType: "dataset", contextDomain: "DATASET" };
  }

  if (hint === "place" || isKnownCountry || hasPlaceCue) {
    return { contextType: "place", contextDomain: "DISTRICT" };
  }

  return { contextType: "non_place", contextDomain: "CATEGORY" };
};

const shouldUseEmptyTerm = ({
  intentAll = false,
  term = "",
  domain = "",
  contextTerm = ""
} = {}) => {
  const cleanTerm = normalizeWhitespace(term);
  if (!intentAll) return false;
  if (!domain) return false;
  if (!cleanTerm) return true;
  if (GENERIC_TERM_REGEX.test(cleanTerm)) return true;
  if (contextTerm && normalizePhrase(cleanTerm) === normalizePhrase(contextTerm)) return true;
  return false;
};

const createDefaultParsed = ({
  fallbackDomain = "ALL NODES",
  fallbackProperty = "Name",
  intentAll = false
} = {}) => ({
  term: "",
  domain: fallbackDomain,
  property: normalizeProperty(fallbackProperty),
  contextID: "",
  contextTerm: "",
  contextType: "",
  contextDomain: "",
  datasetID: "",
  yearStart: "",
  yearEnd: "",
  countryName: "",
  intentAll
});

const parseFirstJsonObject = (text = "") => {
  const cleaned = String(text)
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  if (!cleaned) return null;

  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue to balanced-object scan fallback.
  }

  let depth = 0;
  let startIndex = -1;
  let inString = false;
  let escapeNext = false;

  for (let index = 0; index < cleaned.length; index += 1) {
    const char = cleaned[index];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") {
      if (depth === 0) startIndex = index;
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0 && startIndex >= 0) {
        const candidate = cleaned.slice(startIndex, index + 1);
        try {
          return JSON.parse(candidate);
        } catch {
          return null;
        }
      }
      if (depth < 0) break;
    }
  }

  return null;
};

export const toUiProperty = (property = "Name") =>
  property === "CMID" ? "CatMapper ID (CMID)" : property;

export function parseNaturalLanguageSearch({
  query = "",
  fallbackDomain = "ALL NODES",
  fallbackProperty = "Name",
  availableSubdomains = [],
  countryNames = []
} = {}) {
  const normalizedQuery = cleanQueryText(query);
  const intentAll = /\b(all|everything)\b/i.test(normalizedQuery);

  const parsed = createDefaultParsed({
    fallbackDomain,
    fallbackProperty,
    intentAll
  });

  if (!normalizedQuery) return parsed;

  let working = normalizedQuery;

  const contextMatch = working.match(/\bcontext(?:\s*id)?\s*(?:=|:)?\s*([A-Za-z0-9._:-]+)/i);
  if (contextMatch) {
    parsed.contextID = contextMatch[1];
    working = removeMatchedClause(working, contextMatch[0]);
  }

  const datasetMatch = working.match(
    /\b(?:dataset\s*id|datasetid)\s*(?:is|=|:)?\s*([A-Za-z0-9._:-]+)\b/i
  ) || working.match(/\bdataset\s*(?:=|:)\s*([A-Za-z0-9._:-]+)\b/i);
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

  const domainMatch = findDomainInQuery(working, availableSubdomains);
  if (domainMatch.domain) {
    parsed.domain = domainMatch.domain;
    working = removeMatchedClause(
      working,
      /\b(?:domain|subdomain)\s*(?:is|=|:)?\s*[A-Za-z0-9 _-]{2,50}\b/i
    );
    if (domainMatch.matchedText) {
      working = removeMatchedClause(working, buildPhraseRegex(domainMatch.matchedText));
    }
  }

  const contextClause = extractContextClause(working);
  if (contextClause.contextTerm && !parsed.contextID) {
    parsed.contextTerm = contextClause.contextTerm;
    const classification = classifyContext({
      contextTerm: parsed.contextTerm,
      hint: contextClause.hint,
      countryNames
    });
    parsed.contextType = classification.contextType;
    parsed.contextDomain = classification.contextDomain;
    if (classification.contextType === "place") {
      parsed.countryName = parsed.contextTerm;
    }
    working = removeMatchedClause(working, contextClause.matchedText);
  }

  if (!parsed.term) {
    const explicitTerm = extractTerm(working);
    if (explicitTerm) {
      parsed.term = explicitTerm;
    } else {
      parsed.term = cleanQueryText(working.replace(NOISE_WORDS_REGEX, " "));
    }
  }

  parsed.term = normalizeExtractedTerm(
    normalizeWhitespace(parsed.term.replace(/^["']|["']$/g, ""))
  );

  if (
    shouldUseEmptyTerm({
      intentAll: parsed.intentAll,
      term: parsed.term,
      domain: parsed.domain,
      contextTerm: parsed.contextTerm
    })
  ) {
    parsed.term = "";
  }

  return parsed;
}

export function validateParsedNlpJson(
  raw,
  {
    fallbackDomain = "ALL NODES",
    fallbackProperty = "Name",
    availableSubdomains = [],
    countryNames = []
  } = {}
) {
  const parsed = createDefaultParsed({ fallbackDomain, fallbackProperty });
  const errors = [];

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { valid: false, parsed, errors: ["Model output is not a JSON object."] };
  }

  const domainCandidate = normalizeDomainCandidate(raw.domain || "", availableSubdomains);
  if (raw.domain != null && !domainCandidate) {
    errors.push(`Unsupported domain "${String(raw.domain)}".`);
  }
  parsed.domain = domainCandidate || fallbackDomain;

  const normalizedProperty = normalizeProperty(raw.property || fallbackProperty);
  if (ALLOWED_PROPERTIES.has(normalizedProperty)) {
    parsed.property = normalizedProperty;
  } else {
    errors.push(`Unsupported property "${String(raw.property)}".`);
  }

  parsed.term = normalizeExtractedTerm(sanitizePlainText(raw.term || "", 160));

  const contextIDValue = raw.contextID ?? raw.context ?? "";
  parsed.contextID = sanitizeIdentifier(contextIDValue);
  if (contextIDValue && !parsed.contextID) {
    errors.push("Invalid contextID format.");
  }

  parsed.contextTerm = cleanContextTerm(sanitizePlainText(raw.contextTerm || "", 120));

  const rawContextDomain = sanitizePlainText(raw.contextDomain || "", 40).toUpperCase();
  if (rawContextDomain) {
    if (ALLOWED_CONTEXT_DOMAINS.has(rawContextDomain)) {
      parsed.contextDomain = rawContextDomain;
    } else {
      errors.push(`Invalid contextDomain "${rawContextDomain}".`);
    }
  }

  const datasetValue = raw.datasetID ?? raw.dataset ?? "";
  parsed.datasetID = sanitizeIdentifier(datasetValue);
  if (datasetValue && !parsed.datasetID) {
    errors.push("Invalid datasetID format.");
  }

  const yearStart = sanitizeYear(raw.yearStart || "");
  if (raw.yearStart && !yearStart) {
    errors.push("Invalid yearStart value.");
  }
  parsed.yearStart = yearStart;

  const yearEnd = sanitizeYear(raw.yearEnd || "");
  if (raw.yearEnd && !yearEnd) {
    errors.push("Invalid yearEnd value.");
  }
  parsed.yearEnd = yearEnd;

  parsed.countryName = sanitizePlainText(raw.countryName || "", 100);
  parsed.intentAll = toBoolean(raw.intentAll);

  if (parsed.contextTerm && !parsed.contextDomain) {
    const classification = classifyContext({
      contextTerm: parsed.contextTerm,
      hint: "",
      countryNames
    });
    parsed.contextType = classification.contextType;
    parsed.contextDomain = classification.contextDomain;
  }

  if (parsed.contextTerm && parsed.contextDomain === "DISTRICT" && !parsed.countryName) {
    parsed.countryName = parsed.contextTerm;
  }

  if (
    shouldUseEmptyTerm({
      intentAll: parsed.intentAll,
      term: parsed.term,
      domain: parsed.domain,
      contextTerm: parsed.contextTerm
    })
  ) {
    parsed.term = "";
  }

  return {
    valid: errors.length === 0,
    parsed,
    errors
  };
}

const buildLlmPrompt = ({
  query,
  fallbackDomain,
  fallbackProperty,
  availableSubdomains
}) => {
  const allowedDomains = [...new Set(availableSubdomains)].filter(Boolean).join(", ");

  return [
    "Convert this natural-language CatMapper search into JSON parameters.",
    "Output ONLY one JSON object, no prose.",
    "Allowed keys: term, domain, property, contextID, contextTerm, contextDomain, datasetID, yearStart, yearEnd, countryName, intentAll.",
    "Rules:",
    "- property must be one of: Name, Key, CMID.",
    "- contextDomain must be one of: DISTRICT, CATEGORY, DATASET.",
    "- Use empty string for missing optional fields.",
    "- Preserve exact search text in term where possible.",
    `- If domain is missing, use ${fallbackDomain}.`,
    `- If property is missing, use ${normalizeProperty(fallbackProperty)}.`,
    allowedDomains ? `- Prefer domains from: ${allowedDomains}.` : "",
    `Input: ${query}`
  ]
    .filter(Boolean)
    .join("\n");
};

export async function parseNaturalLanguageSearchWithLlm({
  query = "",
  fallbackDomain = "ALL NODES",
  fallbackProperty = "Name",
  availableSubdomains = [],
  countryNames = [],
  ollamaUrl = process.env.REACT_APP_OLLAMA_URL || "http://127.0.0.1:11434",
  model = process.env.REACT_APP_OLLAMA_MODEL || "qwen3-nl2api:q4km",
  timeoutMs = 12000
} = {}) {
  const defaultParsed = createDefaultParsed({
    fallbackDomain,
    fallbackProperty,
    intentAll: /\b(all|everything)\b/i.test(cleanQueryText(query))
  });

  if (!cleanQueryText(query)) {
    return {
      status: "empty_query",
      parsed: defaultParsed,
      errors: [],
      model,
      prompt: "",
      raw: ""
    };
  }

  const llmPrompt = buildLlmPrompt({ query, fallbackDomain, fallbackProperty, availableSubdomains });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${ollamaUrl.replace(/\/+$/, "")}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: llmPrompt,
        stream: false,
        options: {
          temperature: 0
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      return {
        status: "http_error",
        parsed: defaultParsed,
        errors: [`LLM endpoint returned ${response.status}.`],
        model,
        prompt: llmPrompt,
        raw: ""
      };
    }

    const payload = await response.json();
    const rawObject = parseFirstJsonObject(payload?.response || "");
    if (!rawObject) {
      return {
        status: "invalid_json",
        parsed: defaultParsed,
        errors: ["LLM response did not contain valid JSON."],
        model,
        prompt: llmPrompt,
        raw: payload?.response || ""
      };
    }

    const validated = validateParsedNlpJson(rawObject, {
      fallbackDomain,
      fallbackProperty,
      availableSubdomains,
      countryNames
    });

    return {
      status: validated.valid ? "ok" : "invalid_schema",
      parsed: validated.parsed,
      errors: validated.errors,
      model,
      prompt: llmPrompt,
      raw: payload?.response || ""
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      return {
        status: "timeout",
        parsed: defaultParsed,
        errors: [`LLM request timed out after ${timeoutMs}ms.`],
        model,
        prompt: llmPrompt,
        raw: ""
      };
    }

    return {
      status: "network_error",
      parsed: defaultParsed,
      errors: [error?.message || "Unknown LLM network error."],
      model,
      prompt: llmPrompt,
      raw: ""
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function validateApiSearchParams({
  database = "",
  domain = "",
  property = "Name",
  term = "",
  yearStart = "",
  yearEnd = "",
  context = "",
  dataset = "",
  country = "",
  availableSubdomains = [],
  fallbackDomain = "ALL NODES",
  fallbackProperty = "Name"
} = {}) {
  const errors = [];

  const cleanDatabase = sanitizePlainText(database, 30);
  if (!cleanDatabase) {
    errors.push("Missing database value.");
  }

  const cleanDomain =
    normalizeDomainCandidate(domain || fallbackDomain, availableSubdomains) || fallbackDomain;

  if (domain && !normalizeDomainCandidate(domain, availableSubdomains)) {
    errors.push(`Invalid domain "${domain}".`);
  }

  const cleanProperty = normalizeProperty(property || fallbackProperty);
  if (!ALLOWED_PROPERTIES.has(cleanProperty)) {
    errors.push(`Invalid property "${property}".`);
  }

  const cleanTerm = sanitizePlainText(term || "", 160);

  const cleanYearStart = sanitizeYear(yearStart || "");
  if (yearStart && !cleanYearStart) {
    errors.push("Invalid yearStart value.");
  }

  const cleanYearEnd = sanitizeYear(yearEnd || "");
  if (yearEnd && !cleanYearEnd) {
    errors.push("Invalid yearEnd value.");
  }

  const cleanContext = sanitizeIdentifier(context || "");
  if (context && !cleanContext) {
    errors.push("Invalid context value.");
  }

  const cleanDataset = sanitizeIdentifier(dataset || "");
  if (dataset && !cleanDataset) {
    errors.push("Invalid dataset value.");
  }

  const cleanCountry = normalizeWhitespace(String(country || ""));
  if (cleanCountry && !SAFE_COUNTRY_CODE_REGEX.test(cleanCountry)) {
    errors.push("Invalid country code value.");
  }

  const params = {
    database: cleanDatabase,
    domain: cleanDomain,
    property: cleanProperty,
    term: cleanTerm,
    yearStart: cleanYearStart,
    yearEnd: cleanYearEnd,
    context: cleanContext,
    dataset: cleanDataset,
    country: cleanCountry
  };

  return {
    valid: errors.length === 0,
    params,
    errors
  };
}

const rankContextCandidate = (candidate = {}, contextTerm = "") => {
  const matchName = normalizePhrase(candidate.CMName || "");
  const target = normalizePhrase(contextTerm);
  if (!matchName) return 99;
  if (matchName === target) return 0;
  if (matchName.startsWith(target)) return 1;
  if (matchName.includes(target)) return 2;
  return 3;
};

export async function resolveContextCmid({
  apiUrl,
  database,
  contextTerm,
  contextDomain = "CATEGORY",
  property = "Name",
  topK = 10
} = {}) {
  if (!apiUrl || !database || !contextTerm) {
    return { status: "not_requested", cmid: null, candidates: [] };
  }

  const params = new URLSearchParams({
    database,
    term: contextTerm,
    domain: contextDomain,
    property
  });

  try {
    const response = await fetch(`${apiUrl}/search?${params.toString()}&query=false`, {
      method: "GET"
    });

    if (!response.ok) {
      return { status: "error", cmid: null, candidates: [] };
    }

    const payload = await response.json();
    const candidates = (Array.isArray(payload?.data) ? payload.data : [])
      .slice(0, topK)
      .map((candidate) => ({
        CMID: candidate.CMID,
        CMName: candidate.CMName,
        score: rankContextCandidate(candidate, contextTerm)
      }))
      .sort((left, right) => left.score - right.score);

    if (!candidates.length) {
      return { status: "not_found", cmid: null, candidates: [] };
    }

    const [best, second] = candidates;
    if (best.score === 0) {
      return {
        status: "resolved",
        cmid: best.CMID,
        matchedName: best.CMName,
        candidates
      };
    }

    if ((second && second.score === best.score) || best.score >= 3) {
      return {
        status: "ambiguous",
        cmid: null,
        candidates
      };
    }

    return {
      status: "resolved",
      cmid: best.CMID,
      matchedName: best.CMName,
      candidates
    };
  } catch (error) {
    console.error("Context resolver failed:", error);
    return { status: "error", cmid: null, candidates: [] };
  }
}
