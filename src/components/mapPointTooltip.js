const DIRECT_LAYER = "direct";

export const isInheritedMapItem = (item, layer = {}) =>
  Boolean(
    item?.inherited ||
    item?.properties?.inherited ||
    item?.layerType === "inherited" ||
    item?.properties?.layerType === "inherited" ||
    (layer?.mode && layer.mode !== DIRECT_LAYER)
  );

export const inheritedMapLabel = (item, layer = {}) => {
  const props = item?.properties || item || {};
  const fromName = props.inheritedFromName || props.sourceNodeName;
  const fromCmid = props.inheritedFromCMID || props.sourceNodeCMID;
  const relationship = props.inheritanceRelationship || layer?.relationship;
  if (!fromName && !fromCmid) return layer?.label || "Inherited locations";
  const from = fromName && fromCmid ? `${fromName} (${fromCmid})` : fromName || fromCmid;
  return relationship ? `Inherited from ${from} via ${relationship}` : `Inherited from ${from}`;
};

export const getPointTooltipLines = (point, layer = {}) => {
  const cmname = point?.CMName || point?.sourceNodeName || point?.inheritedFromName || "Unknown";
  const cmid = point?.CMID || point?.sourceNodeCMID || point?.inheritedFromCMID || "Unknown";
  const lines = [`CMName: ${cmname}`, `CMID: ${cmid}`];
  if (isInheritedMapItem(point, layer)) {
    lines.push(inheritedMapLabel(point, layer));
  }
  if (point?.source) {
    lines.push(`Source: ${point.source}`);
  }
  return lines;
};
