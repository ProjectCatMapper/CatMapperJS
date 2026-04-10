import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import CircularProgress from '@mui/material/CircularProgress';
import { Box, Typography } from '@mui/material';
import { fetchMapGroupData } from '../utils/mapGroupData';
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

const MapLoadingState = ({ message }) => (
  <Box
    sx={{
      height: '100%',
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1.5,
      color: 'text.secondary',
    }}
  >
    <CircularProgress size={28} />
    <Typography variant="body2">{message}</Typography>
  </Box>
);

const GroupMarkerMap = ({ assetPath }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const points = await fetchMapGroupData(assetPath);
        if (active) {
          setData(points);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || 'Unable to load map data.');
          setData([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    ensureLeafletMarkerIcons();
    void loadData();

    return () => {
      active = false;
    };
  }, [assetPath]);

  if (loading) {
    return <MapLoadingState message="Loading map data..." />;
  }

  if (error) {
    return <MapLoadingState message={error} />;
  }

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

export default GroupMarkerMap;
