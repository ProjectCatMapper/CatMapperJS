import { describe, it, expect, vi, afterEach } from "vitest";
import {
  parseNaturalLanguageSearch,
  resolveCountryContext,
  toUiProperty
} from "./nlpSearch";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("parseNaturalLanguageSearch", () => {
  it("parses simple term + country", () => {
    const parsed = parseNaturalLanguageSearch({
      query: "look up Yoruba in Ghana",
      fallbackDomain: "ALL NODES",
      fallbackProperty: "Name",
      availableSubdomains: ["ALL NODES", "ETHNICITY", "DISTRICT"]
    });

    expect(parsed.term).toBe("Yoruba");
    expect(parsed.countryName).toBe("Ghana");
    expect(parsed.property).toBe("Name");
  });

  it("parses explicit cmid search", () => {
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

  it("parses dataset, context and date range", () => {
    const parsed = parseNaturalLanguageSearch({
      query: "search for Akan dataset AD1 context CM123 between 1800 and 1950",
      fallbackDomain: "ALL NODES",
      fallbackProperty: "Name",
      availableSubdomains: ["ALL NODES", "ETHNICITY", "DISTRICT"]
    });

    expect(parsed.term).toBe("Akan");
    expect(parsed.datasetID).toBe("AD1");
    expect(parsed.contextID).toBe("CM123");
    expect(parsed.yearStart).toBe("1800");
    expect(parsed.yearEnd).toBe("1950");
  });
});

describe("resolveCountryContext", () => {
  it("prefers exact country match and returns CMID", async () => {
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

    const resolved = await resolveCountryContext({
      apiUrl: "http://localhost:5000",
      database: "sociomap",
      countryName: "Ghana"
    });

    expect(resolved).toBe("CMY");
  });
});

describe("toUiProperty", () => {
  it("maps canonical CMID property for dropdown UI", () => {
    expect(toUiProperty("CMID")).toBe("CatMapper ID (CMID)");
  });
});
