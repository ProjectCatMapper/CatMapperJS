import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const Legend = ({ sources, colors }) => {
  const map = useMap();

  useEffect(() => {
    const colorMap = {};

    sources.forEach((source, index) => {
      colorMap[source] = colors[index];
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
  }, [map, sources, colors]);

  return null;
};

export default Legend;
