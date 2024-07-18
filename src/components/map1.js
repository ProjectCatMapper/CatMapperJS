import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import map1 from '../data/m1.csv';

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
        <MapContainer center={[20, 0]} zoom={2} style={{ height: "80vh" , width: "90vw", marginLeft:"5vw",marginTop:"5vh" }}>
     <TileLayer
       url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
       attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
     />
     {data.map((point, index) => (
          <Circle
            key={index}
            center={[parseFloat(point.lat), parseFloat(point.long)]}
            radius={point.count * 1000} // Adjust the multiplier as needed
            fillColor="red"
            color="red"
            fillOpacity={0.5}
          >
            <Popup>
              <div>
                <strong>{point.country}</strong><br />
                Count: {point.count}
              </div>
            </Popup>
          </Circle>
        ))}
   </MapContainer>
      );
};

export default Sociomap_1;