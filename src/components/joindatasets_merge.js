import React, { useState} from 'react'
import { Box, Button, Typography, Divider, } from '@mui/material';
import {ExcelRenderer} from 'react-excel-renderer';
import { useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import * as XLSX from 'xlsx';

const JoinDatasets_Merge = () => {

    const [file, setFile] = useState(null);
    const [file1, setFile1] = useState(null);
    let fileObj= ""
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState();
    let sections = [
        { label: 'ANY DOMAIN', keys: ['ANY DOMAIN'] },
        { label: 'AREA to PPL', keys: ['AREA', 'ADM0', 'ADM1', 'ADM2', 'ADM3', 'ADM4', 'ADMD', 'ADME', 'ADML', 'ADMX', 'PPL','NATURAL'] },
        { label: 'DATASET', keys: ['DATASET'] },
        { label: 'LANGUOID to FAMILY', keys: ['LANGUOID', 'LANGUAGE', 'DIALECT', 'FAMILY'] },
        { label: 'ETHNICITY', keys: ['ETHNICITY'] },
        { label: 'GENERIC', keys: ['GENERIC'] },
        { label: 'RELIGION', keys: ['RELIGION'] },
        { label: 'VARIABLE', keys: ['VARIABLE'] }
      ];
    let database = "SocioMap"
    if (useLocation().pathname.includes("archamap")) {
    database = "ArchaMap"
    sections = [
        { label: 'ANY DOMAIN', keys: ['ANY DOMAIN'] },
        { label: 'KINGDOM to SUBSPECIES', keys: ['KINGDOM', 'FAUNA', 'PHYLUM', 'CLASS', 'ORDER', 'FAMILY', 'GENUS', 'SPECIES', 'SUBGENUS', 'SUBSPECIES'] },
        { label: 'FEATURE to SITE', keys: ['FEATURE', 'ADM0', 'ADM1', 'ADM2', 'ADM3', 'AREA', 'REGION', 'SITE'] },
        { label: 'STONE', keys: ['STONE'] },
        { label: 'CULTURE', keys: ['CULTURE'] },
        { label: 'BOTANICAL to PHYTOLITH', keys: ['BOTANICAL', 'PHYTOLITH'] },
        { label: 'CERAMIC to CERAMIC_WARE', keys: ['CERAMIC', 'CERAMIC_TYPE','CERAMIC_WARE'] },
        { label: 'DATASET', keys: ['DATASET'] },
        { label: 'PERIOD', keys: ['PERIOD'] },
        { label: 'PROJECTILE_POINT TO PROJECTILE_POINT_TYPE', keys: ['PROJECTILE_POINT','PROJECTILE_POINT_CLUSTER','PROJECTILE_POINT_TYPE'] },
        { label: 'VARIABLE', keys: ['VARIABLE'] }
      ];
    } 

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
            setFile1(table)
          }
        });  
              } else {
                alert('Please upload a valid CSV or XLSX file.');
                e.target.value = null;
                setFile1(null);
              }
          };
    
        const handleclear = () => {
            setFile(null);
            if (document.getElementById('fileInput')) {
              document.getElementById('fileInput').value = '';
            }}
    
        const handleclear1 = () => {
                setFile1(null);
                if (document.getElementById('fileInput')) {
                  document.getElementById('fileInput').value = '';
                }}
    
        const handleMergeSubmit = async () => {
        setLoading(true);
        try {
          const response = await fetch("https://catmapper.org/api/joinDatasets",{
            //const response = await fetch("http://127.0.0.1:5001/joinDatasets", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              "joinLeft" : file,
              "joinRight" : file1,
              "database" : database,
            }),
          });
    
          const result = await response.json();
          setData(result)
        } catch (error) {
          console.error('Error submitting form:', error);
        }
        finally {
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

    return(
        <Box sx={{ height: '100%',              
            maxHeight: 'calc(100vh - 100px)',
            overflow: 'auto',            
            padding: '16px',}}>
          <h2 style={{ color: 'black', padding: "2px" }}>Join Datasets</h2>
          <Divider sx={{ my: 1 }} />
          <Typography variant="p">Upload two datasets to merge. Both datasets must have a `datasetID` column with a valid ID for each row. Both datasets must have the original `Key` columns specified in the database translation that was previously uploaded to the dataset with the matching CMID. If you have not yet translated and uploaded your dataset, please do so now.</Typography>
          <br/>
          <br/>
          <Box sx={{
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        gap:30,
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
          onChange={handleFileChange}
        />
        <Button
          variant="contained"
          sx={{
            backgroundColor: 'black',
            color: 'white',
            '&:hover': {
              backgroundColor: 'green',
            },
            mt: 1,
          }}
          onClick={handleclear}
        >
          Reset imported file
        </Button>
      </Box>
    
      <Box>
        <h3 style={{ color: 'black', fontWeight: "bold", padding: "2px" }}>Upload second Dataset</h3>
        <input
          id="fileInput"
          style={{ color: 'black', fontWeight: "bold", marginLeft: 7, padding: "2px" }}
          type="file"
          accept=".csv, .xlsx"
          onChange={handleFileChange1}
        />
        <Button
          variant="contained"
          sx={{
            backgroundColor: 'black',
            color: 'white',
            '&:hover': {
              backgroundColor: 'green',
            },
            mt: 1,
          }}
          onClick={handleclear1}
        >
          Reset imported file
        </Button>
      </Box>
    </Box>
    <Button variant="contained" sx={{
            backgroundColor: 'black',
            color: 'white', 
            '&:hover': {
              backgroundColor: 'green', 
            },
            mr:4
          }}  onClick={handleMergeSubmit}>
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
          }}  onClick={handleJoinDownload}>
            Download Results
          </Button>
          </Box>
    )
}

export default JoinDatasets_Merge;