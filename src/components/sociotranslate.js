import { useEffect, useState } from 'react';
import domainOptions from "./dropdown.json";
import {Select, MenuItem } from '@mui/material';
import {ExcelRenderer} from 'react-excel-renderer';
import Papa from 'papaparse';
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

  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [zeroDropdownValue, setZeroDropdownValue] = useState([]);
  const [firstDropdownValue, setFirstDropdownValue] = useState("ANY DOMAIN");
  const [dropdownData, setDropdownData] = useState([]);
  const [subDomainValue, setsubDomain] = useState("");
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  let fileObj= ""
  const [filename, setFilename] = useState("");
  let selectedColumnValues = ""
  const [jsonData, setJsondata] = useState();
  let query = "false"
  const fallbackOptions = ["Name", "Key", "CatMapper ID (CMID)"];

  const [isRowsChecked, setIsRowsChecked] = useState(false);

  const handleRowsChange = (event) => {
    setIsRowsChecked(event.target.checked);
  };

  const [isUniqueRows, setUniqueRows] = useState(false);

  const handleUniqueRows = (event) => {
    setUniqueRows(event.target.checked);
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
    setIsChecked(!isChecked);
    if (isChecked){
      setthirdDropdownValue([""]);
    }
  }
  
const handleCheckboxChangetwo = () => {
      setIsCheckedtwo(!isCheckedtwo);
      if (isCheckedtwo){
      setfourthDropdownValue([""]);
    }
    }

const handleCheckboxChangethree = () => {
        setIsCheckedthree(!isCheckedthree);
        if (isCheckedthree){
      setfifthDropdownValue([""]);
    }
      }

const handleCheckboxChangefour = () => {
        setIsCheckedfour(!isCheckedfour);}

const [data, setData] = useState({});
let database = "SocioMap"
if (useLocation().pathname.includes("archamap")) {
    database = "ArchaMap"
  } 

const handleClick = async () => {
  setLoading(true);
  setProgress(10);
  try {
    selectedColumnValues = rows.map((row) => row[columns.indexOf(zeroDropdownValue)]);
    setProgress(20);
    //const response = await fetch("http://127.0.0.1:5001/translate2", {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        database : database,
        property : secondDropdownValue,
        domain : subDomainValue,
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
      alert('Propose translate was not completed, please check your matching column for unusual characters and please contact the CatMapper team if the issue persists.');
    }

    const responseData = await response.json();

    const allKeys = responseData.order;

    const matchedColumn = zeroDropdownValue;

    const patternPrefixes = [
      'matching_',
      'matchingDistance_',
      'matchType_',
      'CMName_',
      'CMID_',
      'label_',
      'CMcountry_',
    ];

    const suffixColumns = patternPrefixes.map(prefix => prefix + zeroDropdownValue).filter(col => allKeys.includes(col));

    const usedColumns = new Set([matchedColumn, 'CMuniqueRowID', ...suffixColumns]);
    const remainingColumns = allKeys.filter(key => !usedColumns.has(key));
    
    const reorderedColumns = [
      matchedColumn,
      ...suffixColumns,
      'CMuniqueRowID',
      ...remainingColumns
    ];

    setData(responseData.file);
    setColumns(reorderedColumns)
    setRows(responseData.file.map(row => reorderedColumns.map(key => row[key])));
    setProgress(80);

    const matchTypeCounts = responseData.file.reduce((acc, row) => {
      const matchType = row['matchType_'+zeroDropdownValue]
      acc[matchType] = acc[matchType] ? acc[matchType] + 1 : 1;
      return acc;
    }, {});

    const total = responseData.file.length;
    const matchTypePercentages = Object.keys(matchTypeCounts).reduce((acc, key) => {
      acc[key] = (matchTypeCounts[key] / total * 100).toFixed(2) + '%';
      return acc;
    }, {});

    setTcategories(matchTypePercentages);
    setProgress(100)
    
  } catch (error) {
    console.error('Error sending POST request:', error);
  }
  finally {
    setLoading(false);
    setProgress(0);
  }
};

const handleClicktwo = () => {const worksheet = XLSX.utils.json_to_sheet(data,{header:columns});
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
const [inputValueSep, setinputValueSep] = useState(';');

const handleClickSeparator = () => {
  if (!jsonData || !zeroDropdownValue || !inputValueSep) return;

  const newTable = jsonData.flatMap(row => {
    const cellValue = row[zeroDropdownValue];
    if (cellValue == null) return [row]; // keep row as-is if empty

    // Split + trim each part
    const parts = String(cellValue)
      .split(inputValueSep)
      .map(part => part.trim())   // ✅ trim whitespace
      .filter(part => part.length > 0);

    return parts.map(part => ({
      ...row,
      [zeroDropdownValue]: part, // replace with trimmed value
    }));
  });

  setJsondata(newTable);

  const newColumns = Object.keys(newTable[0] || {});
  const newRows = newTable.map(r => Object.values(r));

  setColumns(newColumns);
  setRows(newRows);
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 50 * 1024 * 1024) {
    setError(`File size exceeds 50MB limit.`);
    return;
  }

  const fileName = file.name;
  const fileExtension = fileName.split('.').pop().toLowerCase();
  const baseFileName = fileName.split('.').slice(0, -1).join('.');
  setFilename(baseFileName);
  setSelectedFile(file);

  const processData = (rows) => {
    if (!rows.length) {
      setError('No data found in the file.');
      return;
    }

    const firstRow = rows[0];
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
      return;
    }

    setColumns(column_check);

    const processedRows = rows.slice(1).map((row) => {
      const fullRow = Array(column_check.length).fill(null);
      row.forEach((cell, index) => {
        if (typeof cell === 'string') {
          cell = cell.replace(/^['"]|['"]$/g, '');
        }
        fullRow[index] = cell !== undefined ? cell : null;
      });
      return fullRow;
    });

    const filteredRows = processedRows.filter((row) =>
      row.some((cell) => cell !== null && cell !== "")
    );

    setRows(filteredRows);

    const table = filteredRows.map((row) => {
      const rowData = {};
      column_check.forEach((column, columnIndex) => {
        rowData[column] = row[columnIndex];
      });
      return rowData;
    });

    setJsondata(table);
  };

  if (fileExtension === 'csv') {
    Papa.parse(file, {
      complete: (result) => {
        processData(result.data);
      },
      error: (err) => {
        setError(`CSV Parsing Error: ${err.message}`);
      },
    });
  } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array', dense: true });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const merges = worksheet["!merges"] || [];
      if (merges.length > 0) {
        alert("Merged cells detected. Please unmerge all cells before uploading.")
        return;
      }
    ExcelRenderer(file, (err, resp) => {
      if (err) {
        setError(`Excel Parsing Error: ${err.message}`);
      } else {
        processData(resp.rows);
      }
    });
  } else {
    alert('Please upload a valid CSV or Excel (.xlsx/.xls) file.');
    event.target.value = null;
    setSelectedFile(null);
  }
};

  const getRowStyle = (row) => {
    const statusIndex = columns.findIndex(col => col === 'matchType_'+zeroDropdownValue);
    const status = row[statusIndex];
  
    return getClassForStatus(status);
  };

  const getClassForStatus = (status) => {

    if (status === undefined) {
      return 'color-undefined';
    }
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        //const response = await fetch("http://127.0.0.1:5001/getTranslatedomains?database=" +database,{

        const response = await fetch(`${process.env.REACT_APP_API_URL}/getTranslatedomains?database=`+database, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setDropdownData(data);

        if (data.length > 0) setFirstDropdownValue(data[0].group);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); 

  const secondDropdownOptions = firstDropdownValue
    ? dropdownData.find((item) => item.group === firstDropdownValue)?.nodes || []
    : [];

  useEffect(() => {
    if (secondDropdownOptions.length > 0) {
      setsubDomain(secondDropdownOptions[0]);
    } else {
      setsubDomain("");
    }
  }, [firstDropdownValue, secondDropdownOptions]);


  useEffect(() => {
    setsvalues(domainOptions[firstDropdownValue] || fallbackOptions);
  }, [firstDropdownValue]);

  const getTooltipContent = (num) => {
    const tooltipTexts = {
      1: 'Upload a spreadsheet of category names for an automated proposal of matches to CatMapper categories". See <https://catmapper.org/help/> for more information.',
      2: 'Column in input spreadsheet you want to find matches for in CatMapper?',
      3: 'From which category domain do you want to find matches?',
      4: 'For beginners this will be Name. This allows advanced users to mach by other category properties in CatMapper, such as CatMapper ID or Key.',
      5: 'This permits only finding matches to categories associated with a specific country.  This requires an additional spreadsheet column with the CatMapper ID for the country.',
      6: "This permits only finding matches to categories that are contained by specific contexts (e.g., only counties in Ohio).  This requires an additional spreadsheet column with the CatMapper ID for the context (e.g., Ohio's CatMapper ID in SocioMap is SM2577)",
      7: "This permits only finding matches to categories that are used by a specific dataset (e.g., only language categories used by glottolog 4.4).  This requires an additional spreadsheet column with the CatMapper ID for the dataset (e.g., the CatMapper ID for glottolog 4.4 is SD20)",
      8: 'Specify a time range which matching categories need to fall within.  This uses  information about the years for which a category was observed.',
      9: 'Checking this button… TBD',
      10: "This table provides statistics on the matches, including what % were **exact matches** to only one CatMapper category, **fuzzy matches** to only on CatMapper category, matches to more than one CatMapper category (**one-to-many**), multiple matches to a single CatMapper category (**many-to-one**), and no match found.",
      11: "Press apply to split categories in the selected category domain by the selected separator.  This will create new rows for each split category, and will assign them the same context (e.g., country) as the combined category.",
      12: "Checking this button will combine identical categories from the selected column into a single row for matching, although it will preserve other information if selected. For example, if Country, Context, and/or Dataset is checked then categories will be considered identical only if they have the same spelling and are associated with the same Country, Context, and/or Dataset.  This is useful if your spreadsheet has many identical categories that you want to match only once to speed up processing time and make corrections easier.",
    };

    return tooltipTexts[num];
  };

  return (
    <Box sx={{ backgroundColor: 'black', opacity: 1,flexGrow: 1,display: 'flex',flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, flexGrow: 1 }}>
    <div  style={{width:"26%", backgroundColor : '#e0e0e0', padding: '20px',border: '1px solid #ccc',borderRadius : '10px', overflow:"auto"}}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <p style={{fontWeight: "bold", marginLeft: 7, padding: "2px" }}>Choose spreadsheet to match</p>
        <Tooltip title={getTooltipContent(1)} arrow>
          <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
        </Tooltip>
      </Box>
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
      {selectedFile !== null && (
        <div>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <p style={{ color: 'White', fontWeight: "bold", marginLeft: 7, padding: "2px" }}>Choose spreadsheet column to match</p>
            <Tooltip title={getTooltipContent(2)} arrow>
              <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
            </Tooltip>
          </Box>   
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
        <p style={{ color: 'White', fontWeight: "bold", marginLeft: 7, padding: "2px" }}>Select category domain</p>
        <Tooltip title={getTooltipContent(8)} arrow>
          <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
        </Tooltip>
      </Box>
      <Select
          label="First Dropdown"
          value={firstDropdownValue}
          style={{height:40}}
          sx={{ m: 1, width: "12vw" }}
          onChange={(event) => setFirstDropdownValue(event.target.value)}>
             {dropdownData.map((key, index) => (
        <MenuItem key={index} value={key.group}>
          {key.group}
        </MenuItem>
      ))}
        </Select>
        {secondDropdownOptions.length > 1 && (
        <>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <p style={{ color: 'White', fontWeight: "bold", marginLeft: 7, padding: "2px" }}>Select category sub-domain</p>
        <Tooltip title={getTooltipContent(3)} arrow>
          <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
        </Tooltip>
      </Box> 
      <Select
          label="Sub Dropdown"
          value={subDomainValue}
          style={{height:40}}
          sx={{ m: 1, width: "12vw" }}
          onChange={(event) => setsubDomain(event.target.value)}>
             {secondDropdownOptions.map((key, index) => (
        <MenuItem key={index} value={key}>
          {key}
        </MenuItem>
      ))}
        </Select>
        </>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <p style={{ color: 'White', fontWeight: "bold", marginLeft: 7, padding: "2px" }}>CatMapper Property to Search</p> 
          <Tooltip title={getTooltipContent(4)} arrow>
            <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
          </Tooltip>
        </Box>
      <Select
          label="Second Dropdown"
          value={secondDropdownValue}
          style={{height:40}}
          sx={{ m: 1, width: "12vw" }}
          onChange={(event) => {
            setsecondDropdownValue(event.target.value) ;
          }}>
          {svalues.map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
        </Select>

      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <label style={{ fontWeight: "bold", marginLeft: 7 }}>
          <input
            type="checkbox"
            checked={showAdvanced}
            onChange={() => setShowAdvanced(!showAdvanced)}
          />{" "}
          Advanced Options
        </label>
        <Tooltip title="Enable additional data filters and settings" arrow>
          <Button startIcon={<InfoIcon sx={{ height: 28, width: 28 }} />} />
        </Tooltip>
      </Box>


        {showAdvanced && (
          <Box sx={{ ml: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <label>
            <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
            Limit by Country?
          </label>
          <Tooltip title={getTooltipContent(5)} arrow>
            <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
          </Tooltip>
        </Box>
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
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <label>
          <input type="checkbox" checked={isCheckedtwo} onChange={handleCheckboxChangetwo} />
          Limit by Context?
        </label>
        <Tooltip title={getTooltipContent(6)} arrow>
          <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
        </Tooltip>
      </Box>
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
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <label>
          <input type="checkbox" checked={isCheckedthree} onChange={handleCheckboxChangethree} />
          Limit by Dataset?
        </label>
        <Tooltip title={getTooltipContent(7)} arrow>
          <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
        </Tooltip>
      </Box>
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
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <p style={{ color: 'White', fontWeight: "bold", marginLeft: 7, padding: "2px" }}>Time range (years)</p>
        <Tooltip title={getTooltipContent(8)} arrow>
          <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
        </Tooltip>
      </Box>
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
      {/* Add row separator */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body1" sx={{ marginRight: 2, color: 'black', fontWeight: 500 }}>
        Split rows by separator
      </Typography>
        <input
        type="text"
        id="rowSeparator"
        style={{height:30,width:15,marginLeft:7,marginRight:7}}
        value={inputValueSep}
        onChange={(event) => setinputValueSep(event.target.value)}
      />
      <Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white', 
        '&:hover': {
          backgroundColor: 'green', 
        },
      }} onClick={handleClickSeparator}>
        Apply
      </Button>
        <Tooltip title={getTooltipContent(11)} arrow>
          <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
        </Tooltip>
      </Box> 
      <br/>
      {/* Add unique rows */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body1" sx={{ marginRight: 2, color: 'black', fontWeight: 500 }}>
        Combine identical categories
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={isRowsChecked}
            onChange={handleRowsChange}
            name="checkboxButton"
            color="default"
            sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }} 
          />
        }
        label=""
      />
        <Tooltip title={getTooltipContent(12)} arrow>
          <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
        </Tooltip>
      </Box> 
      <br/>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body1" sx={{ marginRight: 2, color: 'black', fontWeight: 500 }}>
        Assign many-to-one to identical spellings
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={isUniqueRows}
            onChange={handleUniqueRows}
            name="checkboxButton"
            color="default"
            sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }} 
          />
        }
        label=""
      />
      <Tooltip title={getTooltipContent(9)} arrow>
          <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
        </Tooltip>
    </Box>
    </Box>
    )}
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
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TranslateTable categories={tcategories} />
        <Tooltip title={getTooltipContent(10)} arrow>
          <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
        </Tooltip>
      </Box>     
      <br/>
      <Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white', 
        '&:hover': {
          backgroundColor: 'green', 
        },
      }} onClick={handleClicktwo}>
        Download proposed matches
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
    <div style={{width:"72%", backgroundColor:"white", padding: '20px',border: '1px solid #ccc',borderRadius : '10px',overflow: 'auto'}}>
    {columns.length > 0 && rows.length > 0 && (
        <>
          <TableContainer component={Paper} sx={{ width: '100%', overflow: 'auto' }}>
            <Table id="myTable">
              <TableHead>
                <TableRow>
                  {columns.map((col, index) => (
                    <TableCell key={index} sx={{ fontWeight: 'bold' }}>{col}</TableCell>
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
      </Box>
      <div style={{width:"100%", backgroundColor:"black", padding: '20px'}}>
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
    <Link to="/download" id="catmapperfooter" underline="none" style={{ color: "white", textDecoration: "none", margin: "0 8px" }}> Download</Link>
  </Box>
</Box>      </div>
    </Box>
    
  );
};

export default Sociotranslate;