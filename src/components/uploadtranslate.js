import React, { useState, useEffect } from 'react'
import { Box, Button, FormControlLabel, Radio, RadioGroup, Checkbox, Typography, Divider,Select,TextField,MenuItem,InputLabel,FormControl, FormGroup,Table, TableBody, TableCell, TableContainer, TableHead, TableRow,TablePagination, Paper } from '@mui/material';
import DatasetForm from './uploadtranslateform';
import {ExcelRenderer} from 'react-excel-renderer';
import doptions from "./dropdown.json";
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from './AuthContext';
import { Dialog, DialogContent } from '@mui/material';

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
  const [jsonData, setJsondata] = useState([]);
  const [linkContext, setLinkContext] = useState([]);
  const [formData, setFormData] = useState({
    domain: '',
    datasetID: '',
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

//   const handleFileChange = (e) => {
//     const fileType = e.target.files[0].type;
//       if (fileType === 'application/vnd.ms-excel' || fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
//         setFile(e.target.files[0]);
//         fileObj = e.target.files[0];

// ExcelRenderer(fileObj, (err, resp) => {
//   if(err){
//     console.log(err);            
//   }
//   else{
//     setNodeCount(resp.rows.length)
//     setColumns(resp.rows[0])
//     setRows(resp.rows.slice(1));
//     const table = rows.map((row, index) => {
//       const rowData = {};
//       columns.forEach((column, columnIndex) => {
//         rowData[column] = row[columnIndex];
//       });
//       rowData['key'] = index + 1;
//       return rowData;
//     });
//     console.log(table)
//     setJsondata(table)
//     setViewUploadedData(true);
//     setShowFields(true);
//   }
// });  
//       } else {
//         alert('Please upload a valid CSV or XLSX file.');
//         e.target.value = null;
//         setFile(null);
//       }
//   };

const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const fileType = file.type;
  if (
      fileType === 'application/vnd.ms-excel' || 
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
      setFile(file);
      const fileObj = file;

      try {
          const resp = await new Promise((resolve, reject) => {
              ExcelRenderer(fileObj, (err, resp) => {
                  if (err) {
                      reject(err);
                  } else {
                      resolve(resp);
                  }
              });
          });

          setNodeCount(resp.rows.length);
          setColumns(resp.rows[0]);
          setRows(resp.rows.slice(1));

          const table = resp.rows.slice(1).map((row, index) => {
              const rowData = {};
              resp.rows[0].forEach((column, columnIndex) => {
                  rowData[column] = row[columnIndex];
              });
              rowData['key'] = index + 1;
              return rowData;
          });

          console.log(table);

          await new Promise((resolve) => {
              setJsondata(table);
              setViewUploadedData(true);
              setShowFields(true);
              resolve();
          });
      } catch (error) {
          console.error(error);
          alert('Error processing file: ' + error.message);
      }
  } else {
      alert('Please upload a valid Excel file (CSV or XLSX).');
      e.target.value = null;
      setFile(null);
  }
};

  const handleChange = (e) => {
    console.log(e.target)
    const { name, value } = e.target;
    console.log(name)
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      console.log(jsonData)
      const response = await fetch("https://catmapper.org/api/uploadInputNodes",{
      //const response = await fetch("http://127.0.0.1:5001/uploadInputNodes", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData : formData,
          database : "sociomap",
          df : jsonData,
          so : selectedOption,
          ao: advselectedOption,
          addoptions: addiColumns,
          user : localStorage.getItem("userid"),
          linkContext : linkContext
        }),
      });

      const result = await response.text();
      setCMIDText(result);
      setPopen(true);

    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const [popen, setPopen] = useState(false);

  const handlePclose = () => {
    setPopen(false);
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

  const [selectedColumns, setSelectedColumns] = useState({});
  const [missingColumns, setMissingColumns] = useState([]);
  const [extraColumns, setExtraColumns] = useState([]);
  const [selectedExtraColumn, setSelectedExtraColumn] = useState('');
  const [allRequiredColumnsFound, setAllRequiredColumnsFound] = useState(false);

  const allowedExtraColumns = [
    'altName', 'ApplicableYears', 'categoryType', 'CMID', 'CMName', 'country', 
    'Dataset', 'DatasetCitation', 'DatasetLocation', 'DatasetScope', 
    'DatasetVersion', 'dateEnd', 'dateStart', 'descriptor', 'district', 
    'District', 'eventDate', 'eventType', 'FIPS', 'geoCoords', 'geoPolygon', 
    'glottocode', 'ignoreNames', 'ISO2', 'ISO3', 'ISONumeric', 'Key', 'label', 
    'language', 'latitude', 'log', 'longitude', 'Name', 'Note', 'parent', 
    'parentContext', 'populationEstimate', 'project', 'propertyValues', 
    'rawDate', 'recordEnd', 'recordStart', 'religion', 'Rfunction', 'role', 
    'Rtransform', 'sampleSize', 'shortName', 'Subdistrict', 'Subnational', 
    'text', 'transform', 'Unit', 'url', 'variableDescription', 'yearEnd', 
    'yearStart'
  ];

  useEffect(() => {
    setSelectedColumns({});
    setMissingColumns([]);
    setExtraColumns([]);
    setAllRequiredColumnsFound(false);

    let required = [];

  switch (advselectedOption) {
    case 'add_node':
      required = ['CMName', 'Name', 'Key', 'label', 'datasetID'];
      break;
    case 'add_uses':
      required = ['CMID', 'Name', 'Key', 'label', 'datasetID'];
      break;
    case 'update_add':
    case 'update_replace':
      required = ['CMID', 'Key', 'datasetID'];
      break;
    default:
      required = [];
  }


  const foundColumns = [];
  const notFoundColumns = [];

  required.forEach((column) => {
    if (columns.includes(column)) {
      foundColumns.push(column);
    } else {
      notFoundColumns.push(column);
    }
  });

  setMissingColumns(notFoundColumns);
  setAllRequiredColumnsFound(notFoundColumns.length === 0);

  if (['add_node','add_uses', 'update_add','update_replace'].includes(advselectedOption)) {
    const extraCols = columns
      .filter((col) => !required.includes(col))
      .filter((col) => allowedExtraColumns.includes(col)); 
    setExtraColumns(extraCols);
  } else {
    setExtraColumns([]);
  }

  const selectedColumns = required.reduce((acc, column) => {
    acc[column] = foundColumns.includes(column);
    return acc;
  }, {});

  setSelectedColumns(selectedColumns);
}, [columns, advselectedOption]);

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

    const handleExtraColumnsChange = (event) => {
      setExtraColumns(event.target.value);
      setLinkContext(extraColumns)
    };

    const handleSingleExtraColumnChange = (event) => {
      setSelectedExtraColumn(event.target.value);
      setLinkContext(selectedExtraColumn)
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
            name="datasetID"
            value={formData.datasetID}
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
            name="cmNameColumn"
            value={formData.cmNameColumn}
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
            name="categoryNamesColumn"
            value={formData.categoryNamesColumn}
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
            name="alternateCategoryNamesColumn"
            value={formData.alternateCategoryNamesColumn}
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
            name="cmidColumn"
            value={formData.cmidColumn}
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
            name="keyColumn"
            value={formData.keyColumn}
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
    {["add_node",'add_uses', 'update_add'].includes(advselectedOption) && extraColumns.length > 0 && allRequiredColumnsFound && (
      <div>
      <h4 style={{ color: 'black', padding: "2px" }}>Choose columns to enter as properties:</h4>
        <Select
          multiple
          value={extraColumns}
          onChange={handleExtraColumnsChange}
          renderValue={(selected) => selected.join(', ')}
        >
          {extraColumns.map((col) => (
            <MenuItem key={col} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
        </div>
      )}
    <br />
    {advselectedOption === 'update_replace' && extraColumns.length > 0 && allRequiredColumnsFound && (
      <div>
        <h4 style={{ color: 'black', padding: "2px" }}>Choose column to replace property:</h4>
        <br />
        <Select
          value={selectedExtraColumn}
          onChange={handleSingleExtraColumnChange}
          style={{width:"7vw"}}
        >
          {extraColumns.map((col) => (
            <MenuItem key={col} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
        </div>
      )}
      <br />
    <FormControl component="fieldset" sx={{ mb: 2 }}>
    <h4 style={{ color: 'black', padding: "2px" }}>Add from Dataset Properties:</h4>
      <FormGroup>
        <FormControlLabel
          value="district"
          control={<Checkbox checked={addiColumns.district} onChange={handleCheckboxChange} name="district" />}
          label="area"
        />
        <FormControlLabel
          value="recordyear"
          control={<Checkbox checked={addiColumns.recordyear} onChange={handleCheckboxChange} name="recordyear" />}
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
      <Dialog open={popen} onClose={handlePclose}>
        <DialogContent>
          <p>{CMIDText}</p>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default UploadTranslat;