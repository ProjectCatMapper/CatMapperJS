import {
  buildCategoryInfoSections,
  getCategoryInfoPlainValue,
  getCategoryInfoPreview,
} from "./categoryInfoLayout";

describe("categoryInfoLayout", () => {
  test("orders primary metadata and renames the display labels", () => {
    const sections = buildCategoryInfoSections({
      Domains: "LANGUAGE",
      Location: "Ghana",
      CMID: "SM1",
      CMName: "Yoruba",
    });

    expect(sections.primary.map((entry) => entry.displayKey)).toEqual([
      "CatMapper Name",
      "CatMapper ID",
      "Domain",
    ]);
    expect(sections.primary.map((entry) => entry.plainValue)).toEqual([
      "Yoruba",
      "SM1",
      "LANGUAGE",
    ]);
  });

  test("keeps geographic Location separate from Dataset Location", () => {
    const sections = buildCategoryInfoSections({
      CMID: "AD332890",
      CMName: "p3k14c (2022.6)",
      Citation: "Bird et al. (2022).",
      "Dataset Location": "https://www.p3k14c.org/",
      Domains: "DATASET",
      Location: "World",
      Note: "Excludes records without site names and coordinates.",
      all_Descendants: 0,
      direct_Children: 0,
      direct_Parents: 0,
    });

    const compactKeys = sections.compact.map((entry) => entry.normalized);
    expect(compactKeys).toContain("location");
    expect(compactKeys).toContain("datasetlocation");
    expect(sections.compact.filter((entry) => entry.normalized === "location")).toHaveLength(1);
    expect(
      sections.compact.find((entry) => entry.normalized === "location")?.plainValue
    ).toBe("World");
    expect(
      sections.compact.find((entry) => entry.normalized === "datasetlocation")?.plainValue
    ).toBe("https://www.p3k14c.org/");
  });

  test("keeps language and religion in compact metadata and preserves multi-value text", () => {
    const sections = buildCategoryInfoSections({
      CMID: "SM88",
      CMName: "Example Node",
      Domains: "CATEGORY",
      Language: ["English", "French", "German"],
      Religion: ["Islam", "Christianity"],
    });

    expect(sections.compact.map((entry) => entry.normalized)).toEqual([
      "language",
      "religion",
    ]);
    expect(sections.compact[0].plainValue).toBe("English, French, German");
    expect(sections.compact[1].plainValue).toBe("Islam, Christianity");
  });

  test("moves note and citation into detail rows and keeps count fields in stats", () => {
    const sections = buildCategoryInfoSections({
      CMID: "SM7",
      CMName: "Long Detail Example",
      Domains: "RELIGION",
      Note: "This is a note that should render in the detail section.",
      Citation: "A citation that should stay after other detail fields.",
      direct_Children: 0,
      all_Descendants: 12,
      direct_Parents: 1,
    });

    expect(sections.detail.map((entry) => entry.normalized)).toEqual(["note", "citation"]);
    expect(sections.stats.map((entry) => entry.normalized)).toEqual([
      "directchildren",
      "alldescendants",
      "directparents",
    ]);
    expect(sections.stats.map((entry) => entry.plainValue)).toEqual(["0", "12", "1"]);
  });

  test("formats plain values and preview text consistently", () => {
    expect(getCategoryInfoPlainValue(["A", "B", "C"])).toBe("A, B, C");
    expect(getCategoryInfoPreview("abcdefghijklmnopqrstuvwxyz", 10)).toEqual({
      text: "abcdefghij . . .",
      truncated: true,
    });
  });
});
