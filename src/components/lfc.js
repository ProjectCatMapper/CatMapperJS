import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-canvas-marker'; // Ensure this plugin is correctly imported

const LeafletCanvasMarker = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !data) return;

    // Initialize the canvas layer
    const ciLayer = L.canvasIconLayer({}).addTo(map);

    // Add event listeners
    ciLayer.addOnClickListener((e, marker) => {
      const { data } = marker;
      if (data && data.CMID) {
        window.location.href = `https://catmapper.org/js/sociomap/${data.CMID}`;
      }
    });

    ciLayer.addOnHoverListener((e, data) => {
      console.log(data[0].data._leaflet_id);
    });

    // Define icon
    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconSize: [20, 18],
      iconAnchor: [10, 9],
    });

    // Create markers based on data
    const markers = data.map(point => {
      return L.marker(
        [parseFloat(point.lat), parseFloat(point.long)],
        { icon, data: point } // Attach data to the marker
      ).bindPopup(`I Am ${point.CMID}`);
    });

    // Add markers to the canvas layer
    ciLayer.addLayers(markers);

    // Cleanup on component unmount
    return () => {
      map.removeLayer(ciLayer);
    };
  }, [map, data]);

  return null;
};

export default LeafletCanvasMarker;
