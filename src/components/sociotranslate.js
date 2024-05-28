import React, { useEffect, useState } from 'react';
import doptions from "./dropdown.json";
import {Select, MenuItem } from '@mui/material';
import {ExcelRenderer} from 'react-excel-renderer';
import Button from '@mui/material/Button';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,  TablePagination } from '@mui/material';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import TranslateTable from './translate_Categories';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import './sociotranslate.css'

function Sociotranslate(){

  const [selectedFile, setSelectedFile] = useState(null);
  const [zeroDropdownValue, setZeroDropdownValue] = useState([]);
  const [firstDropdownValue, setFirstDropdownValue] = useState(["ADM0"]);
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
  let fileObj= ""
  let selectedColumnValues = ""
  const [jsonData, setJsondata] = useState();

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
  } 

const handleClick = async () => {
  setLoading(true);
  try {
    selectedColumnValues = rows.map((row) => row[columns.indexOf(zeroDropdownValue)]);
    // const response = await fetch("http://127.0.0.1:5001/translate2", {
    const response = await fetch("https://catmapper.org/api/translate2", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        database : database,
        property : secondDropdownValue,
        domain : firstDropdownValue,
        key : isCheckedfour,
        term : zeroDropdownValue,
        country : thirdDropdownValue,
        context : fourthDropdownValue,
        dataset : fifthDropdownValue,
        yearStart : inputValue,
        yearEnd : inputValuetwo,
        table : jsonData,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const responseData = await response.json();
    console.log(responseData)
    setData(responseData);
    // data.sort((a, b) => a.term.localeCompare(b.term));
    setColumns(Object.keys(responseData[0]))
    setRows(responseData.map((row) => Object.values(row)))

    const matchTypeCounts = responseData.reduce((acc, row) => {
      const matchType = row['matchType_PopName']
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
    
  } catch (error) {
    console.error('Error sending POST request:', error);
  }
  finally {
    setLoading(false);
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

  saveAs(blob, 'translatedata.xlsx');};

const handleclear = () => {
  setSelectedFile(null);
  if (document.getElementById('fileInput')) {
    document.getElementById('fileInput').value = '';
  }}


const [inputValue, setinputValue] = useState(-4000);
const [inputValuetwo, setinputValuetwo] = useState(2024);        

const handleFileChange = (event) => {
      const fileType = event.target.files[0].type;
      if (fileType === 'application/vnd.ms-excel' || fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        // File is either CSV or XLSX
        setSelectedFile(event.target.files[0]);
        fileObj = event.target.files[0];

ExcelRenderer(fileObj, (err, resp) => {
  if(err){
    console.log(err);            
  }
  else{
    const columns = resp.rows[0]
    setColumns(resp.rows[0])
    setRows(resp.rows.slice(1))
    const table = resp.rows.slice(1).map((row, index) => {
      const rowData = {};
      columns.forEach((column, columnIndex) => {
        rowData[column] = row[columnIndex];
      });
      rowData['key'] = index + 1;
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
    const statusIndex = columns.findIndex(col => col === 'matchType_Name');
    const status = row[statusIndex];
  
    return getClassForStatus(status);
  };

  const getClassForStatus = (status) => {

    if (status === undefined) {
      return 'color-undefined';
    }
    status = status.trim();

    switch (status) {
      case 'exact match':
        return 'exact-matches';
      case 'fuzzy match':
        return 'fuzzy-matches';
      case 'one-to-many':
        return 'one-to-many';
      case 'many-to-one':
        return 'many-to-one';
      default:
        return '';
    }
  };

  useEffect(() => {
    setsvalues(doptions[firstDropdownValue])
  }, [firstDropdownValue])
  
  return (
    <div style={{backgroundColor:"white"}} >
    <div  style={{width:"26%",height:"90%", backgroundColor : '#e0e0e0', padding: '20px',border: '1px solid #ccc',borderRadius : '10px', margin: '10px', overflow:"auto",position:"absolute"}}>
      <h3 style={{ color: 'black', fontWeight: "bold", marginLeft: 7, padding: "2px" }}> Choose file to import</h3>
      <input id="fileInput" style={{ color: 'black', fontWeight: "bold", marginLeft: 7, padding: "2px" }} type="file" accept=".csv, .xlsx" onChange={handleFileChange} />
      <Button variant="contained" color="primary" onClick={handleclear}>
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
          sx={{ m: 1, width: 300 }}
          onChange={(event) => setZeroDropdownValue(event.target.value)}>
         {columns.map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
        </Select>
        </div>
      )}
      <p style={{ color: 'White', fontWeight: "bold", marginLeft: 7, padding: "2px" }}>Select category domain</p>     
      <Select
          label="First Dropdown"
          value={firstDropdownValue}
          style={{height:40}}
          sx={{ m: 1, width: 300 }}
          onChange={(event) => setFirstDropdownValue(event.target.value)}>
         {Object.keys(doptions).map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
        </Select>
        <br/>
        <p style={{ color: 'White', fontWeight: "bold", marginLeft: 7, padding: "2px" }}>Property to search</p>     
      <Select
          label="Second Dropdown"
          value={secondDropdownValue}
          style={{height:40}}
          sx={{ m: 1, width: 300 }}
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
          sx={{ m: 1, width: 300 }}
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
          sx={{ m: 1, width: 300 }}
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
          sx={{ m: 1, width: 300 }}
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
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>      <Button variant="contained" color="primary" onClick={handleClick}>
        Search
      </Button>
      <br/>
      <TranslateTable categories={tcategories} />
      <br/>
      <Button variant="contained" color="primary" onClick={handleClicktwo}>
        Download Data
      </Button>
    </div>
    <div style={{top:100,width:"72%", height:"90%", backgroundColor:"white", padding: '20px',border: '1px solid #ccc',borderRadius : '10px', marginLeft: "27%",position:"absolute"}}>
    {columns.length > 0 && rows.length > 0 && (
        <>
          <TableContainer component={Paper}>
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
                  <TableRow key={rowIndex} className={getRowStyle(row)}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
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
    </div>
  );
};

export default Sociotranslate;