import React, { useEffect, useState } from 'react';
import doptions from "./dropdown.json";
import {Select, MenuItem } from '@mui/material';
import {ExcelRenderer} from 'react-excel-renderer';
import Button from '@mui/material/Button';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,  TablePagination } from '@mui/material';
import './sociotranslate.css'

function Sociotranslate(){

  const [selectedFile, setSelectedFile] = useState(null);
  const [zeroDropdownValue, setZeroDropdownValue] = useState([]);
  const [firstDropdownValue, setFirstDropdownValue] = useState(["ADM0"]);
  const [secondDropdownValue, setsecondDropdownValue] = useState([]);
  const [thirdDropdownValue, setthirdDropdownValue] = useState([]);
  const [fourthDropdownValue, setfourthDropdownValue] = useState([]);
  const [fifthDropdownValue, setfifthDropdownValue] = useState([]);
  const [svalues, setsvalues] = useState(["Name","SocioMapID"]);
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isCheckedtwo, setIsCheckedtwo] = useState(false);
  const [isCheckedthree, setIsCheckedthree] = useState(false);
  const [isCheckedfour, setIsCheckedfour] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

const handleClick = () => {alert('Button clicked!');};
const handleClicktwo = () => {alert('Button clicked!');};

const handleclear = () => {
  setSelectedFile(null);
  if (document.getElementById('fileInput')) {
    document.getElementById('fileInput').value = '';
  }}


const [inputValue, setinputValue] = useState('');
const [inputValuetwo, setinputValuetwo] = useState('');        

const handleFileChange = (event) => {
      const fileType = event.target.files[0].type;
      if (fileType === 'application/vnd.ms-excel' || fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        // File is either CSV or XLSX
        setSelectedFile(event.target.files[0]);
        let fileObj = event.target.files[0];

ExcelRenderer(fileObj, (err, resp) => {
  if(err){
    console.log(err);            
  }
  else{
    const columns = resp.rows[0]
    setColumns(resp.rows[0])
    setRows(resp.rows.slice(1))
  }
});  
      } else {
        // Invalid file type
        alert('Please upload a valid CSV or XLSX file.');
        event.target.value = null; // Clear the file input
        setSelectedFile(null);
      }
  };

  useEffect(() => {
    setsvalues(doptions[firstDropdownValue])
  }, [firstDropdownValue])
  
  return (
    <div style={{backgroundColor:"white"}} >
    <div  style={{width:"25%",height:700, backgroundColor : '#e0e0e0', padding: '20px',border: '1px solid #ccc',borderRadius : '10px', margin: '10px', overflow:"auto",position:"absolute"}}>
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
          value={zeroDropdownValue}
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
          value={zeroDropdownValue}
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
          value={zeroDropdownValue}
          sx={{ m: 1, width: 300 }}
          onChange={(event) => setfifthDropdownValue(event.target.value)}>
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
      <label>
        <input type="checkbox" checked={isCheckedfour} onChange={handleCheckboxChangefour} />
        Return Dataset Keys?
      </label>
      <br/>
      <br/>
      <Button variant="contained" color="primary" onClick={handleClick}>
        Search
      </Button>
      <br/>
      <br/>
      <Button variant="contained" color="primary" onClick={handleClicktwo}>
        Download Data
      </Button>
    </div>
    <div style={{top:100,width:"73%", height:700, backgroundColor:"white", padding: '20px',border: '1px solid #ccc',borderRadius : '10px', marginLeft: "27%",position:"absolute"}}>
    {columns.length > 0 && rows.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
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
                  <TableRow key={rowIndex}>
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
          <TablePagination
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