import {
  inheritedMapLabel,
  isInheritedMapItem,
} from "./mapPointTooltip";

export const DECK_POINT_RADIUS_MIN_PIXELS = 4.5;

export const getPolygonFeatures = (polygons) => {
  if (!polygons) return [];
  if (Array.isArray(polygons)) return polygons;
  if (Array.isArray(polygons.features)) return polygons.features;
  return polygons.type ? [polygons] : [];
};

export const getFeatureSource = (feature) =>
  feature?.properties?.source || feature?.source || feature?.geometry?.source || "Unknown";

export const buildDeckPolygonData = (layers) =>
  layers.flatMap((layer) =>
    getPolygonFeatures(layer.polygons).map((polygon) => {
      const feature = polygon.type === "Feature"
        ? polygon
        : {
          type: "Feature",
          geometry: {
            type: polygon.type,
            coordinates: polygon.coordinates,
            ...(polygon.geometries ? { geometries: polygon.geometries } : {}),
          },
          properties: polygon.properties || {},
        };

      return {
        ...feature,
        properties: {
          ...feature.properties,
          __mapLayerId: layer.id,
          __mapLayerLabel: layer.label,
          __mapLayerMode: layer.mode,
          __mapLayerRelationship: layer.relationship,
        },
      };
    })
  );

export const hexToRgba = (hex, alpha = 255) => {
  const normalized = String(hex || "").replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return [0, 128, 255, alpha];
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
    alpha,
  ];
};

export const getDeckPolygonLayerMeta = (feature) => ({
  id: feature?.properties?.__mapLayerId,
  label: feature?.properties?.__mapLayerLabel,
  mode: feature?.properties?.__mapLayerMode,
  relationship: feature?.properties?.__mapLayerRelationship,
});

export const getDeckPolygonTooltip = (feature) => {
  const layer = getDeckPolygonLayerMeta(feature);
  const source = getFeatureSource(feature);
  return isInheritedMapItem(feature, layer)
    ? `${inheritedMapLabel(feature, layer)}\nSource: ${source}`
    : `Source: ${source}`;
};
