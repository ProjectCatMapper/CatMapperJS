import { describe, expect, it } from "vitest";

import { getMapLayerControlCount } from "./mapLayerControlCount";

const descendantOption = {
  id: "descendants:CONTAINS",
  mode: "descendants",
  pointCount: 3,
  polygonCount: 2,
};

describe("map layer control counts", () => {
  it("uses the option summary before descendants are selected", () => {
    expect(getMapLayerControlCount(descendantOption, [], [])).toBe(5);
  });

  it("uses the loaded total for the selected descendant depth", () => {
    const loadedLayers = [
      {
        id: "descendants:CONTAINS",
        mode: "descendants",
        pointCount: 7,
        polygonCount: 4,
      },
    ];

    expect(
      getMapLayerControlCount(
        descendantOption,
        loadedLayers,
        ["descendants:CONTAINS"]
      )
    ).toBe(11);
  });

  it("falls back to the option summary while a loaded result is unavailable", () => {
    expect(
      getMapLayerControlCount(
        descendantOption,
        [],
        ["descendants:CONTAINS"]
      )
    ).toBe(5);
  });
});
