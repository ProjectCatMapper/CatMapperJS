import React, { useState, useEffect } from 'react'
import { Box, Button, Typography, Divider, } from '@mui/material';
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
  let fileObj = ""
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [database, setDatabase] = useState(null);
  const location = useLocation();
  const [domain, setdomain] = useState('');

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
            setFile(table)
          }
        });  
              } else {
                alert('Please upload a valid CSV or XLSX file.');
                e.target.value = null;
                setFile(null);
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
            return rowData;
          });

          setFileData(table);
        }
      });

      // CSV (.csv)
    } else if (validCsvTypes.includes(fileType)) {
      Papa.parse(fileObj, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => setFileData(results.data),
        error: (err) => console.error('CSV parse error:', err),
      });

      // Invalid type
    } else {
      alert('Please upload a valid CSV (.csv) or Excel (.xlsx, .xls) file.');
      e.target.value = null;
      setFileData(null);
    }
  };

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

      // Handle 500s or explicit error responses
      if (!response.ok) {
        throw new Error(result?.message || result?.[0]?.error || 'Failed to merge datasets');
      }

      // Handle logical errors even if status is 200
      if (Array.isArray(result) && result.length && result[0]?.error) {
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

  const handleJoinDownload = async () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'joined_data.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{
      height: '100%',
      maxHeight: 'calc(100vh - 100px)',
      overflow: 'auto',
      padding: '16px',
    }}>
      <h2 style={{ color: 'black', padding: "2px" }}>Join Datasets</h2>
      <Divider sx={{ my: 1 }} />
      <Typography variant="p">Upload two datasets to merge. Both datasets must have a `datasetID` column with a valid ID for each row. Both datasets must have the original `Key` columns specified in the database translation that was previously uploaded to the dataset with the matching CMID. If you have not yet translated and uploaded your dataset, please do so now.</Typography>
      <br />
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
      }}
      >
        <Box>
          <h3 style={{ color: 'black', fontWeight: "bold", padding: "2px" }}>Upload first Dataset</h3>
          <input
            id="fileInput"
            style={{ color: 'black', fontWeight: "bold", marginLeft: 7, padding: "2px" }}
            type="file"
            accept=".csv, .xlsx"
            onClick={(e) => {
              e.target.value = null;       // clears previous selection in the browser
              setFileLeft(null);           // resets React state
            }}
            onChange={(e) => handleFileUpload(e, 'left')}
          />
        </Box>

        <Box>
          <h3 style={{ color: 'black', fontWeight: "bold", padding: "2px" }}>Upload second Dataset</h3>
          <input
            id="fileInput"
            style={{ color: 'black', fontWeight: "bold", marginLeft: 7, padding: "2px" }}
            type="file"
            accept=".csv, .xlsx"
            onClick={(e) => {
              e.target.value = null;       // clears previous selection in the browser
              setFileRight(null);           // resets React state
            }}
            onChange={(e) => handleFileUpload(e, 'right')}
          />
        </Box>
      </Box>
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
      <Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white',
        '&:hover': {
          backgroundColor: 'green',
        },
        mr: 4
      }} onClick={handleMergeSubmit}
        disabled={!fileLeft || !fileRight || !domain}>
        Merge Datasets
      </Button>
      <Backdrop
        open={loading}
        style={{ color: '#fff', zIndex: 1200 }}
      >
        <CircularProgress color="inherit" />
        <span style={{ marginLeft: 16 }}>Processing...</span>
      </Backdrop>
      <Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white',
        '&:hover': {
          backgroundColor: 'green',
        },
      }} onClick={handleJoinDownload}
        disabled={!data || (Array.isArray(data) && data.length === 0)}
      >
        Download Results
      </Button>
    </Box>
  )
}

export default JoinDatasets_Merge;