import React, { useState, useEffect } from 'react'
import { Box, Button, FormControlLabel, Radio, RadioGroup, Checkbox, Typography, Divider,Select,TextField,MenuItem,InputLabel,FormControl, FormGroup,Table, TableBody, TableCell, TableContainer, TableHead, TableRow,TablePagination, Paper } from '@mui/material';
import {ExcelRenderer} from 'react-excel-renderer';
import { useAuth } from './AuthContext';

const Download_Merge = () => {

    const [inputValue, setInputValue] = useState('');
    const [file, setFile] = useState(null);
    const [columns, setColumns] = useState();
    const [rows, setRows] = useState([]);
    let fileObj= ""

  const handleChange = (event) => {
    setInputValue(event.target.value);
  }

    const handleSubmit = async () => {
        try {
          const response = await fetch('YOUR_API_ENDPOINT', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(),
          });
    
          const result = await response.json();
        } catch (error) {
          console.error('Error submitting form:', error);
        }
      };

      const handleFileChange = (e) => {
        const fileType = e.target.files[0].type;
          if (fileType === 'application/vnd.ms-excel' || fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            setFile(e.target.files[0]);
            fileObj = e.target.files[0];
    
    ExcelRenderer(fileObj, (err, resp) => {
      if(err){
        console.log(err);            
      }
      else{
        setColumns(resp.rows[0])
        setRows(resp.rows.slice(1));
      }
    });  
          } else {
            alert('Please upload a valid CSV or XLSX file.');
            e.target.value = null;
            setFile(null);
          }
      };

    const handleclear = () => {
        setFile(null);
        if (document.getElementById('fileInput')) {
          document.getElementById('fileInput').value = '';
        }}

    return (
        <Box >
        <Box sx={{ mb: 3 }} style={{marginBottom:"50px"}}>
        <h2 style={{ color: 'black', padding: "2px" }}>Merging code</h2>
        <h4 style={{ color: 'black', padding: "2px" }}>choose merging template ID</h4>
        <TextField
        variant="outlined"
        value={inputValue} 
        onChange={handleChange} 
        sx={{ 
          mb: 2,
        }}
      />
      <Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white', 
        '&:hover': {
          backgroundColor: 'green', 
        },
        mr:4,ml:4,my:1
      }}  onClick={handleSubmit}>
        Find Merging Template
      </Button>
<Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white', 
        '&:hover': {
          backgroundColor: 'green', 
        },
      }}  onClick={handleSubmit}>
        Download list of Datasets
      </Button>
      <Divider sx={{ my: 1 }} />
      <h4 style={{ color: 'black', padding: "2px" }}>Upload merging template with included file paths</h4>
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
      <Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white', 
        '&:hover': {
          backgroundColor: 'green', 
        },
        mr:4,my:1
      }}  onClick={handleSubmit}>
        Generate Merge Files
      </Button>
<Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white', 
        '&:hover': {
          backgroundColor: 'green', 
        },
      }}  onClick={handleSubmit}>
        Download Merge files
      </Button>


        </Box>
        </Box>

    )
}

export default Download_Merge;