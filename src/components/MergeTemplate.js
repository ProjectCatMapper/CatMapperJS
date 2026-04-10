import React, { useState } from 'react'
import { Box, Button, Divider, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { parseTabularFile } from '../utils/tabularUpload';
import { useAuth } from './AuthContext';
import SavedCmidInsertPopover from './SavedCmidInsertPopover';


const MergeTemplate = ({ database }) => {
  const { user, cred } = useAuth() || {};

  const [inputValue, setInputValue] = useState('');
  const [, setFile] = useState(null);
  const [, setColumns] = useState();
  const [, setRows] = useState([]);
  const [jsonData, setJsondata] = useState();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [, setDownloadHash] = useState('');
  const [templateData, setTemplateData] = useState([]);
  const [templateFound, setTemplateFound] = useState(false);
  const [uploadTemplateValid, setUploadTemplateValid] = useState(false);

  const validTemplateRows = (templateData || []).filter((row) => row?.mergingID && String(row.mergingID).trim() !== "");

  const mergingMetadataRows = Array.from(
    new Map(
      validTemplateRows
        .map((row) => [
          row.mergingID,
          {
            mergingID: row.mergingID,
            mergingCMName: row.mergingCMName || "",
            mergingShortName: row.mergingShortName || "",
            mergingCitation: row.mergingCitation || ""
          }
      ])
    ).values()
  );

  const handleChange = (event) => {
    setInputValue(event.target.value);
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/merge/syntax/${database}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ template: jsonData }),
      });

      const raw = await response.text();
      let result = null;
      try {
        result = raw ? JSON.parse(raw) : {};
      } catch {
        result = null;
      }

      if (!response.ok) {
        const serverMessage =
          (result && (result.msg || result.error)) ||
          raw ||
          `HTTP ${response.status}`;
        throw new Error(serverMessage);
      }

      let msgToDisplay;

      if (result && 'msg' in result) {
        msgToDisplay = result.msg;
        setMessage("✅" + msgToDisplay);
      } else {
        msgToDisplay = "⚠️ Merge files generated, but response did not include a status message.";
        setMessage(msgToDisplay);
      }

      setSnackbarOpen(true);

      if (result && result.download?.hash) {
        setDownloadHash(result.download.hash);
        window.open(`${process.env.REACT_APP_API_URL}/download/zip/${result.download.hash}`, '_blank');
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

      const foundRows = Array.isArray(result)
        ? result.filter((row) => row?.mergingID && String(row.mergingID).trim() !== "")
        : [];

      if (
        foundRows.length > 0
      ) {
        setMessage(`✅ Template found for "${inputValue}"`);
        setTemplateFound(true);
      } else {
        setMessage(`⚠️ No valid template found for "${inputValue}"`);
        setTemplateFound(false);
      }

      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error fetching merging template:', error);
      setMessage(`❌ Error: ${error.message}`);
      setTemplateFound(false);
      setSnackbarOpen(true);
    }
  };

  const handleDownloadDatasetsXLSX = async () => {
    if (!Array.isArray(templateData) || templateData.length === 0) {
      alert("No template data to download. Please find a merging template first.");
      return;
    }

    const { downloadJsonAsXlsx } = await import('../utils/excelExport');
    await downloadJsonAsXlsx(templateData, {
      fileName: `merging_template_${inputValue}.xlsx`,
      sheetName: 'MergingTemplate',
    });
  };


  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setFile(file);
      setJsondata(null);
      setUploadTemplateValid(false);

      const parsed = await parseTabularFile(file, { checkMergedCells: false });
      const normalizedHeader = parsed.headers;
      const requiredCols = ["mergingID", "datasetID", "filePath"];
      const hasAllRequiredCols = requiredCols.every((col) => normalizedHeader.includes(col));

      if (!hasAllRequiredCols) {
        setMessage(`❌ Invalid merge template. Required columns: ${requiredCols.join(', ')}`);
        setSnackbarOpen(true);
        setUploadTemplateValid(false);
        return;
      }

      if (parsed.records.length === 0) {
        setMessage('❌ Uploaded template has no data rows.');
        setSnackbarOpen(true);
        setUploadTemplateValid(false);
        return;
      }

      setColumns(normalizedHeader);
      setRows(parsed.rows2d);
      setJsondata(parsed.records);
      setUploadTemplateValid(true);
      setMessage(`✅ Valid merge template uploaded (${parsed.records.length} rows).`);
      setSnackbarOpen(true);
    } catch (err) {
      const text = err?.message || 'Error parsing upload file. Please verify the file format and contents.';
      if (text.toLowerCase().includes('please upload a valid file')) {
        alert(text);
      } else {
        setMessage(`❌ ${text}`);
        setSnackbarOpen(true);
      }
      e.target.value = null;
      setFile(null);
      setUploadTemplateValid(false);
    }
  };

  return (
    <Box >
      <Box sx={{ mb: 3 }} style={{ marginBottom: "50px" }}>
        <h2 style={{ color: 'black', padding: "2px" }}>Merging code</h2>
        <h4 style={{ color: 'black', padding: "2px" }}>choose merging template ID</h4>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            variant="outlined"
            value={inputValue}
            onChange={handleChange}
          />
          <SavedCmidInsertPopover
            user={user}
            cred={cred}
            database={database}
            onInsert={setInputValue}
            title="Insert bookmarked merging template ID"
            datasetOnly
            compact
            buttonLabel="Insert"
          />
        </Box>
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
        }} onClick={handleDownloadDatasetsXLSX} disabled={!templateFound}>
          Download list of Datasets
        </Button>
        {mergingMetadataRows.length > 0 && (
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, mb: 2, maxWidth: "100%" }}>
            <Table size="small" aria-label="merging template metadata">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Merging CMID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>CMName</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>shortName</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Citation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mergingMetadataRows.map((row) => (
                  <TableRow key={row.mergingID}>
                    <TableCell>
                      <Button
                        size="small"
                        variant="text"
                        sx={{ p: 0, minWidth: 0 }}
                        onClick={() => window.open(`/${database.toLowerCase()}/${row.mergingID}/network`, '_blank')}
                      >
                        {row.mergingID}
                      </Button>
                    </TableCell>
                    <TableCell>{row.mergingCMName}</TableCell>
                    <TableCell>{row.mergingShortName}</TableCell>
                    <TableCell>{row.mergingCitation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Divider sx={{ my: 1 }} />
        <h4 style={{ color: 'black', padding: "2px" }}>Upload merging template with included file paths</h4>
        <Box>
          <h3 style={{ color: 'black', fontWeight: "bold", padding: "2px" }}>Upload Template</h3>
          <input
            id="fileInput"
            style={{ color: 'black', fontWeight: "bold", marginLeft: 7, padding: "2px" }}
            type="file"
            accept=".csv,.tsv,.xlsx"
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
        }} onClick={handleSubmit} disabled={!uploadTemplateValid}>
          Generate Merge Files
        </Button>


      </Box>
    </Box>

  )
}

export default MergeTemplate;
