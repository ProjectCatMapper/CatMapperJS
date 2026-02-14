import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Link,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import SavedCmidInsertPopover from './SavedCmidInsertPopover';
import {
  getMatchColumns,
  applyToSelectedRows,
  removeMatchFromRow,
  setBookmarkOrManualCmid,
  getOneToManyGroups,
  resolveOneToManyGroup,
} from '../utils/translateReview';

const TranslateMatchReview = ({
  rows,
  columns,
  termColumn,
  database,
  user,
  cred,
  onRowsChange,
}) => {
  const [selectionModel, setSelectionModel] = useState([]);
  const [manualCmid, setManualCmid] = useState('');
  const [duplicateGroupId, setDuplicateGroupId] = useState('');
  const [duplicateKeepRowId, setDuplicateKeepRowId] = useState('');
  const [notice, setNotice] = useState('');
  const [compactTable, setCompactTable] = useState(false);

  const matchColumns = useMemo(() => getMatchColumns(columns, termColumn), [columns, termColumn]);

  const oneToManyGroups = useMemo(() => getOneToManyGroups(rows), [rows]);

  const activeGroup = useMemo(
    () => oneToManyGroups.find((group) => String(group.groupId) === String(duplicateGroupId)),
    [oneToManyGroups, duplicateGroupId]
  );

  const gridColumns = useMemo(() => {
    const isCmidColumn = (name) => name === 'CMID' || name.startsWith('CMID_');
    const cols = [
      {
        field: '__actions',
        headerName: 'Row Actions',
        width: 88,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <IconButton
            size="small"
            aria-label="Remove match row"
            onClick={() => {
              const next = rows.map((row) =>
                row.__reviewId === params.row.__reviewId
                  ? removeMatchFromRow(row, columns, termColumn)
                  : row
              );
              onRowsChange(next);
            }}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        ),
      },
      ...columns.map((col) => ({
        field: col,
        headerName: col,
        flex: col.length > 14 ? 1.3 : 1,
        minWidth: 130,
        renderCell: isCmidColumn(col)
          ? (params) => {
              const cmid = String(params.value || '').trim();
              if (!cmid) return '';
              return (
                <Link
                  href={`/${database}/${cmid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                >
                  {cmid}
                </Link>
              );
            }
          : undefined,
      })),
    ];
    return cols;
  }, [columns, database, onRowsChange, rows, termColumn]);

  const applyRemoveSelected = () => {
    if (!selectionModel.length) {
      setNotice('Select at least one row to remove matches.');
      return;
    }
    const next = applyToSelectedRows(rows, selectionModel, (row) =>
      removeMatchFromRow(row, columns, termColumn)
    );
    onRowsChange(next);
    setNotice('Removed match data from selected rows.');
  };

  const applyManualCmid = () => {
    if (!selectionModel.length) {
      setNotice('Select at least one row before replacing match data.');
      return;
    }
    const next = applyToSelectedRows(rows, selectionModel, (row) =>
      setBookmarkOrManualCmid(row, columns, termColumn, manualCmid.trim())
    );
    onRowsChange(next);
    setNotice(manualCmid.trim() ? 'Replaced selected rows with manual CMID.' : 'Cleared selected row matches.');
  };

  const applyBookmarkCmid = (cmid) => {
    if (!selectionModel.length) {
      setNotice('Select at least one row before inserting bookmark CMID.');
      return;
    }
    const next = applyToSelectedRows(rows, selectionModel, (row) =>
      setBookmarkOrManualCmid(row, columns, termColumn, cmid)
    );
    onRowsChange(next);
    setNotice(`Inserted ${cmid} into selected rows.`);
  };

  const applyDuplicateResolution = (keepNone = false) => {
    if (!duplicateGroupId) {
      setNotice('Choose a duplicate group first.');
      return;
    }

    const next = resolveOneToManyGroup({
      rows,
      columns,
      termColumn,
      groupId: duplicateGroupId,
      keepRowId: keepNone ? null : duplicateKeepRowId,
    });
    onRowsChange(next);
    setNotice(keepNone ? 'Cleared all matches in duplicate group.' : 'Resolved duplicate group by keeping one row.');
  };

  const matchSummary = useMemo(() => {
    if (!termColumn) return 'Select a column and run search to review matches.';
    return `Generated match columns: ${matchColumns.join(', ') || 'none'}`;
  }, [matchColumns, termColumn]);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>Review & Clean Matches</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {matchSummary}
      </Typography>

      <Stack spacing={1.5} sx={{ mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'stretch', md: 'center' }}>
          <Button variant="outlined" onClick={applyRemoveSelected}>Remove Match (Selected)</Button>
          <TextField
            size="small"
            label="Replace with CMID"
            value={manualCmid}
            onChange={(event) => setManualCmid(event.target.value)}
            sx={{ minWidth: 220 }}
          />
          <Button variant="contained" onClick={applyManualCmid}>Apply CMID To Selected</Button>
          <SavedCmidInsertPopover
            user={user}
            cred={cred}
            database={database}
            onInsert={applyBookmarkCmid}
            title="Insert CMID from Bookmarks"
          />
          <FormControlLabel
            control={<Switch size="small" checked={compactTable} onChange={(event) => setCompactTable(event.target.checked)} />}
            label="Compact table"
          />
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'stretch', md: 'center' }}>
          <Select
            size="small"
            displayEmpty
            value={duplicateGroupId}
            onChange={(event) => {
              setDuplicateGroupId(event.target.value);
              setDuplicateKeepRowId('');
            }}
            sx={{ minWidth: 260 }}
          >
            <MenuItem value="">Select one-to-many group</MenuItem>
            {oneToManyGroups.map((group) => (
              <MenuItem key={`grp-${group.groupId}`} value={String(group.groupId)}>
                Group {String(group.groupId)} ({group.rows.length} rows)
              </MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            displayEmpty
            value={duplicateKeepRowId}
            onChange={(event) => setDuplicateKeepRowId(event.target.value)}
            disabled={!activeGroup}
            sx={{ minWidth: 320 }}
          >
            <MenuItem value="">Select row to keep</MenuItem>
            {(activeGroup?.rows || []).map((row) => (
              <MenuItem key={`keep-${row.__reviewId}`} value={row.__reviewId}>
                Keep {row[`CMID_${termColumn}`] || '(No CMID)'} - {row[`CMName_${termColumn}`] || '(No CMName)'}
              </MenuItem>
            ))}
          </Select>

          <Button variant="contained" disabled={!duplicateGroupId || !duplicateKeepRowId} onClick={() => applyDuplicateResolution(false)}>
            Resolve Group
          </Button>
          <Button variant="outlined" disabled={!duplicateGroupId} onClick={() => applyDuplicateResolution(true)}>
            Set Group To None
          </Button>
        </Stack>

        {notice && <Alert severity="info">{notice}</Alert>}
      </Stack>

      <div style={{ height: 560, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={gridColumns}
          getRowId={(row) => row.__reviewId}
          density={compactTable ? 'compact' : 'standard'}
          checkboxSelection
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={(model) => setSelectionModel(model)}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
          disableRowSelectionOnClick
          sx={
            compactTable
              ? {
                  '& .MuiDataGrid-columnHeaders': { fontSize: '0.78rem' },
                  '& .MuiDataGrid-cell': { fontSize: '0.78rem', py: 0.25 },
                }
              : undefined
          }
        />
      </div>
    </Box>
  );
};

export default TranslateMatchReview;
