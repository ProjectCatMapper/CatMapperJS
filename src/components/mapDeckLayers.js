import {
  inheritedMapLabel,
  isInheritedMapItem,
} from "./mapPointTooltip";

export const DECK_POINT_RADIUS_MIN_PIXELS = 4.5;

export const shouldUseDeckGlMap = (layers, pointCount) =>
  Number(pointCount || 0) > 300 ||
  layers.some((layer) => layer.mode === "descendants");

export const getPolygonFeatures = (polygons) => {
  if (!polygons) return [];
  if (Array.isArray(polygons)) return polygons.flatMap(getPolygonFeatures);
  if (Array.isArray(polygons.features)) {
    const collectionProperties = {
      ...(polygons.properties || {}),
      ...(polygons.source ? { source: polygons.source } : {}),
    };

    return polygons.features.flatMap(getPolygonFeatures).map((feature) => ({
      ...feature,
      properties: {
        ...collectionProperties,
        ...(feature.properties || {}),
      },
    }));
  }
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

const collectCoordinatePairs = (coordinates, positions) => {
  if (
    Array.isArray(coordinates) &&
    coordinates.length >= 2 &&
    Number.isFinite(coordinates[0]) &&
    Number.isFinite(coordinates[1])
  ) {
    positions.push([coordinates[0], coordinates[1]]);
    return;
  }
  if (Array.isArray(coordinates)) {
    coordinates.forEach((item) => collectCoordinatePairs(item, positions));
  }
};

export const getDeckPolygonPositions = (features) => {
  const positions = [];
  features.forEach((feature) => {
    collectCoordinatePairs(feature?.geometry?.coordinates, positions);
  });
  return positions;
};

export const getDeckCoordinateBounds = (positions) => {
  if (!positions.length) return null;
  let minLongitude = Infinity;
  let maxLongitude = -Infinity;
  let minLatitude = Infinity;
  let maxLatitude = -Infinity;

  positions.forEach(([longitude, latitude]) => {
    minLongitude = Math.min(minLongitude, longitude);
    maxLongitude = Math.max(maxLongitude, longitude);
    minLatitude = Math.min(minLatitude, latitude);
    maxLatitude = Math.max(maxLatitude, latitude);
  });

  return { minLongitude, maxLongitude, minLatitude, maxLatitude };
};
