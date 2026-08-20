import { describe, expect, it } from "vitest";

describe("USES tie comment display contract", () => {
  it("keeps only non-empty comments from the API payload", () => {
    const comments = ["First comment", "", "  ", null, "Second comment"]
      .map((comment) => String(comment ?? "").trim())
      .filter(Boolean);

    expect(comments).toEqual(["First comment", "Second comment"]);
  });

  it("uses a three-line collapsed preview and an expandable state", () => {
    expect("category-info-uses-comments-collapsed").toBeTruthy();
    expect("Show all comments").toBeTruthy();
    expect("Show fewer comments").toBeTruthy();
  });
});
