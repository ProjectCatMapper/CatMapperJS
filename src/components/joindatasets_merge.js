import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Divider } from '@mui/material';
import { ExcelRenderer } from 'react-excel-renderer';
import Papa from 'papaparse';
import { useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import * as XLSX from 'xlsx';
import DomainSelector from './domainSelector';

const JoinDatasets_Merge = () => {

  const [fileLeft, setFileLeft] = useState(null);
  const [fileRight, setFileRight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [database, setDatabase] = useState(null);
  const [domain, setdomain] = useState('');
  const validCsvTypes = ['text/csv', 'application/csv'];
  const location = useLocation();

    const handleFileChange = (e) => {
            const fileType = e.target.files[0].type;
              if (fileType === 'application/vnd.ms-excel' || fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                fileObj = e.target.files[0];
        
        ExcelRenderer(fileObj, (err, resp) => {
          if(err){
            console.log(err);            
          }
          else{
            const c = resp.rows[0];
            const r = resp.rows.slice(1);
            
            const table = r.map((row, index) => {
              const rowData = {};
              c.forEach((column, columnIndex) => {
                rowData[column] = row[columnIndex];
              });
              return rowData;
            });
            setFileLeft(table)
          }
        });  
              } else {
                alert('Please upload a valid CSV or XLSX file.');
                e.target.value = null;
                setFileLeft(null);
              }
          };
        
          const handleFileChange1 = (e) => {
            const fileType = e.target.files[0].type;
              if (fileType === 'application/vnd.ms-excel' || fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileType === 'text/csv') {
                fileObj = e.target.files[0];
        
        ExcelRenderer(fileObj, (err, resp) => {
          if(err){
            console.log(err);            
          }
          else{
            const c = resp.rows[0];
            const r = resp.rows.slice(1);
               
            const table = r.map((row, index) => {
              const rowData = {};
              c.forEach((column, columnIndex) => {
                rowData[column] = row[columnIndex];
              });
              return rowData;
            });
          setFileRight(table);          
          }});
        }
      

      // CSV (.csv)
     else if (validCsvTypes.includes(fileType)) {
      Papa.parse(fileObj, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => setFileRight(results.data),
        error: (err) => console.error('CSV parse error:', err),
      });

    //   // Invalid type
     } 
    else {
      alert('Please upload a valid CSV (.csv) or Excel (.xlsx, .xls) file.');
      e.target.value = null;
      setFileRight(null);
    }

    // Invalid type
    alert('Please upload a valid CSV or Excel file.');
    e.target.value = null;
    setFileData(null);
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
            accept=".csv, .xlsx"
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
            accept=".csv, .xlsx"
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
