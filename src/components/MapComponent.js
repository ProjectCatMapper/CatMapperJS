import { useEffect, useMemo, useRef } from "react";
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
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import { Map } from "react-map-gl";
import maplibregl from "maplibre-gl";

import Legend from "./Legend";
import {
  getPointTooltipLines,
  inheritedMapLabel,
  isInheritedMapItem,
} from "./mapPointTooltip";
import {
  buildDeckPolygonData,
  DECK_POINT_RADIUS_MIN_PIXELS,
  getDeckPolygonLayerMeta,
  getDeckPolygonTooltip,
  getFeatureSource,
  getPolygonFeatures,
  hexToRgba,
} from "./mapDeckLayers";

const DIRECT_LAYER = "direct";

const polygonFeatureCount = (polygons) => {
  if (!polygons) return 0;
  if (Array.isArray(polygons)) return polygons.length;
  if (Array.isArray(polygons.features)) return polygons.features.length;
  return polygons.type ? 1 : 0;
};

const normalizeLayers = ({ points = [], mapt = [], sources = [], layers }) => {
  if (Array.isArray(layers) && layers.length > 0) {
    return layers
      .map((layer, index) => ({
        id: layer.id || `layer-${index}`,
        label: layer.label || layer.id || `Layer ${index + 1}`,
        mode: layer.mode || DIRECT_LAYER,
        relationship: layer.relationship,
        points: Array.isArray(layer.points) ? layer.points : [],
        polygons: layer.polygons || [],
        sources: Array.isArray(layer.sources) ? layer.sources : [],
      }))
      .filter((layer) => layer.points.length > 0 || polygonFeatureCount(layer.polygons) > 0);
  }

  return [
    {
      id: DIRECT_LAYER,
      label: "Direct locations",
      mode: DIRECT_LAYER,
      points: Array.isArray(points) ? points : [],
      polygons: mapt || [],
      sources: Array.isArray(sources) ? sources : [],
    },
  ].filter((layer) => layer.points.length > 0 || polygonFeatureCount(layer.polygons) > 0);
};

const isInherited = (featureOrPoint, layer) =>
  isInheritedMapItem(featureOrPoint, layer);

const inheritedLabel = (item, layer) => {
  return inheritedMapLabel(item, layer);
};

const pointPosition = (point) => {
  if (Array.isArray(point?.cood) && point.cood.length === 2) return point.cood;
  if (Array.isArray(point?.geometry) && point.geometry.length > 0) {
    try {
      return JSON.parse(point.geometry[0]).coordinates;
    } catch (_error) {
      return null;
    }
  }
  return null;
};

const isValidPosition = (position) =>
  Array.isArray(position) &&
  position.length === 2 &&
  !Number.isNaN(position[0]) &&
  !Number.isNaN(position[1]) &&
  position[1] >= -90 &&
  position[1] <= 90 &&
  position[0] >= -180 &&
  position[0] <= 180;

const LeafletMap = ({ layers, sourceColorMap, stringToColor }) => {
  const mapRef = useRef();
  const allPoints = useMemo(
    () =>
      layers.flatMap((layer) =>
        layer.points.map((point) => ({
          ...point,
          layerId: layer.id,
          layerLabel: layer.label,
          layerMode: layer.mode,
        }))
      ),
    [layers]
  );

  function SetViewToDataBounds({ mapLayers }) {
    const map = useMap();

    useEffect(() => {
      const bounds = new L.LatLngBounds();

      mapLayers.forEach((layer) => {
        if (polygonFeatureCount(layer.polygons) > 0) {
          try {
            const polygonBounds = L.geoJSON(layer.polygons).getBounds();
            if (polygonBounds.isValid()) bounds.extend(polygonBounds);
          } catch (_error) {
            // Ignore malformed features; point bounds can still position the map.
          }
        }

        layer.points.forEach((point) => {
          const position = pointPosition(point);
          if (isValidPosition(position)) {
            bounds.extend(L.latLng(position[1], position[0]));
          }
        });
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { maxZoom: 7 });
      }
    }, [mapLayers, map]);

    return null;
  }

  const bindFeatureTooltip = (layerMeta) => (feature, leafletLayer) => {
    const source = getFeatureSource(feature);
    const tooltip = isInherited(feature, layerMeta)
      ? `${inheritedLabel(feature, layerMeta)}\nSource: ${source}`
      : `Source: ${source}`;
    leafletLayer.bindTooltip(tooltip, {
      permanent: false,
      direction: "top",
    });
  };

  const getFeatureStyle = (layerMeta) => (feature) => {
    const source = getFeatureSource(feature);
    const inherited = isInherited(feature, layerMeta);
    const color = sourceColorMap[source] || stringToColor(source);

    return {
      fillColor: color,
      weight: inherited ? 2 : 2,
      opacity: inherited ? 0.8 : 1,
      color: inherited ? color : "white",
      dashArray: inherited ? "6 4" : "0",
      fillOpacity: inherited ? 0.16 : 0.3,
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
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.webp"
        attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
      />
      <SetViewToDataBounds mapLayers={layers} />
      {layers.map((layer) =>
        polygonFeatureCount(layer.polygons) > 0 ? (
          <GeoJSON
            key={`${layer.id}-${polygonFeatureCount(layer.polygons)}`}
            data={layer.polygons}
            style={getFeatureStyle(layer)}
            onEachFeature={bindFeatureTooltip(layer)}
          />
        ) : null
      )}
      {allPoints.length !== 0 ? (
        <MarkerClusterGroup>
          {allPoints
            .map((point, index) => ({ point, index, position: pointPosition(point) }))
            .filter(({ position }) => isValidPosition(position))
            .map(({ point, index, position }) => {
              const inherited = isInherited(point, { mode: point.layerMode });
              const color = stringToColor(point.source);
              const tooltipLines = getPointTooltipLines(point, {
                mode: point.layerMode,
                relationship: point.inheritanceRelationship,
              });
              return (
                <CircleMarker
                  key={`${point.layerId || DIRECT_LAYER}-${point.sourceNodeCMID || point.source || "point"}-${index}`}
                  center={[position[1], position[0]]}
                  radius={inherited ? 7 : 10}
                  color={color}
                  fillColor={color}
                  fillOpacity={inherited ? 0.22 : 0.5}
                  opacity={inherited ? 0.85 : 1}
                  dashArray={inherited ? "4 3" : undefined}
                >
                  <Tooltip>
                    {tooltipLines.map((line) => <div key={line}>{line}</div>)}
                  </Tooltip>
                </CircleMarker>
              );
            })}
        </MarkerClusterGroup>
      ) : null}
      <Legend sources={Object.keys(sourceColorMap)} colors={Object.values(sourceColorMap)} />
    </MapContainer>
  );
};

const DeckGlMap = ({ points, layers, sourceColorMap, stringToColor }) => {
  const data = points
    .map((point) => ({
      ...point,
      position: pointPosition(point),
    }))
    .filter((item) => isValidPosition(item.position));

  if (data.length === 0) {
    return null;
  }

  const longitudes = data.map((d) => d.position[0]);
  const latitudes = data.map((d) => d.position[1]);

  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);

  const initialViewState = {
    longitude: (minLng + maxLng) / 2,
    latitude: (minLat + maxLat) / 2,
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
    radiusMinPixels: DECK_POINT_RADIUS_MIN_PIXELS,
    getPosition: (d) => d.position,
    getFillColor: (point) => hexToRgba(
      sourceColorMap[point.source] || stringToColor(point.source)
    ),
    getRadius: 10,
  });

  const polygonData = buildDeckPolygonData(layers);
  const polygonLayer = polygonData.length > 0
    ? new GeoJsonLayer({
      id: "polygon-layer",
      data: {
        type: "FeatureCollection",
        features: polygonData,
      },
      pickable: true,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 1,
      getFillColor: (feature) => {
        const source = getFeatureSource(feature);
        const color = sourceColorMap[source] || stringToColor(source);
        const inherited = isInherited(feature, getDeckPolygonLayerMeta(feature));
        return hexToRgba(color, inherited ? 41 : 77);
      },
      getLineColor: (feature) => {
        const source = getFeatureSource(feature);
        const color = sourceColorMap[source] || stringToColor(source);
        return hexToRgba(color, 230);
      },
      getLineWidth: 2,
    })
    : null;

  return (
    <DeckGL
      initialViewState={initialViewState}
      controller={true}
      layers={[polygonLayer, scatterLayer].filter(Boolean)}
      getTooltip={({ object }) => {
        if (!object) return null;
        return {
          text: object?.properties?.__mapLayerId
            ? getDeckPolygonTooltip(object)
            : getPointTooltipLines(object).join("\n"),
        };
      }}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    >
      <Map
        mapLib={maplibregl}
        reuseMaps
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      />
    </DeckGL>
  );
};

const MapComponent = ({ points = [], mapt = [], sources = [], layers = null }) => {
  const renderLayers = useMemo(
    () => normalizeLayers({ points, mapt, sources, layers }),
    [points, mapt, sources, layers]
  );

  const allPoints = useMemo(
    () => renderLayers.flatMap((layer) => layer.points),
    [renderLayers]
  );

  const allSources = useMemo(() => {
    const sourceSet = new Set();
    renderLayers.forEach((layer) => {
      layer.sources.forEach((source) => sourceSet.add(source));
      layer.points.forEach((point) => {
        if (point.source) sourceSet.add(point.source);
      });
      getPolygonFeatures(layer.polygons).forEach((feature) => {
        sourceSet.add(getFeatureSource(feature));
      });
    });
    return [...sourceSet].filter(Boolean);
  }, [renderLayers]);

  const stringToColor = (value) => {
    const str = String(value || "Unknown");
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const channel = (hash >> (i * 8)) & 0xff;
      color += (`00${channel.toString(16)}`).slice(-2);
    }
    return color;
  };

  const sourceColorMap = {};
  allSources.forEach((source) => {
    if (!sourceColorMap[source]) {
      sourceColorMap[source] = stringToColor(source);
    }
  });

  if (allPoints.length > 300) {
    return (
      <DeckGlMap
        points={allPoints}
        layers={renderLayers}
        sourceColorMap={sourceColorMap}
        stringToColor={stringToColor}
      />
    );
  }

  return (
    <LeafletMap
      layers={renderLayers}
      sourceColorMap={sourceColorMap}
      stringToColor={stringToColor}
    />
  );
};

export default MapComponent;
