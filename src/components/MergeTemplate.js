import React, { useState } from 'react'
import { Box, Button, Divider, TextField, } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import * as XLSX from 'xlsx';
import { ExcelRenderer } from 'react-excel-renderer';


const MergeTemplate = ({ database }) => {

  const [inputValue, setInputValue] = useState('');
  const [, setFile] = useState(null);
  const [, setColumns] = useState();
  const [, setRows] = useState([]);
  const [jsonData, setJsondata] = useState();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [downloadHash, setDownloadHash] = useState('');
  const [templateData, setTemplateData] = useState([]);

  const handleChange = (event) => {
    setInputValue(event.target.value);
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}//merge/syntax/${database}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ template: jsonData }),
      });

      const result = await response.json();

      let msgToDisplay;

      if ('msg' in result) {
        msgToDisplay = result.msg;
        setMessage("✅" + msgToDisplay);
      } else {
        msgToDisplay = "⚠️ Unexpected response format: 'msg' not found.";
        setMessage(msgToDisplay);
      }

      setSnackbarOpen(true);

      if (result.download?.hash) {
        setDownloadHash(result.download.hash);
      }

      return msgToDisplay; // ✅ return message

    } catch (error) {
      const errorMessage = `❌ Error submitting form: ${error.message}`;
      console.error(errorMessage);
      setMessage(errorMessage);
      setSnackbarOpen(true);
      return errorMessage; // ✅ return error message
    }
  };

  const handleFindMergingTemplate = async () => {
    if (!inputValue) {
      alert("Please enter a Dataset ID.");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/merge/template/${database}/${inputValue}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      const result = await response.json();
      setTemplateData(result); // store valid template JSON

      if (
        Array.isArray(result) &&
        result.length > 0 &&
        typeof result[0] === 'object' &&
        result[0] !== null &&
        'mergingID' in result[0]
      ) {
        setMessage(`✅ Template found for "${inputValue}"`);
      } else {
        setMessage(`⚠️ No valid template found for "${inputValue}"`);
      }

      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error fetching merging template:', error);
      setMessage(`❌ Error: ${error.message}`);
      setSnackbarOpen(true);
    }
  };

  const handleDownloadDatasetsXLSX = () => {
    if (!Array.isArray(templateData) || templateData.length === 0) {
      alert("No template data to download. Please find a merging template first.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'MergingTemplate');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `merging_template_${inputValue}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const fileType = file?.type;

    if (
      fileType === 'application/vnd.ms-excel' || // .xls
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
    ) {
      setFile(file);
      setJsondata(null);

      ExcelRenderer(file, (err, resp) => {
        if (err) {
          console.error('Error parsing Excel:', err);
          return;
        }

        const [header, ...dataRows] = resp.rows;

        const jsonArray = dataRows.map(row => {
          const obj = {};
          header.forEach((col, i) => {
            obj[col] = row[i];
          });
          return obj;
        });

        setColumns(header);
        setRows(dataRows);
        setJsondata(jsonArray); // ✅ Final JSON here
      });
    } else {
      alert('Please upload a valid Excel (.xls or .xlsx) file.');
      e.target.value = null;
      setFile(null);
    }
  };

  return (
    <Box >
      <Box sx={{ mb: 3 }} style={{ marginBottom: "50px" }}>
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
          mr: 4, ml: 4, my: 1
        }} onClick={handleFindMergingTemplate}>
          Find Merging Template
        </Button>
        <Button variant="contained" sx={{
          backgroundColor: 'black',
          color: 'white',
          '&:hover': {
            backgroundColor: 'green',
          },
        }} onClick={handleDownloadDatasetsXLSX}>
          Download list of Datasets
        </Button>
        <Divider sx={{ my: 1 }} />
        <h4 style={{ color: 'black', padding: "2px" }}>Upload merging template with included file paths</h4>
        <Box>
          <h3 style={{ color: 'black', fontWeight: "bold", padding: "2px" }}>Upload Template</h3>
          <input
            id="fileInput"
            style={{ color: 'black', fontWeight: "bold", marginLeft: 7, padding: "2px" }}
            type="file"
            accept=".csv, .xlsx"
            onChange={handleFileChange}
          />
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={() => setSnackbarOpen(false)} severity="info" sx={{ width: '100%' }}>
              {message}
            </Alert>
          </Snackbar>
        </Box>


        <Button variant="contained" sx={{
          backgroundColor: 'black',
          color: 'white',
          '&:hover': {
            backgroundColor: 'green',
          },
          mr: 4, my: 1
        }} onClick={handleSubmit}>
          Generate Merge Files
        </Button>
        <Button variant="contained" sx={{
          backgroundColor: 'black',
          color: 'white',
          '&:hover': {
            backgroundColor: 'green',
          },
        }} onClick={() => window.open(`${process.env.REACT_APP_API_URL}/download/zip/${downloadHash}`, '_blank')}>
          Download Merge files
        </Button>


      </Box>
    </Box>

  )
}

export default MergeTemplate;
