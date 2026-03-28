import React, { useState } from 'react';
import { Box, Button, Typography, Divider, IconButton, TextField, Tooltip } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import InfoIcon from '@mui/icons-material/Info';
import DomainSelector from './DomainSelector';
import SavedCmidInsertPopover from './SavedCmidInsertPopover';
import { useAuth } from './AuthContext';
import { parseTabularFile } from '../utils/tabularUpload';
import { downloadJsonAsXlsx } from '../utils/excelExport';

const JoinDatasets_Merge = ({ database }) => {
  const { user, cred } = useAuth();

  const [fileLeft, setFileLeft] = useState(null);
  const [fileRight, setFileRight] = useState(null);
  const [leftDatasetID, setLeftDatasetID] = useState('');
  const [rightDatasetID, setRightDatasetID] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [domain, setdomain] = useState('');

  const parseJoinFile = async (file, setTarget, event) => {
    try {
      const parsed = await parseTabularFile(file, {
        checkMergedCells: false,
        stripWrappingQuotes: true,
      });
      setTarget(parsed.records);
    } catch (err) {
      alert(err?.message || 'Please upload a valid CSV/TSV/Excel file.');
      if (event?.target) event.target.value = null;
      setTarget(null);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await parseJoinFile(file, setFileLeft, e);
  };

  const handleFileChange1 = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await parseJoinFile(file, setFileRight, e);
  };

  // ------------------------------------------------------------
  // Submit merge request
  // ------------------------------------------------------------
  const normalizeJoinRowsWithDatasetID = (rows, datasetIDOverride, sideLabel) => {
    const safeRows = Array.isArray(rows) ? rows : [];
    const normalizedOverride = String(datasetIDOverride || '').trim();

    if (normalizedOverride) {
      if (!/^(SD|AD)\d+$/i.test(normalizedOverride)) {
        throw new Error(`${sideLabel}: datasetID textbox must be a valid dataset CMID (for example SD123 or AD456).`);
      }
      return safeRows.map((row) => ({ ...row, datasetID: normalizedOverride }));
    }

    const missingRows = [];
    const normalizedRows = safeRows.map((row, index) => {
      const value = String(row?.datasetID || '').trim();
      if (!value) {
        missingRows.push(index + 1);
      }
      return { ...row, datasetID: value };
    });

    if (missingRows.length > 0) {
      const preview = missingRows.slice(0, 8).join(', ');
      const suffix = missingRows.length > 8 ? '...' : '';
      throw new Error(
        `${sideLabel}: leave the textbox blank only when every row in the uploaded dataset has a datasetID value. Missing row(s): ${preview}${suffix}`
      );
    }

    return normalizedRows;
  };

  const handleMergeSubmit = async () => {
    try {
      setLoading(true);

      const normalizedLeft = normalizeJoinRowsWithDatasetID(fileLeft, leftDatasetID, 'First dataset');
      const normalizedRight = normalizeJoinRowsWithDatasetID(fileRight, rightDatasetID, 'Second dataset');

      const response = await fetch(`${process.env.REACT_APP_API_URL}/joinDatasets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          joinLeft: normalizedLeft,
          joinRight: normalizedRight,
          database: database,
          domain: domain
        }),
      });

      const result = await response.json();
      console.log('Merge response:', result);

      if (!response.ok) {
        throw new Error(result?.message || result?.[0]?.error || 'Failed to merge datasets');
      }

      if (Array.isArray(result) && result[0]?.error) {
        throw new Error(result[0].error);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      setData(result[0] || result.mergedData || []);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Merge failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // Download merged file
  // ------------------------------------------------------------
  const handleJoinDownload = async () => {
    await downloadJsonAsXlsx(data, {
      fileName: 'joined_data.xlsx',
      sheetName: 'Sheet1',
    });
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <Box sx={{
      height: '100%',
      maxHeight: 'calc(100vh - 100px)',
      overflow: 'auto',
      padding: '16px'
    }}>
      <h2 style={{ color: 'black', padding: '2px' }}>Join Datasets</h2>
      <Divider sx={{ my: 1 }} />

      <Typography>
        Upload two datasets to merge. You can set one dataset CMID per file using the datasetID textboxes below, or leave textboxes blank and use a `datasetID` column in the upload files. Both datasets must have the original `Key` columns specified in the database translation that was previously uploaded to the dataset with the matching CMID. If you have not yet translated and uploaded your dataset, please do so now.
      </Typography>

      <br />
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 2,
          flexWrap: 'wrap'
        }}
      >
        <Box sx={{ minWidth: 280 }}>
          <Typography variant="subtitle2" sx={{ color: 'black', mb: 0.5 }}>
            First datasetID
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              size="small"
              placeholder="e.g., SD123 or AD456"
              value={leftDatasetID}
              onChange={(event) => setLeftDatasetID(event.target.value)}
              sx={{ width: 230 }}
            />
            <SavedCmidInsertPopover
              user={user}
              cred={cred}
              database={database}
              datasetOnly
              compact
              buttonLabel="Insert"
              title="Insert Dataset CMID"
              onInsert={(cmid) => setLeftDatasetID(cmid)}
            />
          </Box>
        </Box>

        <Box sx={{ minWidth: 280 }}>
          <Typography variant="subtitle2" sx={{ color: 'black', mb: 0.5 }}>
            Second datasetID
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              size="small"
              placeholder="e.g., SD123 or AD456"
              value={rightDatasetID}
              onChange={(event) => setRightDatasetID(event.target.value)}
              sx={{ width: 230 }}
            />
            <SavedCmidInsertPopover
              user={user}
              cred={cred}
              database={database}
              datasetOnly
              compact
              buttonLabel="Insert"
              title="Insert Dataset CMID"
              onInsert={(cmid) => setRightDatasetID(cmid)}
            />
          </Box>
        </Box>

        <Tooltip
          arrow
          title="You can either enter the dataset CMID in the textbox or leave it blank and enter the CMID in a column called datasetID. If you use the datasetID column, every row must include the dataset CMID. This allows joining datasets from multiple different sources."
        >
          <IconButton size="small" sx={{ mb: 0.4 }}>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 30,
        backgroundColor: '#87CEEB',
        borderRadius: 4,
        padding: 2,
        boxShadow: 1,
      }}>
        {/* LEFT FILE */}
        <Box>
          <h3 style={{ color: 'black', fontWeight: 'bold' }}>Upload first Dataset</h3>
          <input
            type="file"
            accept=".csv,.tsv,.xlsx"
            onClick={(e) => {
              e.target.value = null;       // clears previous selection in the browser
              setFileLeft(null);           // resets React state
            }}
            onChange={(e) => handleFileChange(e, 'left')}
          />
        </Box>

        {/* RIGHT FILE */}
        <Box>
          <h3 style={{ color: 'black', fontWeight: 'bold' }}>Upload second Dataset</h3>
          <input
            type="file"
            accept=".csv,.tsv,.xlsx"
            onClick={(e) => {
              e.target.value = null;       // clears previous selection in the browser
              setFileRight(null);           // resets React state
            }}
            onChange={(e) => handleFileChange1(e, 'right')}
          />
        </Box>
      </Box>

      {/* Domain + subdomain selector */}
      <Box>
        {database && (
          <DomainSelector
            database={database}
            orientation="horizontal"
            domain={domain}
            setdomain={setdomain}
          />
        )}
      </Box>

      {/* MERGE BUTTON */}
      <Button
        variant="contained"
        sx={{ backgroundColor: 'black', color: 'white', mr: 4 }}
        onClick={handleMergeSubmit}
        disabled={!fileLeft || !fileRight || !domain}
      >
        Merge Datasets
      </Button>

      {/* LOADING */}
      <Backdrop open={loading} style={{ color: '#fff', zIndex: 1200 }}>
        <CircularProgress color="inherit" />
        <span style={{ marginLeft: 16 }}>Processing...</span>
      </Backdrop>

      {/* DOWNLOAD BUTTON */}
      <Button
        variant="contained"
        sx={{ backgroundColor: 'black', color: 'white', mt: 2 }}
        onClick={handleJoinDownload}
        disabled={!data || (Array.isArray(data) && data.length === 0)}
      >
        Download Results
      </Button>
    </Box>
  );
};

export default JoinDatasets_Merge;
