import { describe, expect, it } from "vitest";

import {
  buildDeckPolygonData,
  DECK_POINT_RADIUS_MIN_PIXELS,
  getDeckCoordinateBounds,
  getDeckPolygonPositions,
  getDeckPolygonTooltip,
  hexToRgba,
  shouldUseDeckGlMap,
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
              type: "MultiPolygon",
              coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 0]]]],
              properties: {
                source: "Dataset A",
                inheritedFromName: "District A",
                inheritedFromCMID: "SM2",
                inherited: true,
              },
            },
          ],
        },
      },
    ]);

    expect(polygons).toHaveLength(1);
    expect(polygons[0].type).toBe("Feature");
    expect(polygons[0].geometry.type).toBe("MultiPolygon");
    expect(polygons[0].properties.__mapLayerMode).toBe("descendants");
    expect(getDeckPolygonTooltip(polygons[0])).toBe(
      "Inherited from District A (SM2) via CONTAINS\nSource: Dataset A"
    );
  });

  it("converts source colors to DeckGL RGBA values", () => {
    expect(hexToRgba("#1234ab", 41)).toEqual([18, 52, 171, 41]);
  });

  it("renders DeckGL points fifty percent larger than the original radius", () => {
    expect(DECK_POINT_RADIUS_MIN_PIXELS).toBe(3 * 1.5);
  });

  it("uses DeckGL for descendant layers at every point count", () => {
    expect(shouldUseDeckGlMap([{ mode: "descendants" }], 18)).toBe(true);
    expect(shouldUseDeckGlMap([{ mode: "direct" }], 18)).toBe(false);
    expect(shouldUseDeckGlMap([{ mode: "direct" }], 301)).toBe(true);
  });

  it("extracts polygon coordinates for polygon-only DeckGL bounds", () => {
    expect(getDeckPolygonPositions([
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[[1, 2], [3, 4], [1, 2]]],
        },
      },
    ])).toEqual([[1, 2], [3, 4], [1, 2]]);
  });

  it("calculates large coordinate bounds without spreading function arguments", () => {
    const positions = Array.from(
      { length: 100_000 },
      (_, index) => [index % 360 - 180, index % 180 - 90]
    );

    expect(getDeckCoordinateBounds(positions)).toEqual({
      minLongitude: -180,
      maxLongitude: 179,
      minLatitude: -90,
      maxLatitude: 89,
    });
  });
});
