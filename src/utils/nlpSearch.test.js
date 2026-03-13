import { describe, it, expect, vi, afterEach } from "vitest";
import {
  parseNaturalLanguageSearch,
  parseNaturalLanguageSearchWithLlm,
  resolveContextCmid,
  toUiProperty,
  validateApiSearchParams
} from "./nlpSearch";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("parseNaturalLanguageSearch", () => {
  it("parses place context and routes it to DISTRICT", () => {
    const parsed = parseNaturalLanguageSearch({
      query: "look up Yoruba in Ghana",
      fallbackDomain: "ALL NODES",
      fallbackProperty: "Name",
      availableSubdomains: ["ALL NODES", "ETHNICITY", "DISTRICT"],
      countryNames: ["Ghana", "Kenya"]
    });

    expect(parsed.term).toBe("Yoruba");
    expect(parsed.contextTerm).toBe("Ghana");
    expect(parsed.contextDomain).toBe("DISTRICT");
    expect(parsed.property).toBe("Name");
  });

  it("strips leading article from extracted term", () => {
    const parsed = parseNaturalLanguageSearch({
      query: "find the Yoruba in Ghana",
      fallbackDomain: "ALL NODES",
      fallbackProperty: "Name",
      availableSubdomains: ["ALL NODES", "ETHNICITY", "DISTRICT"],
      countryNames: ["Ghana"]
    });

    expect(parsed.term).toBe("Yoruba");
  });

  it("parses explicit CMID + domain", () => {
    const parsed = parseNaturalLanguageSearch({
      query: "find cmid CM12345 in ethnicity",
      fallbackDomain: "ALL NODES",
      fallbackProperty: "Name",
      availableSubdomains: ["ALL NODES", "ETHNICITY", "DISTRICT"]
    });

    expect(parsed.property).toBe("CMID");
    expect(parsed.term).toBe("CM12345");
    expect(parsed.domain).toBe("ETHNICITY");
  });

  it("handles empty-term all-intent with non-place context", () => {
    const parsed = parseNaturalLanguageSearch({
      query: "look up all projectile points associated with the Hohokam",
      fallbackDomain: "ALL NODES",
      fallbackProperty: "Name",
      availableSubdomains: ["ALL NODES", "PROJECTILE_POINT_TYPE", "CATEGORY"]
    });

    expect(parsed.domain).toBe("PROJECTILE_POINT_TYPE");
    expect(parsed.contextTerm).toBe("Hohokam");
    expect(parsed.contextDomain).toBe("CATEGORY");
    expect(parsed.intentAll).toBe(true);
    expect(parsed.term).toBe("");
  });

  it("parses dataset context with date range", () => {
    const parsed = parseNaturalLanguageSearch({
      query: "list all religions in dataset Seshat between 1800 and 1950",
      fallbackDomain: "ALL NODES",
      fallbackProperty: "Name",
      availableSubdomains: ["ALL NODES", "RELIGION", "DATASET"]
    });

    expect(parsed.domain).toBe("RELIGION");
    expect(parsed.contextTerm).toBe("Seshat");
    expect(parsed.contextDomain).toBe("DATASET");
    expect(parsed.term).toBe("");
    expect(parsed.yearStart).toBe("1800");
    expect(parsed.yearEnd).toBe("1950");
  });

  it("parses trailing dataset phrase and maps it to DATASET context", () => {
    const parsed = parseNaturalLanguageSearch({
      query: "find all projectile points from the projectilepoint.net dataset",
      fallbackDomain: "ALL NODES",
      fallbackProperty: "Name",
      availableSubdomains: ["ALL NODES", "PROJECTILE_POINT_TYPE", "DATASET"]
    });

    expect(parsed.domain).toBe("PROJECTILE_POINT_TYPE");
    expect(parsed.contextTerm).toBe("projectilepoint.net");
    expect(parsed.contextDomain).toBe("DATASET");
    expect(parsed.term).toBe("");
  });

  it("extracts clean term from filler-heavy period query", () => {
    const parsed = parseNaturalLanguageSearch({
      query: "I want to find periods from the iron age in Italy",
      fallbackDomain: "ALL NODES",
      fallbackProperty: "Name",
      availableSubdomains: ["ALL NODES", "PERIOD", "DISTRICT"],
      countryNames: ["Italy"]
    });

    expect(parsed.domain).toBe("PERIOD");
    expect(parsed.term).toBe("iron age");
    expect(parsed.contextTerm).toBe("Italy");
    expect(parsed.contextDomain).toBe("DISTRICT");
  });

  it("parses explicit datasetID expressions", () => {
    const parsed = parseNaturalLanguageSearch({
      query: "find all projectile points dataset id AD123",
      fallbackDomain: "ALL NODES",
      fallbackProperty: "Name",
      availableSubdomains: ["ALL NODES", "PROJECTILE_POINT_TYPE", "DATASET"]
    });

    expect(parsed.domain).toBe("PROJECTILE_POINT_TYPE");
    expect(parsed.datasetID).toBe("AD123");
    expect(parsed.term).toBe("");
  });
});

describe("resolveContextCmid", () => {
  it("returns resolved on exact match", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            { CMID: "CMX", CMName: "Ghana Region" },
            { CMID: "CMY", CMName: "Ghana" }
          ]
        })
      })
    );

    const resolved = await resolveContextCmid({
      apiUrl: "http://localhost:5000",
      database: "sociomap",
      contextTerm: "Ghana",
      contextDomain: "DISTRICT"
    });

    expect(resolved.status).toBe("resolved");
    expect(resolved.cmid).toBe("CMY");
  });

  it("returns ambiguous when multiple top candidates tie", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            { CMID: "CMA", CMName: "Mississippi Valley" },
            { CMID: "CMB", CMName: "Mississippi Basin" }
          ]
        })
      })
    );

    const resolved = await resolveContextCmid({
      apiUrl: "http://localhost:5000",
      database: "archamap",
      contextTerm: "Mississippi",
      contextDomain: "DISTRICT"
    });

    expect(resolved.status).toBe("ambiguous");
    expect(resolved.cmid).toBeNull();
    expect(resolved.candidates.length).toBeGreaterThan(1);
  });
});

describe("parseNaturalLanguageSearchWithLlm", () => {
  it("accepts model JSON when schema is valid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          response: JSON.stringify({
            term: "Yoruba",
            domain: "ETHNICITY",
            property: "Name",
            contextTerm: "Ghana",
            contextDomain: "DISTRICT",
            intentAll: false
          })
        })
      })
    );

    const result = await parseNaturalLanguageSearchWithLlm({
      query: "look up Yoruba in Ghana",
      fallbackDomain: "ALL NODES",
      fallbackProperty: "Name",
      availableSubdomains: ["ALL NODES", "ETHNICITY", "DISTRICT"],
      countryNames: ["Ghana"],
      ollamaUrl: "http://localhost:11434",
      model: "qwen3-nl2api:q4km"
    });

    expect(result.status).toBe("ok");
    expect(result.parsed.term).toBe("Yoruba");
    expect(result.parsed.domain).toBe("ETHNICITY");
    expect(result.parsed.contextDomain).toBe("DISTRICT");
    expect(result.prompt).toContain("Input: look up Yoruba in Ghana");
    expect(result.raw).toContain("Yoruba");
  });

  it("returns invalid_json when model response is not parseable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          response: "not-json"
        })
      })
    );

    const result = await parseNaturalLanguageSearchWithLlm({
      query: "look up Yoruba in Ghana",
      fallbackDomain: "ALL NODES",
      fallbackProperty: "Name",
      availableSubdomains: ["ALL NODES", "ETHNICITY", "DISTRICT"]
    });

    expect(result.status).toBe("invalid_json");
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe("validateApiSearchParams", () => {
  it("blocks invalid identifiers in context and dataset", () => {
    const validated = validateApiSearchParams({
      database: "sociomap",
      domain: "ETHNICITY",
      property: "Name",
      term: "Yoruba",
      context: "bad context!",
      dataset: "bad dataset!",
      availableSubdomains: ["ALL NODES", "ETHNICITY"]
    });

    expect(validated.valid).toBe(false);
    expect(validated.errors.join(" ")).toContain("Invalid context value");
    expect(validated.errors.join(" ")).toContain("Invalid dataset value");
  });

  it("normalizes property and preserves safe fields", () => {
    const validated = validateApiSearchParams({
      database: "archamap",
      domain: "PROJECTILE_POINT_TYPE",
      property: "CatMapper ID (CMID)",
      term: "CM1234",
      context: "CM9",
      availableSubdomains: ["ALL NODES", "PROJECTILE_POINT_TYPE"]
    });

    expect(validated.valid).toBe(true);
    expect(validated.params.property).toBe("CMID");
    expect(validated.params.context).toBe("CM9");
  });
});

describe("toUiProperty", () => {
  it("maps canonical CMID property for dropdown UI", () => {
    expect(toUiProperty("CMID")).toBe("CatMapper ID (CMID)");
  });
});
