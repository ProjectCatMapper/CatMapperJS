import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  getUsesCommentLineCount,
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

  it("counts separate and embedded comment lines for the three-line preview", () => {
    expect(getUsesCommentLineCount(["First", "Second", "Third"])).toBe(3);
    expect(getUsesCommentLineCount(["First", "Second\nThird", "Fourth"])).toBe(4);
  });

  it("renders Comments after the header metadata without the old duplicate box title", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/ExploreNode.js"),
      "utf8"
    );
    const metadataPosition = source.indexOf('className="category-info-grid-inner"');
    const commentsPosition = source.indexOf('aria-label="Comments"');

    expect(metadataPosition).toBeGreaterThan(-1);
    expect(commentsPosition).toBeGreaterThan(metadataPosition);
    expect(source).not.toContain("Comments from USES ties");
  });
});
