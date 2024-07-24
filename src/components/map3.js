import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import map1 from '../data/all_coords.csv';

  const CanvasMarkers = ({data}) => {
    return (
      <MarkerClusterGroup>
      {data.map(point => (
        <Marker
        position={[parseFloat(point.lat), parseFloat(point.long)]}
        eventHandlers={{
          click: () => {
            window.location.href = "https://catmapper.org/js/sociomap/"+point.CMID; 
          },
        }}
      >
        <Popup>
          <div>
            <strong>{point.CMName}</strong><br />
          </div>
        </Popup>
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
    <MapContainer center={[20, 0]} zoom={2} style={{ height: "80vh", width: "90vw", marginLeft:"5vw", marginTop:"5vh" }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
            <CanvasMarkers data={data} />
    </MapContainer>
  );
};

export default Sociomap_3;
