import React, { useState, useEffect } from 'react'
import { Box, Button, FormControlLabel, Radio, RadioGroup, Checkbox, Typography, Divider,Select,TextField,MenuItem,InputLabel,FormControl, FormGroup,Table, TableBody, TableCell, TableContainer, TableHead, TableRow,TablePagination, Paper } from '@mui/material';
import DatasetForm from './uploadtranslateform';
import {ExcelRenderer} from 'react-excel-renderer';
import doptions from "./dropdown.json";
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from './AuthContext';

const UploadTranslat = () => {

  const [file, setFile] = useState(null);
  const { authLevel} = useAuth();
  const [open, setOpen] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const [nodecount, setNodeCount] = useState(null);
  const [columns, setColumns] = useState(['dummy']);
  const [rows, setRows] = useState([]);
  const [viewUploadedData, setViewUploadedData] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  const [formData, setFormData] = useState({
    domain: '',
    datasetCMID: '',
    cmNameColumn: '',
    categoryNamesColumn: '',
    alternateCategoryNamesColumn: '',
    cmidColumn: '',
    keyColumn: '',
  });
  let fileObj= ""
  const [CMIDText, setCMIDText] = useState('The new dataset CMID is pending.');

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
    setNodeCount(resp.rows.length)
    setColumns(resp.rows[0])
    setRows(resp.rows.slice(1));
    setViewUploadedData(true);
    setShowFields(true);
  }
});  
      } else {
        alert('Please upload a valid CSV or XLSX file.');
        e.target.value = null;
        setFile(null);
      }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      setCMIDText("The new and created CMID is 007. Save it for further reference.");
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleclear = () => {
    setFile(null);
    if (document.getElementById('fileInput')) {
      document.getElementById('fileInput').value = '';
    }}

    const [selectedOption, setSelectedOption] = useState('standard');
    const [advselectedOption, setadvSelectedOption] = useState('add_node');

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleadvOptionChange = (event) => {
    setadvSelectedOption(event.target.value);
  };

  const advancedtooltip = [
    { option: 'Adding new node', description: 'Use this if all rows in the spreadsheet are creating a new node and represent a unique node.' },
    { option: 'Adding new uses ties', description: 'Use this if you are adding new uses ties with existing nodes or if you have a mix of new nodes and existing nodes or if you have new nodes that have multiple rows of data that represent each node. This function will aggregate rows by dataset, SocioMapID or ArchaMapID (if present), and Key.' },
    { option: 'Updating existing USES only--add or add to properties ', description: 'Use this if you are updating properties for existing uses ties but not replacing any information.' },
    { option: 'Updating existing USES only--replace one property ', description: 'Use this if you are replacing or removing data from a property. This is only valid for a single property.' },
  ];

  const tooltipContent = (
    <div style={{ maxWidth: '400px' }}>
      <h4>Option Descriptions</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px' }}>Option</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {advancedtooltip.map((category, index) => (
            <tr key={index}>
              <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{category.option}</td>
              <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{category.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const [selectedColumns, setSelectedColumns] = useState({
    CMName: false,
    Name: false,
    Key: false,
    label: false,
    datasetID: false,
  });

  const [missingColumns, setMissingColumns] = useState([]);

  useEffect(() => {
    const requiredColumns = ['CMName', 'Name', 'Key', 'label', 'datasetID'];
    const foundColumns = [];
    const notFoundColumns = [];

    requiredColumns.forEach((column) => {
      if (columns.includes(column)) {
        foundColumns.push(column);
      } else {
        notFoundColumns.push(column);
      }
    });

    setSelectedColumns({
      CMName: foundColumns.includes('CMName'),
      Name: foundColumns.includes('Name'),
      Key: foundColumns.includes('Key'),
      label: foundColumns.includes('label'),
      datasetID: foundColumns.includes('datasetID'),
    });
    setMissingColumns(notFoundColumns);
  }, [columns]);

  const [addiColumns, setaddiColumns] = useState({
    district: false,
    recordyear: false,
  });

  const handleCheckboxChange = (event) => {
    setaddiColumns({
      ...addiColumns,
      [event.target.name]: event.target.checked,
    });
  };

  const handleviewCheckboxChange = (event) => {
    setViewUploadedData(event.target.checked);
    };

    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 3 }} style={{marginBottom:"50px"}}>
      <h4 style={{ color: 'black', padding: "2px" }}>Create new dataset if necessary</h4>
      <br />
        <Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white', 
        '&:hover': {
          backgroundColor: 'green', 
        },
      }}  onClick={handleOpen}>
          CREATE NEW DATASET
        </Button>
        <Typography variant="body2" color="textSecondary" sx={{backgroundColor: 'lightblue', padding: '1em',borderRadius: '4px',display: 'inline-block',marginLeft:"10px"}}>
          {CMIDText}
        </Typography>
      </Box>
      <Typography variant="h6" style={{fontWeight:"bolder"}}>
        Use translated file or import file to upload
        </Typography>
      <Divider sx={{ my: 3 }} />
      <Box sx={{ mb: 2 }}>
      <h3 style={{ color: 'black', fontWeight: "bold", padding: "2px" }}> Choose file to import</h3>

      <input id="fileInput" style={{ color: 'black', fontWeight: "bold", marginLeft: 7, padding: "2px" }} type="file" accept=".csv, .xlsx" onChange={handleFileChange} />
      <Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white', 
        '&:hover': {
          backgroundColor: 'green', 
        },
      }} onClick={handleclear}>
        Reset imported file
      </Button>
      </Box>
      {showFields && <Typography variant="body2">{`Number of nodes to import: ${nodecount}`}</Typography>}
      <FormControlLabel
        control={<Checkbox checked={viewUploadedData} onChange={handleviewCheckboxChange} name="viewUploadedData" />}
        label="View uploaded data?"
        sx={{ my: 2 }}
      />

{viewUploadedData && rows.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column, index) => (
                  <TableCell key={index}>{column}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}
<br />
<h4 style={{ color: 'black', padding: "2px" }}>Choose :</h4>
      <RadioGroup defaultValue="standard" name="uploadOption" sx={{ mb: 2 }} onChange={handleOptionChange}>
        <FormControlLabel value="standard" control={<Radio />} label="Standard" />
        <FormControlLabel value="advanced" control={<Radio />} label="Advanced" />
      </RadioGroup>

      {showFields && selectedOption === "standard" && (
        <Box sx={{ mt: 3 }}>
        <Box sx={{ mb: 2 }}>
          <InputLabel id="domain-label" style={{color:"black "}}>Please select the <strong>domain of categories</strong> to be uploaded:</InputLabel>
          <br />
          <Select
            labelId="domain-label"
            id="domain"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            sx={{width: 300,height:40 }}
            margin="normal"
          >
            {Object.keys(doptions).map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
          </Select>
          </Box>
          <br />
          <Box sx={{ mb: 2 }}>
          <InputLabel id="domain-label" style={{color:"black "}}>Enter the <strong>Dataset CMID</strong></InputLabel>
          <TextField
            name="datasetCMID"
            value={formData.datasetCMID}
            onChange={handleChange}
            sx={{width: 300,height:40 }}
            variant="outlined"
            margin="normal"
          />
          </Box>
          <br />
          <Box sx={{ mb: 2 }}>
          <InputLabel id="domain-label" style={{color:"black "}}>Choose which column is the <strong>CMName</strong> of <br /> the new or existing node/category:</InputLabel>
          <br />
          <Select
            labelId="domain-label"
            id="domain"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            sx={{width: 300,height:40 }}
            margin="normal"
          >
          {columns.map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
          </Select>
           </Box>
           <br />
           <Box sx={{ mb: 2 }}>
          <InputLabel id="domain-label" style={{color:"black "}}>Choose which column(s) contain the <br /> <strong>category names</strong> from the dataset (if blank <br /> the CMName will be used):</InputLabel>
          <br />
          <Select
            labelId="domain-label"
            id="domain"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            sx={{width: 300,height:40 }}
            margin="normal"
          >
          {columns.map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
          </Select>
           </Box>
           <br />
           <Box sx={{ mb: 2 }}>
          <InputLabel id="domain-label" style={{color:"black "}}>Choose which column(s) contain the<br /> <strong>alternate category names</strong> from the<br /> dataset (separate multiple names using a <br /> semicolon):</InputLabel>
          <br />
          <Select
            labelId="domain-label"
            id="domain"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            sx={{width: 300,height:40 }}
            margin="normal"
          >
          {columns.map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
          </Select>
            </Box>
            <br />
            <Box sx={{ mb: 2 }}>
          <InputLabel id="domain-label" style={{color:"black "}}>Choose which column is the <strong>CMID</strong> of the <br /> node/category or leave blank if all <br /> categories are new: </InputLabel>
          <br />
          <Select
            labelId="domain-label"
            id="domain"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            sx={{width: 300,height:40 }}
            margin="normal"
          >
          {columns.map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
          </Select>
           </Box>
           <br />
           <Box sx={{ mb: 2 }}>
          <InputLabel id="domain-label" style={{color:"black "}}>Choose which column is the <strong>key</strong> (unique <br /> ID) of the node/category:</InputLabel>
          <br />
          <Select
            labelId="domain-label"
            id="domain"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            sx={{width: 300,height:40 }}
            margin="normal"
          >
          {columns.map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
          </Select>
        </Box>
        </Box>
      )}
      {showFields && selectedOption === "advanced" && (
        <Box sx={{ mb: 2 }}>
        <h4 style={{ color: 'black', padding: "2px" }}>Select option<Tooltip title={tooltipContent} arrow>
        <Button  startIcon={<InfoIcon sx={{ height: '24px', width: '24px' }} />}>
        </Button>
      </Tooltip></h4>
      <RadioGroup defaultValue="add_node" name="advuploadOption" sx={{ mb: 2 }} onChange={handleadvOptionChange}>
        <FormControlLabel value="add_node" control={<Radio />} label="Adding new node for every row" />
        <FormControlLabel value="add_uses" control={<Radio />} label="Adding new uses ties (with old or new nodes)" />
        <FormControlLabel value="update_add" control={<Radio />} label="Updating existing USES only--add or add to properties" />
        <FormControlLabel value="update_replace" control={<Radio />} label="Updating existing USES only--replace one property" />
      </RadioGroup>

      <FormControl component="fieldset" sx={{ mb: 2 }}>
      {missingColumns.length > 0 && (
        <Typography color="red !important" variant="body2" sx={{ mb: 2 }}>
          Error: Missing the following required columns: {missingColumns.join(', ')}
        </Typography>
      )}
      <h4 style={{ color: 'black', padding: "2px" }}>Required Columns:</h4>
      <FormGroup>
        {Object.keys(selectedColumns).map((column) => (
          <FormControlLabel
            key={column}
            control={
              <Checkbox
                checked={selectedColumns[column]}
                disabled={true} // Grays out and disables the checkbox
              />
            }
            label={column}
          />
        ))}
      </FormGroup>
    </FormControl>
    <br />
    <FormControl component="fieldset" sx={{ mb: 2 }}>
    <h4 style={{ color: 'black', padding: "2px" }}>Add from Dataset Properties:</h4>
      <FormGroup>
        <FormControlLabel
          value="district"
          control={<Checkbox checked={selectedColumns.CMName} onChange={handleCheckboxChange} name="district" />}
          label="area"
        />
        <FormControlLabel
          value="recordyear"
          control={<Checkbox checked={selectedColumns.Name} onChange={handleCheckboxChange} name="recodyear" />}
          label="record year"
        />
      </FormGroup>
    </FormControl>
   
      </Box>
      )}
      <Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white', 
        '&:hover': {
          backgroundColor: 'green', 
        },
      }}  onClick={handleSubmit}>
        UPLOAD
      </Button>
      <DatasetForm open={open} handleClose={handleClose} />
    </Box>
  );
}

export default UploadTranslat;