import { describe, expect, it } from "vitest";

import {
  buildDeckPolygonData,
  DECK_POINT_RADIUS_MIN_PIXELS,
  DECK_POINT_STACK_RADII_PIXELS,
  getDeckCoordinateBounds,
  getDeckFittedViewState,
  getDeckPolygonPositions,
  getDeckPolygonTooltip,
  getDeckStackOffsets,
  groupDeckPointsByPosition,
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

  it("flattens nested feature collections into valid DeckGL features", () => {
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
              type: "FeatureCollection",
              source: "GADM3.6",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "MultiPolygon",
                    coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 0]]]],
                  },
                  properties: {
                    inheritedFromName: "Florida",
                    inheritedFromCMID: "SM1267",
                    inherited: true,
                  },
                },
              ],
            },
          ],
        },
      },
    ]);

    expect(polygons).toHaveLength(1);
    expect(polygons[0].type).toBe("Feature");
    expect(polygons[0].geometry.type).toBe("MultiPolygon");
    expect(polygons[0].properties.source).toBe("GADM3.6");
    expect(polygons[0].properties.__mapLayerMode).toBe("descendants");
    expect(getDeckPolygonTooltip(polygons[0])).toBe(
      "Inherited from Florida (SM1267) via CONTAINS\nSource: GADM3.6"
    );
  });

  it("converts source colors to DeckGL RGBA values", () => {
    expect(hexToRgba("#1234ab", 41)).toEqual([18, 52, 171, 41]);
  });

  it("renders DeckGL points fifty percent larger than the original radius", () => {
    expect(DECK_POINT_RADIUS_MIN_PIXELS).toBe(3 * 1.5);
  });

  it("keeps coincident point stacks close to the ordinary point size", () => {
    expect(DECK_POINT_STACK_RADII_PIXELS[0]).toBeLessThanOrEqual(
      DECK_POINT_RADIUS_MIN_PIXELS + 0.5
    );
    expect(DECK_POINT_STACK_RADII_PIXELS).toEqual([5, 3.5, 2]);
  });

  it("uses DeckGL for descendant layers at every point count", () => {
    expect(shouldUseDeckGlMap([{ mode: "descendants" }], 18)).toBe(true);
    expect(shouldUseDeckGlMap([{ mode: "direct" }], 18)).toBe(false);
    expect(shouldUseDeckGlMap([{ mode: "direct" }], 301)).toBe(true);
  });

  it("groups coincident DeckGL points while preserving every record", () => {
    const groups = groupDeckPointsByPosition([
      { id: "a", position: [-71.1234564, 42.1] },
      { id: "b", position: [-71.12345649, 42.1] },
      { id: "c", position: [-72, 43] },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].points.map((point) => point.id)).toEqual(["a", "b"]);
    expect(groups[0].__pointStack).toBe(true);
    expect(groups[1].points).toHaveLength(1);
  });

  it("lays stack points out on expanding pixel-space rings", () => {
    const offsets = getDeckStackOffsets(10);

    expect(offsets).toHaveLength(10);
    expect(offsets[0]).toEqual([0, -18]);
    offsets.slice(0, 8).forEach(([x, y]) => {
      expect(Math.hypot(x, y)).toBeCloseTo(18, 2);
    });
    expect(Math.hypot(...offsets[8])).toBeCloseTo(36, 2);
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

  it("fits the DeckGL viewport to local data with a bounded zoom", () => {
    const viewState = getDeckFittedViewState({
      minLongitude: -72,
      maxLongitude: -71,
      minLatitude: 41,
      maxLatitude: 42,
    }, 1000, 600);

    expect(viewState.longitude).toBeCloseTo(-71.5, 1);
    expect(viewState.latitude).toBeCloseTo(41.5, 1);
    expect(viewState.zoom).toBeGreaterThan(1);
    expect(viewState.zoom).toBeLessThanOrEqual(7);
  });
});
