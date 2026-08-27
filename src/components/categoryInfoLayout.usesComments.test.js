import { describe, expect, it } from "vitest";
import {
  buildCategoryInfoSections,
  normalizeUsesComments,
} from "./categoryInfoLayout";

describe("USES tie comment display contract", () => {
  it("keeps only non-empty comments from the API payload", () => {
    const comments = normalizeUsesComments([
      "First comment",
      "",
      "  ",
      null,
      "Second comment",
      "Second comment",
    ]);

    expect(comments).toEqual([
      "First comment",
      "Second comment",
      "Second comment",
    ]);
  });

  it("puts one COMMENTS entry in its own final header section", () => {
    const sections = buildCategoryInfoSections({
      CMName: "Example",
      UsesComments: ["First comment", "Second comment"],
      direct_Children: 2,
    });

    expect(sections.detail).toEqual([]);
    expect(sections.stats.map((entry) => entry.displayKey)).toEqual([
      "direct Children",
    ]);
    expect(sections.comments).toHaveLength(1);
    expect(sections.comments[0]).toMatchObject({
      displayKey: "COMMENTS",
      normalized: "usescomments",
      plainValue: "First comment\nSecond comment",
    });
  });
});
