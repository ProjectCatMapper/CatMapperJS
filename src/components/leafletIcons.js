import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let configured = false;

export function ensureLeafletMarkerIcons() {
  if (configured) {
    return;
  }

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });

  configured = true;
}

export function getPointLabel(point = {}) {
  const candidates = [
    point.CMName,
    point.cmname,
    point.Name,
    point.name,
    point.country,
    point.CMID,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "Unknown";
}

export function parseCoord(value) {
  const num = Number.parseFloat(value);
  return Number.isFinite(num) ? num : null;
}
