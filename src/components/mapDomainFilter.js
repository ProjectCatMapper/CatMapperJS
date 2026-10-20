import { getPolygonFeatures } from './mapDeckLayers';

const structuralLabels = new Set(['CATEGORY', 'DATASET', 'AREA']);

export const getMapDomains = (item, fallback = []) => {
  const labels = item?.sourceNodeLabels ?? item?.properties?.sourceNodeLabels ?? fallback;
  return [...new Set((Array.isArray(labels) ? labels : []).filter(
    (label) => typeof label === 'string' && !structuralLabels.has(label)
  ))];
};

export const getAvailableMapDomains = (layers, fallback = []) => [...new Set(
  layers.flatMap((layer) => [...layer.points, ...getPolygonFeatures(layer.polygons)]
    .flatMap((item) => getMapDomains(item, fallback)))
)].sort();

export const filterMapDomains = (layers, selected, fallback = []) => {
  const visible = (item) => {
    const domains = getMapDomains(item, fallback);
    return domains.length === 0 || domains.some((domain) => selected.includes(domain));
  };
  return layers.map((layer) => ({
    ...layer,
    points: layer.points.filter(visible),
    polygons: getPolygonFeatures(layer.polygons).filter(visible),
  }));
};
