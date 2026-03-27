import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Tooltip } from 'react-leaflet';
import map1 from '../data/m1.csv';
import { getPointLabel, parseCoord } from './leafletIcons';
import './MapViews.css';

const parseCsvData = (csvString) => {
  const lines = csvString.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = values[index];
    });
    return entry;
  });
};

const Sociomap_1 = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const parsedData = parseCsvData(map1);
    setData(parsedData);
  }, []);

  return (
    <MapContainer center={[20, 0]} zoom={2} className="map-view">
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.webp"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {data.map((point, index) => (
        (() => {
          const lat = parseCoord(point.lat);
          const lng = parseCoord(point.long);
          const count = Number.parseFloat(point.count);
          if (lat === null || lng === null || !Number.isFinite(count)) {
            return null;
          }
          const label = getPointLabel(point);
          return (
            <Circle
              key={`${label}-${index}`}
              center={[lat, lng]}
              radius={count * 1000}
              fillColor="red"
              color="red"
              fillOpacity={0.5}
            >
              <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                <div>
                  <strong>{label}</strong><br />
                  Count: {count}
                </div>
              </Tooltip>
            </Circle>
          );
        })()
      ))}
    </MapContainer>
  );
};

export default Sociomap_1;
