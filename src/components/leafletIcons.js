import L from "leaflet";

const markerIcon2x = "/leaflet/marker-icon-2x.png";
const markerIcon = "/leaflet/marker-icon.png";
const markerShadow = "/leaflet/marker-shadow.png";

let configured = false;
let defaultIcon = null;

export function ensureLeafletMarkerIcons() {
  if (!defaultIcon) {
    defaultIcon = L.icon({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });
  }

  if (configured) {
    return;
  }

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: defaultIcon.options.iconRetinaUrl,
    iconUrl: defaultIcon.options.iconUrl,
    shadowUrl: defaultIcon.options.shadowUrl,
  });

  configured = true;
}

export function getLeafletDefaultIcon() {
  ensureLeafletMarkerIcons();
  return defaultIcon;
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
