import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Checkbox, Button, Typography
} from '@mui/material';
import { useState, useEffect } from 'react';

import { Parser } from '@json2csv/plainjs';
import { flatten } from '@json2csv/transforms';

import NeonButton from './Button';

// Convert array of objects -> CSV (with BOM so Excel opens columns correctly)

function normalizeRows(rows) {
  return rows.map(r => {
    const out = {};
    for (const [k, v] of Object.entries(r)) {
      if (Array.isArray(v)) {
        out[k] = v.length === 0 ? "" : v.join("; ");
      } else {
        out[k] = v;
      }
    }
    return out;
  });
}

const toCsv = (rows, fields) => {
  const parser = new Parser({
    fields: fields && fields.length ? fields : undefined,
    transforms: [
      flatten({ objects: true, arrays: false, separator: '.' })
    ],
  });
  return '\uFEFF' + parser.parse(normalizeRows(rows || []));
};



// Save a Blob or string to file
function saveBlob(input, filename, mime = 'text/csv;charset=utf-8') {
  const blob = input instanceof Blob ? input : new Blob([String(input ?? '')], { type: mime });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

const DownloadDialogButton = ({ users, database, domain }) => {
  const [open, setOpen] = useState(false);
  const [includeProps, setIncludeProps] = useState(false);
  const [selectedProps, setSelectedProps] = useState([]);
  const [availableProps, setAvailableProps] = useState([]);

  useEffect(() => {
    const fetchProps = async () => {
      if (!users || users.length === 0 || !includeProps || !open) return;

      // API for metadata appears to expect "CMID" (singular key with array value) – keep as-is
      const CMID = users.map(u => u.CMID).filter(Boolean);

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/metadata/CMIDProperties/${database}/${domain}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ CMID })
          }
        );

        const result = await response.json();
        if (!result.data || result.data.length === 0) {
          alert('No properties found for selected CMID and domain.');
          return;
        }
        setAvailableProps(result.data);
      } catch (error) {
        console.error('Failed to fetch available properties:', error);
      }
    };

    fetchProps();
  }, [users, database, domain, includeProps, open]);

  const handleDownload = async () => {
    if (!users || users.length === 0) {
      alert('No data to download.');
      return;
    }

    const CMID = users.map(u => u.CMID).filter(Boolean);
    const dateStr = new Date().toISOString().split('T')[0];

    try {
      if (!includeProps) {
        // Export what you already have in `users`
        const fields = users[0] ? Object.keys(users[0]) : [];
        const csv = toCsv(users, fields);
        saveBlob(csv, `explore_results_${dateStr}.csv`);
        setOpen(false);
        return;
      }

      // Download with selected node properties from API
      const res = await fetch(`${process.env.REACT_APP_API_URL}/download/advanced/${database}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json' // ensure JSON so we can control columns
  },
  body: JSON.stringify({ CMID, properties: selectedProps })
});

if (!res.ok) throw new Error(`Download failed: ${res.status}`);

const payload = await res.json();
const rows = Array.isArray(payload?.data)
  ? payload.data
  : Array.isArray(payload)
    ? payload
    : [];

if (rows.length === 0) {
  alert('No data returned from API.');
  return;
}

// --- Build header = union of keys, ordered ---
// preferred leading columns:
const lead = ['CMID', 'CMName'];
// selected props next (deduped, keep order user picked)
const selectedOrdered = (selectedProps || []).filter(
  (k, i, arr) => k && arr.indexOf(k) === i && !lead.includes(k)
);

// gather all keys present in rows
const allKeysSet = new Set();
for (const r of rows) {
  Object.keys(r || {}).forEach(k => allKeysSet.add(k));
}

// remaining keys not already in lead/selected
const already = new Set([...lead, ...selectedOrdered]);
const remaining = [...allKeysSet].filter(k => !already.has(k));

// final header order
const fields = [...lead, ...selectedOrdered, ...remaining];

// Convert and save
const csv = toCsv(rows, fields);
saveBlob(csv, `explore_results_${dateStr}.csv`);
setOpen(false);
    } catch (error) {
      alert('Error downloading node properties. Check console for details.');
      console.error(error);
    }
  };

  return (
    <>
      <NeonButton onClick={() => setOpen(true)} label="Download Results" />
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Download Options</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Checkbox
                checked={!includeProps}
                onChange={() => setIncludeProps(false)}
              />
            }
            label="Download current results only"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeProps}
                onChange={() => setIncludeProps(!includeProps)}
              />
            }
            label="Download results with specific properties"
          />
          {includeProps && (
            <>
              <Typography sx={{ mt: 2 }}>Select properties:</Typography>
              {availableProps.map((prop) => (
                <FormControlLabel
                  key={prop}
                  control={
                    <Checkbox
                      checked={selectedProps.includes(prop)}
                      onChange={() =>
                        setSelectedProps((prev) =>
                          prev.includes(prop)
                            ? prev.filter((p) => p !== prop)
                            : [...prev, prop]
                        )
                      }
                    />
                  }
                  label={prop}
                />
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleDownload} disabled={includeProps && selectedProps.length === 0}>
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DownloadDialogButton;
