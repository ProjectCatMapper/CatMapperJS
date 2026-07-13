import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import {
  applyPolygonGeoJson,
  cancelUploadInputNodes,
  discardPolygonGeoJson,
  getUploadInputNodesStatus,
  preflightPolygonGeoJson,
} from '../api/editUploadApi';


const terminalStatuses = new Set(['completed', 'failed', 'canceled']);

const databaseDisplayName = (database) => {
  const normalized = String(database || '').trim().toLowerCase();
  if (normalized === 'archamap') return 'ArchaMap';
  if (normalized === 'sociomap') return 'SocioMap';
  return String(database || 'the selected database');
};

const PolygonGeoJsonUpload = ({ database, cred, user }) => {
  const displayDatabase = databaseDisplayName(database);
  const [file, setFile] = useState(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [preflight, setPreflight] = useState(null);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [task, setTask] = useState(null);
  const [cursor, setCursor] = useState(0);
  const [events, setEvents] = useState([]);
  const pollRef = useRef(null);

  const clearPoll = () => {
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => () => clearPoll(), []);

  const resetPreflight = async () => {
    clearPoll();
    if (preflight?.token) {
      try {
        await discardPolygonGeoJson({ cred, token: preflight.token });
      } catch (_error) {
        // Tokens expire and server cleanup is authoritative.
      }
    }
    setPreflight(null);
    setTask(null);
    setCursor(0);
    setEvents([]);
    setErrors([]);
    setMessage('');
  };

  const handleFileChange = async (event) => {
    await resetPreflight();
    setFile(event.target.files?.[0] || null);
  };

  const handlePreflight = async () => {
    if (!file) return;
    setBusy(true);
    setErrors([]);
    setMessage('');
    setPreflight(null);
    try {
      const response = await preflightPolygonGeoJson({
        cred,
        database,
        file,
        replaceExisting,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrors(Array.isArray(payload.error_details) ? payload.error_details : []);
        setMessage(payload.error || 'Polygon preflight failed.');
        return;
      }
      setPreflight(payload);
      setMessage(`Preflight passed for ${payload.featureCount} feature(s).`);
    } catch (_error) {
      setMessage('Unable to run polygon preflight.');
    } finally {
      setBusy(false);
    }
  };

  const pollTask = (taskId, nextCursor = 0) => {
    clearPoll();
    pollRef.current = setTimeout(async () => {
      try {
        const response = await getUploadInputNodesStatus({
          cred,
          taskId,
          user,
          cursor: nextCursor,
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          setMessage(payload.error || 'Unable to read polygon upload status.');
          return;
        }
        setTask(payload);
        const incomingEvents = Array.isArray(payload.events) ? payload.events : [];
        if (incomingEvents.length) setEvents((current) => [...current, ...incomingEvents]);
        const updatedCursor = Number(payload.nextCursor ?? nextCursor);
        setCursor(updatedCursor);
        const status = String(payload.status || '').toLowerCase();
        if (!terminalStatuses.has(status)) {
          pollTask(taskId, updatedCursor);
        } else {
          setBusy(false);
          setMessage(payload.message || payload.error || `Polygon upload ${status}.`);
          if (Array.isArray(payload.error_details)) setErrors(payload.error_details);
        }
      } catch (_error) {
        setBusy(false);
        setMessage('Unable to read polygon upload status.');
      }
    }, 500);
  };

  const handleApply = async () => {
    if (!preflight?.token) return;
    setBusy(true);
    setErrors([]);
    setMessage('Queueing polygon upload...');
    try {
      const response = await applyPolygonGeoJson({ cred, token: preflight.token });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setBusy(false);
        setErrors(Array.isArray(payload.error_details) ? payload.error_details : []);
        setMessage(payload.error || 'Unable to queue polygon upload.');
        return;
      }
      setTask(payload);
      pollTask(payload.taskId, 0);
    } catch (_error) {
      setBusy(false);
      setMessage('Unable to queue polygon upload.');
    }
  };

  const handleCancel = async () => {
    if (!task?.taskId) return;
    await cancelUploadInputNodes({ cred, taskId: task.taskId, user, cursor });
    setMessage('Cancellation requested.');
  };

  const status = String(task?.status || '').toLowerCase();
  const percent = Math.max(0, Math.min(100, Number(task?.progress?.percent || 0)));

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 4 }} data-testid="polygon-geojson-upload">
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black', mb: 1 }}>
        Polygon GeoJSON upload
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Upload a FeatureCollection containing Polygon or MultiPolygon geometry. Every feature must have
        CMID, Key, and datasetID properties that identify one existing USES tie in {displayDatabase}.
      </Typography>
      <input
        aria-label="Polygon GeoJSON file"
        type="file"
        accept=".geojson,.json,application/geo+json,application/json"
        onChange={handleFileChange}
        disabled={busy}
      />
      <Box sx={{ mt: 1 }}>
        <FormControlLabel
          control={(
            <Checkbox
              checked={replaceExisting}
              onChange={async (event) => {
                await resetPreflight();
                setReplaceExisting(event.target.checked);
              }}
              disabled={busy}
            />
          )}
          label="Replace existing geoPolygon references"
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Button variant="outlined" onClick={handlePreflight} disabled={!file || busy}>
          Validate GeoJSON
        </Button>
        <Button variant="contained" onClick={handleApply} disabled={!preflight?.valid || busy}>
          Apply Polygon Upload
        </Button>
        {task?.taskId && !terminalStatuses.has(status) && (
          <Button variant="outlined" color="error" onClick={handleCancel}>Cancel</Button>
        )}
      </Box>

      {preflight?.valid && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {preflight.featureCount} features, {preflight.coordinateCount} coordinates,
          {' '}{preflight.newGeometryCount} new geometries, and {preflight.existingPolygonCount} replacements.
        </Alert>
      )}
      {message && <Alert severity={errors.length ? 'error' : 'info'} sx={{ mt: 2 }}>{message}</Alert>}
      {task && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={percent} />
          <Typography variant="caption">{percent}% — {status || 'queued'}</Typography>
          {events.length > 0 && (
            <Box sx={{ mt: 1, p: 1, bgcolor: '#fafafa', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {events.join('\n')}
            </Box>
          )}
        </Box>
      )}
      {errors.length > 0 && (
        <TableContainer sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Feature</TableCell><TableCell>Field</TableCell><TableCell>Error</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {errors.map((error, index) => (
                <TableRow key={`${error.feature}-${error.field}-${error.code}-${index}`}>
                  <TableCell>{error.feature ?? 'File'}</TableCell>
                  <TableCell>{error.field || ''}</TableCell>
                  <TableCell>{error.message || error.code}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default PolygonGeoJsonUpload;
