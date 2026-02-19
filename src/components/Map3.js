import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import map1 from '../data/all_coords.csv';
import './MapViews.css';

const CanvasMarkers = ({ data }) => {
  return (
    <MarkerClusterGroup>
      {data.map(point => (
        <Marker
          key={`${point.lat}-${point.long}`}
          position={[parseFloat(point.lat), parseFloat(point.long)]}
          eventHandlers={{
            click: () => {
              window.location.replace("https://catmapper.org/sociomap/" + point.CMID);
            },
          }}
        >
          <Tooltip direction="top" offset={[0, -20]} opacity={1}>
            <div>
              <strong>{point.CMName}</strong><br />
            </div>
          </Tooltip>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
};

const Sociomap_3 = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // let parsedData = parseCsvData(map1);
    let parsedData = map1.filter(row => row.group === "DISTRICT")
    console.log(parsedData)
    setData(parsedData);
  }, []);

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

export default Sociomap_3;
