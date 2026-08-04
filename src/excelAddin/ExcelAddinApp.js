import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  Link,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import TranslateIcon from '@mui/icons-material/Translate';
import {
  applyCandidateChoice,
  captureSelectedColumn,
  disposeSubscriptions,
  loadPersistedRuns,
  subscribeToSelection,
  writeTranslationRun,
} from './workbookService';
import {
  buildTranslationPayload,
  deriveOutputFields,
  describeCandidate,
  groupCandidatesByRow,
  normalizeSelectionMatrix,
} from './translationModel';
import {
  cancelTranslation,
  fetchTranslationDomains,
  pollTranslation,
  startTranslation,
} from './apiClient';

const DATABASES = ['ArchaMap', 'SocioMap'];
const MATCH_PROPERTIES = [
  { value: 'Name', label: 'Name' },
  { value: 'Key', label: 'Dataset key' },
  { value: 'CMID', label: 'CatMapper ID (CMID)' },
];

const newRunId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `run-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const formatError = (error) => {
  if (error?.name === 'AbortError') return 'Translation canceled.';
  if (error?.status === 404) {
    return 'The CatMapper task expired or the server restarted. Run the translation again.';
  }
  return error?.message || String(error || 'An unexpected error occurred.');
};

const getMappedColumn = (selection, header) => {
  if (!header) return undefined;
  const column = (selection?.availableColumns || []).find((item) => item.header === header);
  return column ? { header: column.header, values: column.values } : undefined;
};

const toCandidateMap = (groups) => Object.fromEntries(groups.map((group) => [
  group.rowId,
  group.candidates.length
    ? group.candidates
    : (group.noMatchRow ? [group.noMatchRow] : []),
]));

const databasePath = (database, cmid = '') => {
  const normalized = String(database || '').trim().toLowerCase();
  if (normalized === 'sociomap' || String(cmid).startsWith('SM')) return 'sociomap';
  if (normalized === 'archamap' || String(cmid).startsWith('AM')) return 'archamap';
  return normalized || 'archamap';
};

const nodeUrl = (database, cmid) =>
  `https://catmapper.org/${databasePath(database, cmid)}/${encodeURIComponent(String(cmid || ''))}`;

const CandidateCard = ({ candidate, index, selected, disabled, database, onSelect }) => {
  const summary = describeCandidate(candidate);
  const hasMatch = Boolean(summary.cmid || summary.name);
  return (
    <Card className="cm-candidate-card" variant="outlined" aria-current={selected ? 'true' : 'false'}>
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {hasMatch ? (summary.name || summary.cmid) : 'No match'}
        </Typography>
        {summary.cmid && (
          <Typography variant="body2">
            CMID:{' '}
            <Link href={nodeUrl(database, summary.cmid)} target="_blank" rel="noopener noreferrer">
              {summary.cmid}
            </Link>
          </Typography>
        )}
        {summary.domain && <Typography variant="body2">Domain: {summary.domain}</Typography>}
        {summary.matchedTerm && <Typography variant="body2">Matched: {summary.matchedTerm}</Typography>}
        {summary.distance !== '' && <Typography variant="body2">Distance: {summary.distance}</Typography>}
        {summary.country && <Typography variant="body2">Country: {summary.country}</Typography>}
        {summary.key && <Typography variant="body2">Key: {summary.key}</Typography>}
      </CardContent>
      {hasMatch && (
        <CardActions>
          <Button
            size="small"
            variant={selected ? 'contained' : 'outlined'}
            disabled={disabled}
            onClick={() => onSelect(index)}
          >
            Use this match
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export const getAlternativeMatchState = (match) => {
  if (!match) return 'none-selected';
  if (Array.isArray(match.candidates) && match.candidates.length > 0) {
    return match.selectedIndex >= 0 ? 'selected-match' : 'multiple-unselected';
  }
  return 'no-match';
};

const ExcelAddinApp = () => {
  const [officeReady, setOfficeReady] = useState(false);
  const [selection, setSelection] = useState(null);
  const [database, setDatabase] = useState('ArchaMap');
  const [property, setProperty] = useState('Name');
  const [domain, setDomain] = useState('ANY DOMAIN');
  const [domainGroups, setDomainGroups] = useState([]);
  const [includeKey, setIncludeKey] = useState(false);
  const [countryColumn, setCountryColumn] = useState('');
  const [contextColumn, setContextColumn] = useState('');
  const [datasetColumn, setDatasetColumn] = useState('');
  const [yearStart, setYearStart] = useState('');
  const [yearEnd, setYearEnd] = useState('');
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [running, setRunning] = useState(false);
  const [taskId, setTaskId] = useState('');
  const [progress, setProgress] = useState({ percent: 0, message: '', elapsedSeconds: 0 });
  const [notice, setNotice] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [activeMatch, setActiveMatch] = useState(null);
  const [savingChoice, setSavingChoice] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const abortRef = useRef(null);
  const confirmationResolverRef = useRef(null);

  const columnOptions = selection?.availableColumns || [];

  const requestBlockChoice = useCallback((message) => new Promise((resolve) => {
    confirmationResolverRef.current = resolve;
    setConfirmation({ message });
  }), []);

  const resolveBlockChoice = useCallback((choice) => {
    const resolver = confirmationResolverRef.current;
    confirmationResolverRef.current = null;
    setConfirmation(null);
    if (resolver) resolver(choice);
  }, []);

  const flattenedDomains = useMemo(() => {
    const seen = new Set();
    return domainGroups.flatMap((group) => [
      ...(group?.group ? [{ group: group.group, value: group.group }] : []),
      ...(group?.nodes || []).map((node) => ({ group: group.group, value: node })),
    ]).filter((item) => {
      if (seen.has(item.value)) return false;
      seen.add(item.value);
      return true;
    });
  }, [domainGroups]);

  const refreshSelection = useCallback(async () => {
    setNotice(null);
    try {
      const captured = await captureSelectedColumn();
      setSelection(captured);
      setCountryColumn('');
      setContextColumn('');
      setDatasetColumn('');
      setNotice({ severity: 'success', text: `Selected ${captured.header} (${captured.rowData.length} data rows).` });
    } catch (error) {
      setSelection(null);
      setNotice({ severity: 'error', text: formatError(error) });
    }
  }, []);

  useEffect(() => {
    let disposed = false;
    const initialize = async () => {
      if (!globalThis.Office?.onReady) {
        setNotice({ severity: 'error', text: 'Open this page from the CatMapper add-in inside Excel.' });
        return;
      }
      try {
        const info = await globalThis.Office.onReady();
        if (disposed) return;
        const excelHost = globalThis.Office?.HostType?.Excel || 'Excel';
        if (info?.host && info.host !== excelHost) {
          throw new Error('This add-in can only run in Microsoft Excel.');
        }
        if (!globalThis.Office.context.requirements.isSetSupported('ExcelApi', '1.7')) {
          throw new Error('This version of Excel does not support ExcelApi 1.7. Update Excel and try again.');
        }
        setOfficeReady(true);
        let metadataWarning = '';
        try {
          await loadPersistedRuns();
        } catch (metadataError) {
          metadataWarning = formatError(metadataError);
        }
        await subscribeToSelection((match) => {
          if (match?.error) {
            setNotice({ severity: 'warning', text: formatError(match.error) });
            return;
          }
          setActiveMatch(match);
        });
        await refreshSelection();
        if (metadataWarning) setNotice({ severity: 'warning', text: metadataWarning });
      } catch (error) {
        if (!disposed) setNotice({ severity: 'error', text: formatError(error) });
      }
    };
    initialize();
    return () => {
      disposed = true;
      abortRef.current?.abort();
      disposeSubscriptions().catch(() => {});
    };
  }, [refreshSelection]);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingDomains(true);
    fetchTranslationDomains(database, controller.signal)
      .then((groups) => {
        setDomainGroups(groups);
        const values = groups.flatMap((group) => [group?.group, ...(group?.nodes || [])]).filter(Boolean);
        setDomain((current) => values.includes(current) ? current : (values[0] || 'ANY DOMAIN'));
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') {
          setNotice({ severity: 'error', text: `Unable to load CatMapper domains: ${formatError(error)}` });
        }
      })
      .finally(() => setLoadingDomains(false));
    return () => controller.abort();
  }, [database]);

  const runTranslation = async () => {
    if (!selection) {
      setNotice({ severity: 'warning', text: 'Select and capture a headed column first.' });
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setWarnings([]);
    setNotice(null);
    setProgress({ percent: 5, message: 'Preparing selected rows…', elapsedSeconds: 0 });

    try {
      const normalized = normalizeSelectionMatrix(selection.values);
      const mappings = {
        country: getMappedColumn(selection, countryColumn),
        context: getMappedColumn(selection, contextColumn),
        dataset: getMappedColumn(selection, datasetColumn),
      };
      const payload = buildTranslationPayload({
        normalizedSelection: normalized,
        database,
        property,
        domain,
        key: includeKey,
        mappings,
        yearStart,
        yearEnd,
      });

      const started = await startTranslation(payload, controller.signal);
      if (!started?.taskId) throw new Error('CatMapper did not return a translation task ID.');
      setTaskId(started.taskId);
      const result = await pollTranslation(started.taskId, {
        signal: controller.signal,
        onProgress: (next) => setProgress({
          percent: Number(next.percent || 0),
          message: next.message || 'Translating…',
          elapsedSeconds: Number(next.elapsedSeconds || 0),
        }),
      });

      const inputFields = [selection.header, ...Object.values(mappings).filter(Boolean).map((item) => item.header)];
      const outputFields = deriveOutputFields(result.order, inputFields);
      if (!outputFields.length) {
        throw new Error('CatMapper returned no generated columns for this selection.');
      }
      const groups = groupCandidatesByRow(result.file || [], normalized.rowCount);
      let persistedRuns = [];
      try {
        persistedRuns = await loadPersistedRuns();
      } catch (metadataError) {
        if (!['MISSING_METADATA', 'DAMAGED_METADATA'].includes(metadataError?.code)) throw metadataError;
      }
      const priorRun = persistedRuns.find((item) =>
        item.worksheetName === selection.worksheetName && item.sourceAddress === selection.address
      );
      let refreshRunId;
      let allowDuplicateSource = false;
      if (priorRun) {
        const choice = await requestBlockChoice(
          'This source column already has a CatMapper translation block. Refresh it with the new results, or create a separate new block next to the source column?'
        );
        if (choice === 'cancel') {
          setNotice({ severity: 'info', text: 'Translation completed, but worksheet output was not changed.' });
          return;
        }
        if (choice === 'refresh') refreshRunId = priorRun.runId;
        if (choice === 'new') allowDuplicateSource = true;
      }

      const runDefinition = {
        runId: refreshRunId || newRunId(),
        refreshRunId,
        allowDuplicateSource,
        selection,
        outputFields,
        rowIds: groups.map((group) => group.rowId),
        candidatesByRow: toCandidateMap(groups),
        selectedIndices: Object.fromEntries(
          groups.map((group) => [group.rowId, group.candidates.length > 1 ? -1 : 0])
        ),
        configuration: {
          database,
          property,
          domain,
          includeKey,
          countryColumn,
          contextColumn,
          datasetColumn,
          yearStart: yearStart || null,
          yearEnd: yearEnd || null,
        },
      };
      let saved;
      try {
        saved = await writeTranslationRun(runDefinition);
      } catch (writeError) {
        if (writeError?.code !== 'EXISTING_TRANSLATION' || !writeError.existingRunId) throw writeError;
        const choice = await requestBlockChoice(
          'Excel found a previously translated block for this source column. Refresh it with the new results, or create a separate new block next to the source column?'
        );
        if (choice === 'cancel') {
          setNotice({ severity: 'info', text: 'Translation completed, but worksheet output was not changed.' });
          return;
        }
        if (choice === 'refresh') {
          refreshRunId = writeError.existingRunId;
          saved = await writeTranslationRun({
            ...runDefinition,
            runId: refreshRunId,
            refreshRunId,
            allowDuplicateSource: false,
          });
        } else {
          refreshRunId = '';
          saved = await writeTranslationRun({
            ...runDefinition,
            refreshRunId: '',
            allowDuplicateSource: true,
          });
        }
      }

      setWarnings(Array.isArray(result.warnings) ? result.warnings : []);
      setProgress({ percent: 100, message: 'Translation complete.', elapsedSeconds: result.elapsedSeconds || 0 });
      setNotice({
        severity: 'success',
        text: `${refreshRunId ? 'Refreshed' : 'Added'} ${saved.outputFields.length} CatMapper columns for ${groups.length} rows.`,
      });
    } catch (error) {
      setNotice({ severity: error?.name === 'AbortError' ? 'info' : 'error', text: formatError(error) });
    } finally {
      abortRef.current = null;
      setTaskId('');
      setRunning(false);
    }
  };

  const cancelCurrentTranslation = async () => {
    const currentTask = taskId;
    abortRef.current?.abort();
    if (currentTask) {
      try {
        await cancelTranslation(currentTask);
      } catch (_error) {
        // The local abort is immediate; failure to notify the server is non-blocking.
      }
    }
  };

  const chooseCandidate = async (candidateIndex) => {
    if (!activeMatch) return;
    setSavingChoice(true);
    try {
      await applyCandidateChoice(activeMatch.runId, activeMatch.rowId, candidateIndex);
      setActiveMatch((current) => current ? { ...current, selectedIndex: candidateIndex } : current);
      setNotice({ severity: 'success', text: 'Updated every CatMapper value for the selected row.' });
    } catch (error) {
      setNotice({ severity: 'error', text: formatError(error) });
    } finally {
      setSavingChoice(false);
    }
  };

  return (
    <Box className="cm-addin-shell">
      <Box className="cm-addin-header">
        <img className="cm-addin-logo" src="/icon-192.png" alt="CatMapper" />
        <Box>
          <Typography component="h1" variant="h1">CatMapper Translation</Typography>
          <Typography variant="body2" color="text.secondary">Translate a selected Excel column</Typography>
        </Box>
      </Box>

      <Stack spacing={2}>
        {notice && <Alert severity={notice.severity} onClose={() => setNotice(null)}>{notice.text}</Alert>}
        {warnings.map((warning) => <Alert key={warning} severity="warning">{warning}</Alert>)}

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography component="h2" variant="h2">1. Selected column</Typography>
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                disabled={!officeReady || running}
                onClick={refreshSelection}
              >
                Use current selection
              </Button>
            </Stack>
            {selection ? (
              <Box>
                <Typography fontWeight={700}>{selection.header}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selection.worksheetName}!{selection.address} · {selection.rowData.length} data rows
                  {selection.table ? ` · Table ${selection.table.name}` : ''}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Highlight one contiguous column, including its header and at least one data value.
              </Typography>
            )}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography component="h2" variant="h2">2. Translation settings</Typography>
            <FormControl fullWidth size="small">
              <InputLabel id="database-label">CatMapper database</InputLabel>
              <Select labelId="database-label" value={database} label="CatMapper database" onChange={(event) => setDatabase(event.target.value)}>
                {DATABASES.map((item) => <MenuItem value={item} key={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="property-label">Match by</InputLabel>
              <Select labelId="property-label" value={property} label="Match by" onChange={(event) => setProperty(event.target.value)}>
                {MATCH_PROPERTIES.map((item) => <MenuItem value={item.value} key={item.value}>{item.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" disabled={loadingDomains}>
              <InputLabel id="domain-label">Domain</InputLabel>
              <Select labelId="domain-label" value={domain} label="Domain" onChange={(event) => setDomain(event.target.value)}>
                {flattenedDomains.map((item) => (
                  <MenuItem value={item.value} key={item.value}>{item.value}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>Advanced filters</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {[
                    ['Country column', countryColumn, setCountryColumn],
                    ['Context column', contextColumn, setContextColumn],
                    ['Dataset CMID column', datasetColumn, setDatasetColumn],
                  ].map(([label, value, setter]) => (
                    <FormControl fullWidth size="small" key={label}>
                      <InputLabel>{label}</InputLabel>
                      <Select value={value} label={label} onChange={(event) => setter(event.target.value)}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        {columnOptions.map((item) => <MenuItem value={item.header} key={`${label}-${item.columnIndex}`}>{item.header}</MenuItem>)}
                      </Select>
                    </FormControl>
                  ))}
                  <Stack direction="row" spacing={1}>
                    <TextField size="small" fullWidth label="Start year" value={yearStart} onChange={(event) => setYearStart(event.target.value)} />
                    <TextField size="small" fullWidth label="End year" value={yearEnd} onChange={(event) => setYearEnd(event.target.value)} />
                  </Stack>
                  <FormControlLabel
                    control={<Checkbox checked={includeKey} onChange={(event) => setIncludeKey(event.target.checked)} />}
                    label="Include dataset Key values"
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography component="h2" variant="h2">3. Translate</Typography>
            {running && (
              <Box>
                <LinearProgress variant="determinate" value={Math.max(0, Math.min(100, progress.percent))} />
                <Typography variant="body2" sx={{ mt: 0.75 }}>
                  {progress.message || 'Translating…'} {progress.elapsedSeconds ? `(${progress.elapsedSeconds}s)` : ''}
                </Typography>
              </Box>
            )}
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                variant="contained"
                startIcon={running ? <CircularProgress size={16} color="inherit" /> : <TranslateIcon />}
                disabled={!officeReady || !selection || running || loadingDomains}
                onClick={runTranslation}
              >
                Translate selected column
              </Button>
              {running && <Button variant="outlined" color="error" onClick={cancelCurrentTranslation}>Cancel</Button>}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Selected values and mapped filter columns are sent securely to the public CatMapper API. No credentials are stored.
            </Typography>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography component="h2" variant="h2">Alternative matches</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
            Select a source or translated cell to review CatMapper’s co-best matches for that row.
          </Typography>
          {activeMatch ? (
            <Stack spacing={1}>
              <Typography variant="body2" fontWeight={600}>
                Row {activeMatch.rowPosition + 1} · {activeMatch.candidates.length} option{activeMatch.candidates.length === 1 ? '' : 's'}
              </Typography>
              {getAlternativeMatchState(activeMatch) === 'multiple-unselected' && (
                <Alert severity="info">Choose one of the matching options for this row.</Alert>
              )}
              {activeMatch.candidates.length ? activeMatch.candidates.map((candidate, index) => (
                <CandidateCard
                  key={`${activeMatch.runId}-${activeMatch.rowId}-${index}`}
                  candidate={candidate}
                  index={index}
                  selected={activeMatch.selectedIndex === index}
                  disabled={savingChoice}
                  database={activeMatch.run?.configuration?.database}
                  onSelect={chooseCandidate}
                />
              )) : <Alert severity="info">CatMapper returned no match for this row.</Alert>}
            </Stack>
          ) : (
            <Typography variant="body2">No translated row is selected.</Typography>
          )}
        </Paper>

        <Divider />
        <Typography variant="caption" color="text.secondary">
          CatMapper alternatives persist inside this workbook on a very-hidden metadata sheet.
        </Typography>
      </Stack>

      <Dialog
        open={Boolean(confirmation)}
        onClose={() => resolveBlockChoice('cancel')}
        aria-labelledby="cm-confirm-title"
        aria-describedby="cm-confirm-description"
      >
        <DialogTitle id="cm-confirm-title">Existing translation block found</DialogTitle>
        <DialogContent>
          <DialogContentText id="cm-confirm-description">
            {confirmation?.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => resolveBlockChoice('cancel')}>Keep unchanged</Button>
          <Button onClick={() => resolveBlockChoice('new')}>Create new block</Button>
          <Button variant="contained" onClick={() => resolveBlockChoice('refresh')}>Refresh results</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExcelAddinApp;
