import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const Legend = ({ sources }) => {
  const map = useMap();

  useEffect(() => {
    const colorMap = {};

    sources.forEach((value, index) => {
      const color = `#${(index * 100 + 255).toString(16).substring(0, 6)}`;
      colorMap[value] = color;
    });

    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'legend');
      div.innerHTML += '<h4>Legend</h4>';
      div.innerHTML += '<ul>';
      sources.forEach((source) => {
        const color = colorMap[source];
        div.innerHTML += `<li><span style="background-color: ${color}; width: 12px; height: 12px; display: inline-block; margin-right: 8px;"></span>${source}</li>`;
      });
      div.innerHTML += '</ul>';
      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map, sources]);

  return null;
};

export default Legend;
