import { useState, useEffect } from 'react'
import { Box, Button, FormControlLabel, Radio, RadioGroup, Checkbox, Typography, Divider,Select,TextField,MenuItem,InputLabel,FormControl, FormGroup,Table, TableBody, TableCell, TableContainer, TableHead, TableRow,TablePagination, Paper, Snackbar, Alert  } from '@mui/material';
import DatasetForm from './uploadtranslateform';
import {ExcelRenderer} from 'react-excel-renderer';
import domainOptions from "./dropdown.json";
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from './AuthContext';
import { LinearProgress } from '@mui/material';
import { Dialog, DialogContent,DialogActions, DialogContentText, DialogTitle } from '@mui/material';
import * as XLSX from 'xlsx';
import { useLocation } from 'react-router-dom';

const UploadTranslat = () => {

  const [file, setFile] = useState(null);
  const { user,authLevel} = useAuth();
  const [open, setOpen] = useState(false);
  const [node_open, setNodeOpen] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const [IsDataset, setIsDataset] = useState(false);
  const [nodecount, setNodeCount] = useState(null);
  const [columns, setColumns] = useState(['dummy']);
  const [rows, setRows] = useState([]);
  const [viewUploadedData, setViewUploadedData] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  const [jsonData, setJsondata] = useState([]);
  const [linkContext, setLinkContext] = useState([]);
  const [download, setDownload] = useState(null);
  const [error, setError] = useState(null);
  const [fileDownload, setfileDownload] = useState('');
  const [loading, setLoading] = useState(false);
  const [missingCount, setMissingCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    domain: '',
    datasetID: '',
    cmNameColumn: '',
    categoryNamesColumn: '',
    alternateCategoryNamesColumn: '',
    cmidColumn: '',
    keyColumn: '',
  });
  const [CMIDText, setCMIDText] = useState('The new dataset CMID is pending.');
  let required = [];
  let finalProduct = [];
  const foundColumns = [];
  const notFoundColumns = [];

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const handleOpen1 = () => {
    setOpenSnackbar(true);  // Open the snackbar on button click
  };
  const handleClose1 = () => {
    setOpenSnackbar(false); // Close the snackbar after user interaction
  };

  const handlefileDownload = (event) => {
    const value = event.target.value;
    setfileDownload(value);

    switch (value) {
      case 'dataset':
        window.open('https://catmapper.org/templates/dataset.xlsx', '_blank');
        break;
      case 'nodes':
        window.open('https://catmapper.org/templates/nodes.xlsx', '_blank');
        break;
      case 'update_uses':
        window.open('https://catmapper.org/templates/update_uses.xlsx', '_blank');
        break;
      case 'uses':
        window.open('https://catmapper.org/templates/uses.xlsx', '_blank');
        break;
      default:
        break;
    }
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
  setError("")
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

          
          setColumns(resp.rows[0]);
          const filteredRows = resp.rows.slice(1).filter(row => 
            row.some(value => value !== null && value !== undefined && value !== "")
          );
          setRows(filteredRows);

          const table = filteredRows.map((row, index) => {
              const rowData = {};
              resp.rows[0].forEach((column, columnIndex) => {
                  rowData[column] = row[columnIndex];
              });
              rowData['key'] = index + 1;
              return rowData;
          });

          console.log(table)

          setNodeCount(table.length);

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

  const validateColumns = () => {

    if (columns.includes('datasetID')) {
      const datasetIDIndex = columns.indexOf('datasetID');
      const missingValues = rows.some(row => !row[datasetIDIndex]);
      if (missingValues) {
        setError('datasetID column contains missing values.');
        return false;
      }
    }

    if (columns.includes('label')) {
      const labelIndex = columns.indexOf('label');
      const missingValues = rows.some(row => !row[labelIndex]);
      if (missingValues) {
        setError('label column contains missing values.');
        return false;
      }
    }

    if (advselectedOption !== "add_node") {

      if (columns.includes('CMID')) {
      const CMIDIndex = columns.indexOf('CMID');
      const count = rows.filter(row => !row[CMIDIndex]).length;

      if (advselectedOption === "add_uses") {
        return count;
      }

      if (count > 0) {
        setError('CMID column contains missing values.');
        return false;
      }
    }

    }

    if (columns.includes('Key')) {
      const KeyIndex = columns.indexOf('Key');
      const missingValues = rows.some(row => !row[KeyIndex]);
      if (missingValues) {
        setError('Key column contains missing values.');
        return false;
      }
    }

    if (advselectedOption === 'update_replace') {
      if (selectedExtraColumn === 'longitude' && !columns.includes('latitude')) {
        setError('Longitude requires Latitude to be present.');
        return false;
      }
      if (selectedExtraColumn === 'latitude' && !columns.includes('longitude')) {
        setError('Latitude requires Longitude to be present.');
        return false;
      }
      if (selectedExtraColumn === 'eventType' && !columns.includes('parent')) {
        setError('eventType requires parent to be present.');
        return false;
      }
      if (selectedExtraColumn === 'eventDate') {
        if (!columns.includes('parent') || !columns.includes('eventType')) {
          setError('eventDate requires both parent and eventType to be present.');
          return false;
        }
      }
    }
    setError('');
    return true;
  };

  const handleConfirm = (proceed) => {
    setOpenDialog(false);
    if (proceed) {
      continueWithSubmit();
    }
  };

  let database = "SocioMap"
  let dropoptions = domainOptions
  if (useLocation().pathname.includes("archamap")) {
      database = "ArchaMap"
    } 
  
  const fallbackOptions = ["Name", "Key", "CatMapper ID (CMID)"];
  const fieldOptions = dropoptions[formData.domain] || fallbackOptions;

  const handleSubmit = async () => {
    const validationResult = validateColumns();

    if (validationResult === false) {
      return;
    }

    if (typeof validationResult === 'number' && validationResult > 0) {
      setMissingCount(validationResult);
      setOpenDialog(true);
      return;
    }
    continueWithSubmit();
  }

  const continueWithSubmit = async () => {
    setLoading(true);
    setProgress(0);
    try {
      setProgress(30); 

      const columnsToUse = advselectedOption === 'update_replace' || advselectedOption === 'node_replace' ? [selectedExtraColumn] : selectedExtraColumns;

      const allowedColumns = new Set([
        ...Object.keys(selectedColumns).filter(col => selectedColumns[col]),
        ...columnsToUse,
      ]);


      if (advselectedOption === "add_uses" && missingCount > 0) {
        allowedColumns.add("CMName");
      }
      
      const finalProduct = selectedOption === "advanced" 
      ?jsonData.map(item => {
        const filteredItem = {};
      
        allowedColumns.forEach(col => {
          if (item[col] !== undefined) {
            filteredItem[col] = item[col];
          }
        });
      
        return filteredItem;
      }):jsonData;      

      const response = await fetch(`${process.env.REACT_APP_API_URL}/uploadInputNodes`,{
      //const response = await fetch("http://127.0.0.1:5001/uploadInputNodes", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData : formData,
          database : database,
          df : finalProduct,
          so : selectedOption,
          ao: advselectedOption,
          addoptions: addiColumns,
          user : user,
          allContext : columnsToUse
        }),
      });
      setProgress(50); 

      const result = await response.json();

      let orderedData = result.file;

      if (Array.isArray(result.order) && result.order.length > 0) {
        orderedData = result.file.map(row => {
          const orderedRow = {};
          result.order.forEach(col => {
            if (col in row) {
              orderedRow[col] = row[col];
            }
          });
          return orderedRow;
        });
      }

      if (result.error) {
      setProgress(70);
      setCMIDText(result.error);
      setPopen(true);
      setProgress(100);
      } else {
      setProgress(70);
      setDownload(orderedData)      
      setCMIDText(result.message);
      setPopen(true);
      setProgress(100);
      }

      //await fetch("http://127.0.0.1:5001/updateWaitingUSES", {
      await fetch(`${process.env.REACT_APP_API_URL}/updateWaitingUSES`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ database : database }),
      })

    } catch (error) {
      console.error('Error submitting form:', error);
    }
    finally{
      setLoading(false);
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
    { option: 'Updating existing Node properties--add or add to properties ', description: 'Tbf.' },
    { option: 'Updating existing Node properties--replace one property ', description: 'Tbf.' },
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
  const [selectedExtraColumns, setSelectedExtraColumns] = useState([]);
  const [selectedExtraColumn, setSelectedExtraColumn] = useState('');
  const [allRequiredColumnsFound, setAllRequiredColumnsFound] = useState(false);

  let allowedExtraColumns = ["descriptor", "Dataset", "log", "country", "dateEnd", "dateStart", "district", "eventDate", "eventType", 
    "geoCoords", "Key", "label", "latitude", "longitude", "ignoreNames", "Name", "parent","period", "parentContext", "propertyValues", 
    "rawDate", "Rfunction", "Rtransform", "recordEnd", "recordStart", "sampleSize", "transform", "categoryType", "url", "variableDescription", 
    "yearEnd", "yearStart", "language", "populationEstimate", "religion", "geoPolygon","glottocode","FIPS","ISO2","ISO3","ISONumeric","comment","polity","occupation","culture","yearPublished"]
  let allowedDatasetColumns = []

  useEffect(() => {
    if (columns.length === 0 || rows.length === 0) return;

    const cmidColumn = columns.indexOf('CMID');
    if (cmidColumn !== -1) {
        const firstRowCMID = rows[0][cmidColumn];
        setIsDataset(firstRowCMID?.startsWith("SD") || firstRowCMID?.startsWith("AD"));
    }

    setSelectedColumns({});
    setMissingColumns([]);
    setExtraColumns([]);
    setAllRequiredColumnsFound(false);

  switch (advselectedOption) {
    case 'add_node':
      required = ['CMName', 'Name', 'Key', 'label', 'datasetID'];
      const labelIndex = columns.indexOf('label');
      if (labelIndex !== -1) {
        const datasetValueFound = rows.some(row => row[labelIndex] === 'DATASET');
        if (datasetValueFound) {
          required = ['CMName', 'label', 'shortName', 'DatasetCitation'];
          allowedDatasetColumns = ["ApplicableYears", "CMID", "CMName", "DatasetCitation", "DatasetLocation", "DatasetScope", "DatasetVersion",
             "District", "log", "names", "Note", "parent", "project", "shortName", "Subdistrict", "Subnational", "Unit"]

        }
      }
      break;
    case 'add_uses':
      required = ['CMID', 'Name', 'Key', 'label', 'datasetID'];
      break;
    case 'update_add':
    case 'update_replace':
      required = ['CMID', 'Key', 'datasetID'];
      break;
    case 'node_add':
      required=['CMID']
      if (IsDataset){
      allowedExtraColumns = ['parent','District','names',]
      }
      else{
        setNodeOpen(true)
      }
      break;
    case 'node_replace':
      required=['CMID'];
      if (IsDataset){
        allowedDatasetColumns = ["CMName","parent","District","shortName","ApplicableYears","DatasetCitation","DatasetLocation","DatasetVersion","DatasetScope","project","recordStart","recordEnd","yearPublished"]
      }
      else{
        allowedExtraColumns = ["CMName","glottocode","FIPS","ISO2","ISO3","ISONumeric"]
      }
      break;
    default:
      required = [];
  }

  required.forEach((column) => {
    if (columns.includes(column)) {
      foundColumns.push(column);
    } else {
      notFoundColumns.push(column);
    }
  });

  setMissingColumns(notFoundColumns);
  setAllRequiredColumnsFound(notFoundColumns.length === 0);

  if (['add_node','add_uses', 'update_add','update_replace','node_add','node_replace'].includes(advselectedOption)) {
    // const extraCols = columns
    //   .filter((col) => !required.includes(col))
    //   .filter((col) => allowedExtraColumns.includes(col)); 
    let extraCols = columns.filter((col) => !required.includes(col));

    if (allowedDatasetColumns.length > 0) {
      extraCols = extraCols.filter((col) => allowedDatasetColumns.includes(col));
    } else {
      extraCols = extraCols.filter((col) => allowedExtraColumns.includes(col)); 
    }

    if (advselectedOption === 'update_add') {
      extraCols = extraCols.filter((col) => col !== 'label');
  }

    setExtraColumns(extraCols);
    setSelectedExtraColumns(extraCols)
    setLinkContext(extraCols)
  } else {
    setExtraColumns([]);
  }

  const selectedColumns = required.reduce((acc, column) => {
    acc[column] = foundColumns.includes(column);
    return acc;
  }, {});

  setSelectedColumns(selectedColumns);
}, [columns,rows, advselectedOption]);

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
      setSelectedExtraColumns(event.target.value);
      setLinkContext(event.target.value)
    };

    const handleSingleExtraColumnChange = (event) => {
      setSelectedExtraColumn(event.target.value);
      setLinkContext([event.target.value])
    };

    const convertToCSV = (data) => {
      const csvRows = [];
      const headers = Object.keys(data[0]);
      csvRows.push(headers.join(','));

      for (const row of data) {
          const values = headers.map(header => {
              const escaped = ('' + row[header]).replace(/"/g, '\\"');
              return `"${escaped}"`;
          });
          csvRows.push(values.join(','));
      }
      return csvRows.join('\n');
  };
  
    const handleDownload = () => {
      if (!download) {
          setError('No file data available for download.');
          return;
      }

      const worksheet = XLSX.utils.json_to_sheet(download);
    
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dataset');
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'uploaded_Dataset.xlsx';

      // const csvData = convertToCSV(download);
      // const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = 'uploaded_Dataset.csv';

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 3 }} style={{marginBottom:"50px"}}>
      <h4 style={{ color: 'black', padding: "2px" }}>Find upload templates here:</h4>
      <br />
      <FormControl sx={{width: "12vw", mr:"1vw" }}  variant="outlined">
      <InputLabel id="dropdown-label">Download:</InputLabel>
      <Select
        labelId="dropdown-label"
        id="dropdown-select"
        value={fileDownload}
        onChange={handlefileDownload}
        label="Select Option"
      >
        <MenuItem value="dataset">New Dataset Nodes</MenuItem>
        <MenuItem value="nodes">New Category Nodes</MenuItem>
        <MenuItem value="uses">New Uses Ties</MenuItem>
        <MenuItem value="update_uses">Update Uses Ties</MenuItem>
      </Select>
    </FormControl>

        {/* <Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white', 
        '&:hover': {
          backgroundColor: 'green', 
        },
      }}  onClick={handleOpen1}>
          Download Template
        </Button> */}
        {/* <Typography variant="body2" color="textSecondary" sx={{backgroundColor: 'lightblue', padding: '1em',borderRadius: '4px',display: 'inline-block',marginLeft:"10px"}}>
          {CMIDText}
        </Typography> */}
        <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleClose1}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose1} severity="info" sx={{ width: '100%' }}>
          Under Construction
        </Alert>
      </Snackbar>
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
                    {/*{row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}*/}
                    {columns.map((column, columnIndex) => (
              <TableCell key={columnIndex}>
                {row[columnIndex] !== undefined && row[columnIndex] !== null
                  ? row[columnIndex]
                  : ""}
              </TableCell>
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
            {fieldOptions.map((key)  => (
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
        {authLevel === 2 &&<FormControlLabel value="update_add" control={<Radio />} label="Updating existing USES only--add or add to properties" />}
        {authLevel === 2 &&<FormControlLabel value="update_replace" control={<Radio />} label="Updating existing USES only--replace one property" />}
        {authLevel === 2 &&<FormControlLabel value="node_add" control={<Radio />} label="Updating existing Node properties--add or add to properties" />}
        {authLevel === 2 &&<FormControlLabel value="node_replace" control={<Radio />} label="Updating existing Node properties--replace one property" />}
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
    <Snackbar
      open={node_open}
      autoHideDuration={7000}
      onClose={() => setNodeOpen(false)}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={() => setNodeOpen(false)} severity="error" sx={{ width: "100%" }}>
        You cannot add property data for Category Nodes.
      </Alert>
    </Snackbar>

    {error && <p style={{ color: 'red' }}>{error}</p>}

      <Dialog open={openDialog} onClose={() => handleConfirm(false)}>
        <DialogTitle>Missing CMID Values</DialogTitle>
        <DialogContent>
          <DialogContentText>
            CMID column contains {missingCount} missing values, hence {missingCount} new nodes will be created. Do you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirm(false)} color="error">No</Button>
          <Button onClick={() => handleConfirm(true)} color="primary">Yes</Button>
        </DialogActions>
      </Dialog>

    <br />
    {["add_node",'add_uses', 'update_add'].includes(advselectedOption) && extraColumns.length > 0 && allRequiredColumnsFound && (
      <div>
      <h4 style={{ color: 'black', padding: "2px" }}>Choose columns to enter as properties:</h4>
        <Select
          multiple
          value={selectedExtraColumns}
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
      {advselectedOption === 'node_add' && extraColumns.length > 0 && IsDataset && allRequiredColumnsFound && (
      <div>
      <h4 style={{ color: 'black', padding: "2px" }}>Choose columns to enter as properties:</h4>
        <Select
          multiple
          value={selectedExtraColumns}
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
      {advselectedOption === 'node_replace' && extraColumns.length > 0 && allRequiredColumnsFound && (
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
      {error && (
        <Typography sx={{ mb: 2,color:"red !important"}}>
          {error}
        </Typography>
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
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            width: 200,
            backgroundColor: 'white',
            boxShadow: 3,
            padding: 1,
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2">{`Progress: ${progress}%`}</Typography>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}
      
      <Button variant="contained" disabled={!download} sx={{
        backgroundColor: 'black',
        ml:"1vw",
        color: 'white', 
        '&:hover': {
          backgroundColor: 'green', 
        },
      }}  onClick={handleDownload}>
        Download
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