import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Popover,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { getBookmarks, getHistory } from '../api/profileApi';

const SavedCmidInsertPopover = ({
  user,
  cred,
  database,
  onInsert,
  targetField,
  onTargetFieldChange,
  targetFieldOptions = [],
  title = 'Insert from Bookmarks/History',
  datasetOnly = false,
  compact = false,
  buttonLabel = ''
}) => {
  const [entries, setEntries] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCmid, setSelectedCmid] = useState('');
  const [filterText, setFilterText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSavedCmids = async () => {
      if (!user || !cred || !database) {
        setEntries([]);
        return;
      }
      try {
        const [bookmarkData, historyData] = await Promise.all([
          getBookmarks({ userId: user, cred }),
          getHistory({ userId: user, cred })
        ]);
        const combined = [...(bookmarkData.bookmarks || []), ...(historyData.history || [])]
          .filter((entry) => (entry.database || '').toLowerCase() === database.toLowerCase())
          .filter((entry) => !datasetOnly || /^(SD|AD)\d+$/i.test(entry.cmid || ''));

        const seen = new Set();
        const deduped = [];
        combined.forEach((entry) => {
          const key = `${entry.database}::${entry.cmid}`;
          if (!seen.has(key)) {
            seen.add(key);
            deduped.push(entry);
          }
        });
        setEntries(deduped);
      } catch (_err) {
        setEntries([]);
      }
    };

    loadSavedCmids();
  }, [user, cred, database, datasetOnly]);

  const filteredEntries = useMemo(() => {
    if (!filterText.trim()) return entries;
    const term = filterText.trim().toLowerCase();
    return entries.filter((entry) =>
      `${entry.cmid || ''} ${entry.cmname || ''}`.toLowerCase().includes(term)
    );
  }, [entries, filterText]);

  const open = Boolean(anchorEl);

  const handleInsert = () => {
    if (!selectedCmid) {
      setError('Select a CMID to insert.');
      return;
    }
    setAnchorEl(null);
    onInsert(selectedCmid);
    setError('');
  };

  if (!user || !cred) return null;

  return (
    <>
      <Button
        variant="outlined"
        size={compact ? 'small' : 'medium'}
        startIcon={<BookmarkBorderIcon fontSize={compact ? 'small' : 'medium'} />}
        sx={compact ? { minWidth: 'auto', px: 1, py: 0.5 } : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        {buttonLabel || (compact ? 'Insert' : title)}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 420 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            {title}
          </Typography>

          {targetFieldOptions.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">Insert into field</Typography>
              <Select
                size="small"
                value={targetField}
                fullWidth
                onChange={(event) => onTargetFieldChange?.(event.target.value)}
              >
                {targetFieldOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </Box>
          )}

          <TextField
            size="small"
            label="Filter CMIDs"
            value={filterText}
            onChange={(event) => setFilterText(event.target.value)}
            fullWidth
            sx={{ mb: 1 }}
          />

          <Select
            size="small"
            value={selectedCmid}
            displayEmpty
            fullWidth
            onChange={(event) => setSelectedCmid(event.target.value)}
          >
            <MenuItem value="">Select saved CMID</MenuItem>
            {filteredEntries.map((entry, idx) => (
              <MenuItem key={`${entry.database}-${entry.cmid}-${idx}`} value={entry.cmid}>
                {entry.cmid} - {entry.cmname || '(No CMName)'}
              </MenuItem>
            ))}
          </Select>

          {filteredEntries.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No matching saved CMIDs.
            </Typography>
          )}

          {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}

          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Button variant="contained" onClick={handleInsert} disabled={!selectedCmid}>
              Insert CMID
            </Button>
            <Button variant="text" onClick={() => setAnchorEl(null)}>
              Close
            </Button>
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

export default SavedCmidInsertPopover;
