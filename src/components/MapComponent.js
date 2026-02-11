import { useEffect, useRef } from "react";
import L from "leaflet";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import "leaflet/dist/leaflet.css";
import "@changey/react-leaflet-markercluster/dist/styles.min.css";

import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { Map } from 'react-map-gl';
import maplibregl from "maplibre-gl";

import Legend from "./Legend";

const LeafletMap = ({ points, mapt, sources, sourceColorMap, stringToColor }) => {
  const mapRef = useRef();

  function SetViewToDataBounds({ points, polygons }) {
    const map = useMap();

    useEffect(() => {
      let bounds = new L.LatLngBounds();

      if (polygons) {
        const polygonBounds = L.geoJSON(polygons).getBounds();
        bounds.extend(polygonBounds);
      }
      if (points && points.length > 0) {
        points.forEach((point) => {
          if (point.cood && point.cood.length === 2) {
            bounds.extend(L.latLng(point.cood[1], point.cood[0]));
          }
        });
      }
      if (bounds.isValid()) {
        map.fitBounds(bounds, { maxZoom: 7 });
      }
    }, [points, polygons, map]);

    return null;
  }

  const onEachFeature = (feature, layer) => {
    layer.bindTooltip(`Source: ${feature.source}`, {
      permanent: false,
      direction: "top",
    });
  };

  const getFeatureStyle = (feature) => {
    const category = feature.geometry.source;

    return {
      fillColor: sourceColorMap[category] || "gray",
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "0",
      fillOpacity: 0.3,
    };
  };

  return (
    <MapContainer
      center={[0, 0]}
      zoom={5}
      scrollWheelZoom={true}
      style={{ height: "100%" }}
      ref={mapRef}
    >
      <SetViewToDataBounds points={points} polygons={mapt} />
      <GeoJSON data={mapt} style={getFeatureStyle} onEachFeature={onEachFeature} />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.webp"
        attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
      />
      {points.length !== 0 ? (
        <MarkerClusterGroup>
          {points
            .filter(
              (point) =>
                Array.isArray(point.cood) &&
                point.cood.length === 2 &&
                !isNaN(point.cood[0]) &&
                !isNaN(point.cood[1]) &&
                point.cood[1] >= -90 &&
                point.cood[1] <= 90 &&
                point.cood[0] >= -180 &&
                point.cood[0] <= 180
            )
            .map((point, index) => (
              <CircleMarker
                key={index}
                center={[point.cood[1], point.cood[0]]} // swapped lat, lng correctly here
                radius={10}
                color={stringToColor(point.source)}
                fillColor={stringToColor(point.source)}
                fillOpacity={0.5}
              >
                <Tooltip>{point.source}</Tooltip>
              </CircleMarker>
            ))}
        </MarkerClusterGroup>
      ) : (
        points
      )}
      <Legend sources={Object.keys(sourceColorMap)} colors={Object.values(sourceColorMap)} />
    </MapContainer>
  );
};

const DeckGlMap = ({ points }) => {

  const data = points.map((p) => {
    let position = p.cood;
    if (position == null && Array.isArray(p.geometry) && p.geometry.length > 0) {
      const geom = JSON.parse(p.geometry[0]);
      position = geom.coordinates;
    }
    return {
      position,
      source: p.source,
    };
  });


  const longitudes = data.map((d) => d.position[0]).filter((x) => typeof x === 'number');
  const latitudes = data.map((d) => d.position[1]).filter((x) => typeof x === 'number');

  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);

  // console.log("Min lng " +minLng)
  // console.log("Max lng " +maxLng)
  // console.log("Min lat " +minLat)
  // console.log("Max lat " +maxLat)

  const centerLng = (minLng + maxLng) / 2;
  const centerLat = (minLat + maxLat) / 2;
  // const padding = 0.1;

  // console.log("Center lng " +centerLng)
  // console.log("Center lat " +centerLat)

  const initialViewState = {
    longitude: centerLng,
    latitude: centerLat,
    zoom: 1,
    pitch: 0,
    bearing: 0,
  };

  const scatterLayer = new ScatterplotLayer({
    id: "scatter-layer",
    data,
    pickable: true,
    opacity: 0.8,
    stroked: false,
    filled: true,
    radiusScale: 10,
    radiusMinPixels: 3,
    getPosition: (d) => d.position,
    getFillColor: [0, 128, 255],
    getRadius: 10,
  });

  return (
    <DeckGL initialViewState={initialViewState} controller={true} layers={[scatterLayer]} getTooltip={({ object }) => object ? { text: `Entity: ${object.source}` } : null} style={{ width: "100%", height: "100%", overflow: 'hidden' }}>
      <Map
        mapLib={maplibregl}
        reuseMaps
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      />
    </DeckGL>
  );
};

const MapComponent = ({ points, mapt, sources }) => {
  // Color map and stringToColor utility for Leaflet mode
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).slice(-2);
    }
    return color;
  };

  // Build source-color map for Leaflet only
  const sourceColorMap = {};
  if (points.length <= 300) {
    sources.forEach((source) => {
      if (!sourceColorMap[source]) {
        sourceColorMap[source] = stringToColor(source);
      }
    });
  }

  if (points.length > 300) {
    // Large data: use deck.gl map without legend or colors
    return <DeckGlMap points={points} />;
  }

  console.log(points)

  // Small data: use Leaflet map with colors and legend
  return <LeafletMap points={points} mapt={mapt} sources={sources} sourceColorMap={sourceColorMap} stringToColor={stringToColor} />;
};

export default MapComponent;
