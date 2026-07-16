export const getMapLayerLocationCount = (layer) =>
  Number(layer?.pointCount || 0) + Number(layer?.polygonCount || 0);

export const getMapLayerControlCount = (
  optionLayer,
  loadedLayers,
  enabledLayerIds
) => {
  const useLoadedDescendants =
    optionLayer?.mode === "descendants" &&
    enabledLayerIds?.includes(optionLayer.id);
  const loadedLayer = useLoadedDescendants && Array.isArray(loadedLayers)
    ? loadedLayers.find((layer) => layer.id === optionLayer.id)
    : null;

  return getMapLayerLocationCount(loadedLayer || optionLayer);
};
