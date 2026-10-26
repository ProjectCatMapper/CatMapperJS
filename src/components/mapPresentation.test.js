import { describe, expect, it } from "vitest";
import { buildMapSourceColors, DATASET_POINT_COLOR, getMapNodePath, MAP_POINT_COLORS } from "./mapPresentation";

describe("map presentation", () => {
  it("keeps every point color dark enough on a light basemap", () => {
    for (const color of MAP_POINT_COLORS) {
      const channels = [1, 3, 5].map((offset) => {
        const value = parseInt(color.slice(offset, offset + 2), 16) / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
      expect(1.05 / (luminance + 0.05)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("assigns distinct dataset colors up to palette capacity regardless of input order", () => {
    const sources = Array.from({ length: MAP_POINT_COLORS.length }, (_, index) => `Dataset ${index}`);
    const colors = buildMapSourceColors(sources);
    expect(new Set(Object.values(colors)).size).toBe(sources.length);
    expect(buildMapSourceColors([...sources].reverse())).toEqual(colors);
  });

  it("uses a single color for dataset maps even with legacy category-name sources", () => {
    const colors = buildMapSourceColors(["Basti", "Kitsootso", "Kizombo"], false);
    expect(new Set(Object.values(colors))).toEqual(new Set([DATASET_POINT_COLOR]));
  });

  it.each([
    ["SocioMap", { CMID: "SM2" }, "/sociomap/SM2"],
    ["archamap", { sourceNodeCMID: "AM3" }, "/archamap/AM3"],
    ["sociomap", { properties: { inheritedFromCMID: "SM4" } }, "/sociomap/SM4"],
    ["sociomap", {}, ""],
    ["sociomap", { CMID: "SM2/other" }, ""],
    [undefined, { CMID: "SM2" }, ""],
  ])("resolves only valid mapped node identities", (database, point, path) => {
    expect(getMapNodePath(database, point)).toBe(path);
  });
});
