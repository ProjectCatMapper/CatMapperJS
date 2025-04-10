import React, { useEffect, useState } from 'react';
import doptions from "./dropdown.json";
import aoptions from "./dropdown_archamap.json";
import {Select, MenuItem } from '@mui/material';
import {ExcelRenderer} from 'react-excel-renderer';
import Button from '@mui/material/Button';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,  TablePagination, Typography, Box,FormControlLabel,Checkbox } from '@mui/material';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import TranslateTable from './translate_Categories';
import Backdrop from '@mui/material/Backdrop';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import './sociotranslate.css'
import Divider from '@mui/material/Divider';
import image from '../assets/white.png'
import { Link } from 'react-router-dom'
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import { Dialog, DialogTitle, DialogContent, DialogActions} from "@mui/material";

function Sociotranslate(){

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


  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [zeroDropdownValue, setZeroDropdownValue] = useState([]);
  const [firstDropdownValue, setFirstDropdownValue] = useState("ANY DOMAIN");
  const [secondDropdownValue, setsecondDropdownValue] = useState([]);
  const [thirdDropdownValue, setthirdDropdownValue] = useState([""]);
  const [fourthDropdownValue, setfourthDropdownValue] = useState([""]);
  const [fifthDropdownValue, setfifthDropdownValue] = useState([""]);
  const [svalues, setsvalues] = useState(["Name","SocioMapID"]);
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [tcategories, setTcategories] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isCheckedtwo, setIsCheckedtwo] = useState(false);
  const [isCheckedthree, setIsCheckedthree] = useState(false);
  const [isCheckedfour, setIsCheckedfour] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  let fileObj= ""
  const [filename, setFilename] = useState("");
  let selectedColumnValues = ""
  const [jsonData, setJsondata] = useState();
  let query = "false"

  const [isRowsChecked, setIsRowsChecked] = useState(false);

  const handleRowsChange = (event) => {
    setIsRowsChecked(event.target.checked);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);}
  
const handleCheckboxChangetwo = () => {
      setIsCheckedtwo(!isCheckedtwo);}

const handleCheckboxChangethree = () => {
        setIsCheckedthree(!isCheckedthree);}

const handleCheckboxChangefour = () => {
        setIsCheckedfour(!isCheckedfour);}

const [data, setData] = useState({});
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

const handleClick = async () => {
  setLoading(true);
  setProgress(10);
  console.log(jsonData)
  try {
    selectedColumnValues = rows.map((row) => row[columns.indexOf(zeroDropdownValue)]);
    setProgress(20);
    //const response = await fetch("http://127.0.0.1:5001/translate2", {
    const response = await fetch("https://catmapper.org/api/translate2", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        database : database,
        property : secondDropdownValue,
        domain : firstDropdownValue,
        key : String(isCheckedfour),
        term : zeroDropdownValue,
        country : thirdDropdownValue,
        context : fourthDropdownValue,
        dataset : fifthDropdownValue,
        yearStart : inputValue,
        yearEnd : inputValuetwo,
        table : jsonData,
        query : query,
        uniqueRows: isRowsChecked
      }),
    });

    setProgress(50);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    console.log(zeroDropdownValue)

    const responseData = await response.json();
    setData(responseData);
    // data.sort((a, b) => a.term.localeCompare(b.term));
    setColumns(Object.keys(responseData[0]))
    setRows(responseData.map((row) => Object.values(row)))

    setProgress(80);

    const matchTypeCounts = responseData.reduce((acc, row) => {
      const matchType = row['matchType_'+zeroDropdownValue]
      acc[matchType] = acc[matchType] ? acc[matchType] + 1 : 1;
      return acc;
    }, {});

    console.log(matchTypeCounts)

    const total = responseData.length;
    const matchTypePercentages = Object.keys(matchTypeCounts).reduce((acc, key) => {
      acc[key] = (matchTypeCounts[key] / total * 100).toFixed(2) + '%';
      return acc;
    }, {});

    setTcategories(matchTypePercentages);
    setProgress(100)
    console.log("its over")
    
  } catch (error) {
    console.error('Error sending POST request:', error);
  }
  finally {
    setLoading(false);
    setProgress(0);
  }
};

const handleClicktwo = () => {const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  const date = new Date().toISOString().split('T')[0];
  const customFileName = `${filename}_Matched_${date}.xlsx`;

  saveAs(blob, customFileName);};

const handleclear = () => {
  setSelectedFile(null);
  if (document.getElementById('fileInput')) {
    document.getElementById('fileInput').value = '';
  }}


const [inputValue, setinputValue] = useState(-4000);
const [inputValuetwo, setinputValuetwo] = useState(2024);        

const handleFileChange = (event) => {
      const fileType = event.target.files[0].type;
      setFilename(event.target.files[0].name.split('.').slice(0, -1).join('.'));
      if (fileType === 'application/vnd.ms-excel' || fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        // File is either CSV or XLSX
        setSelectedFile(event.target.files[0]);
        fileObj = event.target.files[0];

ExcelRenderer(fileObj, (err, resp) => {
  if(err){
    console.log(err);            
  }
  else{
    const firstRow = resp.rows[0];
        const column_check = [];

        try {
          for (let i = 0; i < firstRow.length; i++) {
            if (firstRow[i] === undefined || firstRow[i].trim() === "") {
              throw new Error(`Missing column name at index ${i}`);
            }
            column_check.push(firstRow[i]);
          }
        } catch (err) {
          setError(err.message);
        }


    setColumns(column_check);


    const processedRows = resp.rows.slice(1).map(row => {
      const fullRow = Array(column_check.length).fill(null);
      row.forEach((cell, index) => {
        if (typeof cell === 'string') {
          cell = cell.replace(/^['"]|['"]$/g, '');
        }
        fullRow[index] = cell !== undefined ? cell : null;
      });
      return fullRow;
    });

    const filteredRows = processedRows.filter(row => {
      return row.some(cell => cell !== null && cell !== '');
    });


    setRows(filteredRows);

    const table = filteredRows.map((row, index) => {
      const rowData = {};
      column_check.forEach((column, columnIndex) => {
        rowData[column] = row[columnIndex];
      });
      //rowData['key'] = index + 1;
      return rowData;
    });
    setJsondata(table)
  }
});  
      } else {
        // Invalid file type
        alert('Please upload a valid CSV or XLSX file.');
        event.target.value = null; // Clear the file input
        setSelectedFile(null);
      }
  };

  const getRowStyle = (row) => {
    const statusIndex = columns.findIndex(col => col === 'matchType_'+zeroDropdownValue);
    const status = row[statusIndex];

    console.log(row)
  
    return getClassForStatus(status);
  };

  const getClassForStatus = (status) => {

    if (status === undefined) {
      return 'color-undefined';
    }
    console.log(status)
    status = (status && typeof status === "string") ? status.trim() : status;

    switch (status) {
      case 'exact match':
        return 'exact-matches';
      case 'fuzzy match':
        return 'fuzzy-matches';
      case 'one-to-many':
        return 'one-to-many';
      case 'many-to-one':
        return 'many-to-one';
      case "none":
        return "none";
      default:
        return '';
    }
  };

  const ProgressBar = ({ progress }) => (
    <Box display="flex" alignItems="right" width="15%" style={{ position: 'absolute', bottom: '10px', right: '10px', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
      <Box width="80%" mr={1}>
        <LinearProgress variant="determinate" value={progress} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`translating ${progress}%`}</Typography>
      </Box>
    </Box>
  );

  const menuItems = sections.flatMap((section, index) => [
    index > 0 ? <Divider key={`divider-${section.label}`} /> : null,
    ...section.keys.map((key, idx) => (
      <MenuItem
        key={key}
        value={key}
        sx={idx === 0 ? { fontWeight: 'bold', backgroundColor: '#f0f0f0' } : {}}
      >
        {key}
      </MenuItem>
    ))
  ]).filter(Boolean);

  useEffect(() => {
    if (database === "SocioMap") {
    setsvalues(doptions[firstDropdownValue])
  }
    else{
      setsvalues(aoptions[firstDropdownValue])
    }
  }, [firstDropdownValue])

  const Terminology = [
    { label: 'Choose column to match', description: 'Which column in the input dataset do you want to find matches for in CatMapper' },
    { label: 'Select category domain', description: 'From which category domain do you want to find matches?' },
    { label: 'Property to match', description: 'For the column you are matching, is it a Name, a CMID, a Key, or some other property? For beginners this will be Name.' },
    { label: 'Limit by Country', description: 'This permits limiting matches to categories associated with a specific country.  This requires a column with the CMID for the country.' },
    { label: 'Limit by Contex', description: 'This permits limiting matches to categories that are contained by specific contexts (e.g. only counties in Ohio).  This requires a column with the CMID for the context (e.g. Ohio).' },
    { label: 'Limit by Dataset', description: 'This permits limiting matches to categories used by a specific dataset.  This requires a column with the CMID for the datasetID.' },
  ];

  const tooltipContent = (
    <div style={{ maxWidth: '400px' }}>
      <h4>Terminology Descriptions</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px' }}>Label</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {Terminology.map((category, index) => (
            <tr key={index}>
              <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{category.label}</td>
              <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{category.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );


  return (
    <Box sx={{ backgroundColor: 'black', opacity: 1,flexGrow: 1  }} >
    <div  style={{width:"26%",height:"90%", backgroundColor : '#e0e0e0', padding: '20px',border: '1px solid #ccc',borderRadius : '10px', margin: '10px', overflow:"auto",position:"absolute"}}>
      <h3 style={{ color: 'black', fontWeight: "bold", marginLeft: 7, padding: "2px" }}> Choose file to import</h3>
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
      <br/>
      <br/>
      {selectedFile !== null && (
        <div>
          <p style={{ color: 'White', fontWeight: "bold", marginLeft: 7, padding: "2px" }}>Choose column to match</p>     
          <Select
          label="Zero Dropdown"
          style={{height:40}}
          value={zeroDropdownValue}
          sx={{ m: 1, width: "12vw" }}
          onChange={(event) => setZeroDropdownValue(event.target.value)}>
         {columns.map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
        </Select>
        </div>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
  <p style={{ color: 'White', fontWeight: "bold", marginLeft: 7, padding: "2px" }}>
    Select category domain
  </p>
  <Tooltip title={tooltipContent} arrow>
    <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
  </Tooltip>
</Box> 
      <Select
          label="First Dropdown"
          value={firstDropdownValue}
          style={{height:40}}
          sx={{ m: 1, width: "12vw" }}
          onChange={(event) => setFirstDropdownValue(event.target.value)}>
         {/* {Object.keys(doptions).map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))} */}
             {menuItems}
        </Select>
        <br/>
        <p style={{ color: 'White', fontWeight: "bold", marginLeft: 7, padding: "2px" }}>Property to search</p>     
      <Select
          label="Second Dropdown"
          value={secondDropdownValue}
          style={{height:40}}
          sx={{ m: 1, width: "12vw" }}
          onChange={(event) => setsecondDropdownValue(event.target.value)}>
          {svalues.map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
        </Select>
        <br/>
        <label>
        <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
        Limit by Country?
      </label>

      {selectedFile !== null && isChecked && (
        <div>
          <p style={{ color: 'White', fontWeight: "bold", marginLeft: 7, padding: "2px" }}>Select column with Country IDs</p>
          <Select
          label="Third Dropdown"
          style={{height:40}}
          value={thirdDropdownValue}
          sx={{ m: 1, width: "12vw" }}
          onChange={(event) => setthirdDropdownValue(event.target.value)}>
          {columns.map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
          </Select>
        </div>
      )}
      <br/>
      <br/>
        <label>
        <input type="checkbox" checked={isCheckedtwo} onChange={handleCheckboxChangetwo} />
        Limit by Context?
      </label>

      {selectedFile !== null && isCheckedtwo && (
        <div>
          <p style={{ color: 'White', fontWeight: "bold", marginLeft: 7, padding: "2px" }}>Select Column with context IDs</p>
          <Select
          label="Fourth Dropdown"
          style={{height:40}}
          value={fourthDropdownValue}
          sx={{ m: 1, width: "12vw" }}
          onChange={(event) => setfourthDropdownValue(event.target.value)}>
          {columns.map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
          </Select>
        </div>
      )}
      <br/>
      <br/>
        <label>
        <input type="checkbox" checked={isCheckedthree} onChange={handleCheckboxChangethree} />
        Limit by Dataset?
      </label>

      {selectedFile !== null && isCheckedthree && (
        <div>
          <p style={{ color: 'White', fontWeight: "bold", marginLeft: 7, padding: "2px" }}>Select column with Dataset IDs</p>
          <Select
          label="Fifth Dropdown"
          style={{height:40}}
          value={fifthDropdownValue}
          sx={{ m: 1, width: "12vw" }}
          onChange={(event) => setfifthDropdownValue(event.target.value)}>
          {columns.map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
          </Select>
          <br/>
      <label>
        <input type="checkbox" checked={isCheckedfour} onChange={handleCheckboxChangefour} />
        Return Dataset Keys?
      </label>
      <br/>
        </div>
      )}
      <br/>
      <br/>
      <p style={{ color: 'White', fontWeight: "bold", marginLeft: 7, padding: "2px" }}>Time range (years)</p>
      <p style={{ color: 'White', fontWeight: "bold", marginLeft: 7, padding: "2px" }}>from &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; to</p>
      <input
        type="text"
        id="myTextbox"
        style={{height:30,width:70}}
        value={inputValue}
        onChange={(event) => setinputValue(event.target.value)}
      />
      <input
        type="text"
        id="myTextbox"
        style={{height:30,width:70,marginLeft:7}}
        value={inputValuetwo}
        onChange={(event) => setinputValuetwo(event.target.value)}
      />
      <br/>
      <br/>
      <Backdrop style={{ color: '#fff', zIndex: 1300 }} open={loading}>
        <div>
          <CircularProgress color="inherit" />
          <Typography variant="h6" align="center" style={{ marginTop: '10px' }}>
            Translating...
          </Typography>
        </div>
        {loading && <ProgressBar progress={progress} />}
      </Backdrop>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {/* Title next to the checkbox */}
      <Typography variant="body1" sx={{ marginRight: 2, color: 'black', fontWeight: 500 }}>
        Unique Rows?
      </Typography>

      <FormControlLabel
        control={
          <Checkbox
            checked={isRowsChecked}
            onChange={handleRowsChange}
            name="checkboxButton"
            color="default"  // Optional: color can be changed
            sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}  // Adjust checkbox size
          />
        }
        label=""
      />
    </Box>
      <Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white', 
        '&:hover': {
          backgroundColor: 'green', 
        },
      }} onClick={handleClick}>
        Search
      </Button>
      <br/>
      <TranslateTable categories={tcategories} />
      <br/>
      <Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white', 
        '&:hover': {
          backgroundColor: 'green', 
        },
      }} onClick={handleClicktwo}>
        Download Data
      </Button>
      <Dialog open={Boolean(error)} onClose={() => setError(null)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>{error}</DialogContent>
        <DialogActions>
          <Button onClick={() => setError(null)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
    <div style={{top:100,width:"72%", height:"90%", backgroundColor:"white", padding: '20px',border: '1px solid #ccc',borderRadius : '10px', marginLeft: "27%",position:"absolute",overflow: 'auto'}}>
    {columns.length > 0 && rows.length > 0 && (
        <>
          <TableContainer component={Paper} sx={{ width: '100%', overflow: 'auto' }}>
            <Table id="myTable">
              <TableHead>
                <TableRow>
                  {columns.map((col, index) => (
                    <TableCell key={index}>{col}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : rows
                ).map((row, rowIndex) => (
                  <TableRow key={rowIndex}  className={getRowStyle(row)} >
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 45 * emptyRows }}>
                    <TableCell colSpan={columns.length} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination id='pagination'
            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
      </div>
      <div style={{top:1070,width:"100%", height:"10%", backgroundColor:"black", padding: '20px',position:"absolute"}}>
      <Divider sx={{ marginLeft:1,marginRight:1, backgroundColor: 'white' }} />

<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, mb:0 }}>
  <img src={image} alt="CatMapper Logo" style={{ height: 80 }} />
  <Box>
    <Link  id="catmapperfooter" to="/people"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>People</Link>
    <Link to="/news" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>News</Link>
    <Link to="/funding" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Funding</Link>
    <Link to="/citation" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Citation</Link>
    <Link to="/terms" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Terms</Link>
    <Link to="/contact" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Contact</Link>
  </Box>
</Box>      </div>
    </Box>
    
  );
};

export default Sociotranslate;