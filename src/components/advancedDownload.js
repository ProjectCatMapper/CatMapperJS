import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Checkbox, Button, Typography
} from '@mui/material';
import { useState, useEffect } from 'react';


import NeonButton from './Button';
const DownloadDialogButton = ({ users, database, domain }) => {
  const [open, setOpen] = useState(false);
  const [includeProps, setIncludeProps] = useState(false);
  const [selectedProps, setSelectedProps] = useState([]);
  const [availableProps, setAvailableProps] = useState([]);

    useEffect(() => {
  const fetchProps = async () => {
    if (!users || users.length === 0 || !includeProps || !open) return;

    const CMID = users.map(u => u.CMID).filter(Boolean);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/metadata/CMIDProperties/${database}/${domain}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ CMID })
      });
      const result = await response.json();
      if (!result.data || result.data.length === 0) {
        alert("No properties found for selected CMIDs and domain.");
        return;
      }
      setAvailableProps(result.data);
    } catch (error) {
      console.error("Failed to fetch available properties:", error);
    }
  };

  fetchProps();
}, [users, database, domain, includeProps, open]);

  const handleDownload = async () => {
  if (!users || users.length === 0) {
    alert("No data to download.");
    return;
  }

  const CMID = users.map(u => u.CMID).filter(Boolean);
  const dateStr = new Date().toISOString().split('T')[0];
  let blob, filename;

  if (!includeProps) {
    // ✅ Download current results without modification
    const header = Object.keys(users[0]);
    const csv = [
      header.join(','),
      ...users.map(row =>
        header.map(field => {
          const value = row[field];
          if (Array.isArray(value)) return `"${value.join('; ')}"`;
          return JSON.stringify(value ?? '');
        }).join(',')
      )
    ].join('\r\n');

    blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    filename = `search_results_${dateStr}.csv`;
  } else {
    // ✅ Download selected node properties from API
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/download/advanced/${database}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            CMID,
            properties: selectedProps
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download with node properties");
      }

      blob = await response.blob();
      filename = `node_export_${dateStr}.csv`;
    } catch (error) {
      alert("Error downloading node properties. Check console for details.");
      console.error(error);
      return;
    }
  }

  // Trigger download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setOpen(false);
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
              {availableProps.map(prop => (
                <FormControlLabel
                  key={prop}
                  control={
                    <Checkbox
                      checked={selectedProps.includes(prop)}
                      onChange={() =>
                        setSelectedProps(prev =>
                          prev.includes(prop)
                            ? prev.filter(p => p !== prop)
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
