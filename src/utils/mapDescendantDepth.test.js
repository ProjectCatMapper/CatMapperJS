import { describe, expect, it } from "vitest";

import {
  getDescendantDepthLimit,
  getInitialDescendantDepth,
} from "./mapDescendantDepth";

describe("descendant map depth", () => {
  it("limits dropdown steps to the selected CMID's reachable depth", () => {
    const limits = {
      maxDepth: 30,
      availableDescendantDepth: 8,
      defaultDepth: 5,
    };

    expect(getDescendantDepthLimit(limits)).toBe(8);
    expect(getInitialDescendantDepth(limits)).toBe(5);
  });

  it("clamps the initial selection for shallow descendant hierarchies", () => {
    const limits = {
      maxDepth: 30,
      availableDescendantDepth: 2,
      defaultDepth: 5,
    };

    expect(getDescendantDepthLimit(limits)).toBe(2);
    expect(getInitialDescendantDepth(limits)).toBe(2);
  });

  it("retains the configured cap for older API responses", () => {
    expect(getDescendantDepthLimit({ maxDepth: 30 })).toBe(30);
  });
});
