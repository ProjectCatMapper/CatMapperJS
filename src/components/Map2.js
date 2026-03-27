import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import map1 from '../data/all_coords.csv';
import { ensureLeafletMarkerIcons, getLeafletDefaultIcon, getPointLabel, parseCoord } from './leafletIcons';
import './MapViews.css';

const CanvasMarkers = ({ data }) => {
  const markerIcon = getLeafletDefaultIcon();
  return (
    <MarkerClusterGroup>
      {data.map((point, index) => {
        const lat = parseCoord(point.lat);
        const lng = parseCoord(point.long);
        if (lat === null || lng === null) {
          return null;
        }
        const label = getPointLabel(point);
        return (
          <Marker
            key={`${point.CMID || 'unknown'}-${index}`}
            position={[lat, lng]}
            icon={markerIcon}
            title={label}
            eventHandlers={{
              click: () => {
                window.location.replace(`https://catmapper.org/sociomap/${encodeURIComponent(point.CMID || "")}`);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -20]} opacity={1}>
              <div>
                <strong>{label}</strong><br />
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </MarkerClusterGroup>
  );
};

const Sociomap_2 = () => {
  ensureLeafletMarkerIcons();

  const data = useMemo(() => map1.filter((row) => row.group === "LANGUAGE"), []);

  return (
    <MapContainer center={[20, 0]} zoom={2} className="map-view">
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.webp"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <CanvasMarkers data={data} />
    </MapContainer>
  );
};

export default Sociomap_2;
