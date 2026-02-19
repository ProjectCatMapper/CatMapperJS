import React, { useState } from 'react';
import { Box, Button, Typography, Divider } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import * as XLSX from 'xlsx';
import DomainSelector from './DomainSelector';
import { parseTabularFile } from '../utils/tabularUpload';

const JoinDatasets_Merge = ({ database }) => {

  const [fileLeft, setFileLeft] = useState(null);
  const [fileRight, setFileRight] = useState(null);
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
  const handleMergeSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/joinDatasets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          joinLeft: fileLeft,
          joinRight: fileRight,
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
  const handleJoinDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'joined_data.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
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
        Upload two datasets to merge. Both datasets must have a `datasetID` column with a valid ID for each row. Both datasets must have the original `Key` columns specified in the database translation that was previously uploaded to the dataset with the matching CMID. If you have not yet translated and uploaded your dataset, please do so now.
      </Typography>

      <br />

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
            accept=".csv,.tsv,.xls,.xlsx"
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
            accept=".csv,.tsv,.xls,.xlsx"
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
