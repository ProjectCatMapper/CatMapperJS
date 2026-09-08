import { describe, expect, it } from "vitest";
import {
  buildCategoryInfoSections,
  normalizeUsesComments,
} from "./categoryInfoLayout";

describe("USES tie comment display contract", () => {
  it("keeps only non-empty comments from the API payload", () => {
    const comments = normalizeUsesComments([
      "SD11: First comment",
      "",
      "  ",
      null,
      "AD941: Second comment",
      "AD941: Second comment",
    ]);

    expect(comments).toEqual([
      "SD11: First comment",
      "AD941: Second comment",
      "AD941: Second comment",
    ]);
  });

  it("puts one COMMENTS entry in its own final header section", () => {
    const sections = buildCategoryInfoSections({
      CMName: "Example",
      UsesComments: ["SD11: First comment", "AD941: Second comment"],
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
      plainValue: "SD11: First comment\nAD941: Second comment",
    });
  });
});
