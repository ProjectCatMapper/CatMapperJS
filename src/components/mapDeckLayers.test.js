import { describe, expect, it } from "vitest";

import {
  buildDeckPolygonData,
  getDeckPolygonTooltip,
  hexToRgba,
} from "./mapDeckLayers";

describe("high-volume map polygon layers", () => {
  it("preserves polygons and their layer metadata for DeckGL", () => {
    const polygons = buildDeckPolygonData([
      {
        id: "descendants:CONTAINS",
        label: "Descendant locations",
        mode: "descendants",
        relationship: "CONTAINS",
        polygons: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {
                source: "Dataset A",
                inheritedFromName: "District A",
                inheritedFromCMID: "SM2",
                inherited: true,
              },
              geometry: {
                type: "Polygon",
                coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]],
              },
            },
          ],
        },
      },
    ]);

    expect(polygons).toHaveLength(1);
    expect(polygons[0].properties.__mapLayerMode).toBe("descendants");
    expect(getDeckPolygonTooltip(polygons[0])).toBe(
      "Inherited from District A (SM2) via CONTAINS\nSource: Dataset A"
    );
  });

  it("converts source colors to DeckGL RGBA values", () => {
    expect(hexToRgba("#1234ab", 41)).toEqual([18, 52, 171, 41]);
  });
});
