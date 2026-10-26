// Keep map points legible against the light basemap. Every palette color has
// at least 4.5:1 contrast against white; point fills must remain opaque.
export const MAP_POINT_COLORS = [
  "#1f5a99", "#8a3d1c", "#327145", "#7b3f8c", "#a3293f",
  "#006b73", "#615b18", "#704b38", "#4c566a",
];
export const DATASET_POINT_COLOR = MAP_POINT_COLORS[0];

const sourceColorIndex = (source) => {
  let hash = 0;
  for (const character of String(source || "Unknown")) {
    hash = (Math.imul(31, hash) + character.charCodeAt(0)) | 0;
  }
  return (hash >>> 0) % MAP_POINT_COLORS.length;
};

export const getMapSourceColor = (source) => MAP_POINT_COLORS[sourceColorIndex(source)];

export const buildMapSourceColors = (sources, colorBySource = true) => {
  const colors = Object.create(null);
  const used = new Set();
  [...new Set(sources.map((source) => source || "Unknown"))].sort().forEach((source) => {
    let index = sourceColorIndex(source);
    for (let attempt = 0; attempt < MAP_POINT_COLORS.length && used.has(index); attempt += 1) {
      index = (index + 1) % MAP_POINT_COLORS.length;
    }
    used.add(index);
    colors[source] = colorBySource ? MAP_POINT_COLORS[index] : DATASET_POINT_COLOR;
  });
  return colors;
};

export const getMapNodePath = (database, item) => {
  const properties = item?.properties || item || {};
  const cmid = properties.CMID || properties.sourceNodeCMID || properties.inheritedFromCMID;
  const platform = String(database || "").toLowerCase();
  if (!/^(SM|AM|SD|AD)\d+$/.test(cmid || "") || !["sociomap", "archamap"].includes(platform)) {
    return "";
  }
  return `/${platform}/${cmid}`;
};
