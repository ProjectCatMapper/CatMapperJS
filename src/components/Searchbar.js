import React, { useEffect } from 'react';
import { useState } from 'react'
import { styled } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';
import {InputLabel, Select, MenuItem } from '@mui/material';
import TextField from '@mui/material/TextField';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Box } from '@mui/material';
import DataTable from './tableviewsc';
import archdomain from "./domain_archamap.json"
import sociodomain from "./domain_sociomap.json"
import socioptions from "./dropdown.json"
import archoptions from "./dropdown_archamap.json";
import countries from "./records.json";
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import { useLocation } from 'react-router-dom';
import infodata from './infodata.json';
import "./Searchbar.css";

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  'label + &': {
    marginTop: theme.spacing(3),
  },
  '& .MuiInputBase-input': {
    borderRadius: 4,
    position: 'relative',
    backgroundColor: "white",
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '10px 26px 10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:focus': {
      borderRadius: 4,
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(255,255,255,.25)',
    },
  },
}));

export default function Searchbar() {

  const [age, setAge] = React.useState('ADM0');
  
  const [selectedOption, setSelectedOption] = useState('Name');

  const [selectedcountry, setSelectedCountry] = useState(countries[0].code);

  const handleDropdownChange = (event) => {setSelectedOption(event.target.value);};

  const handleChange = (event) => { setAge(event.target.value); };

  const getStoredDataFromLocalStorage = () => {
    const storedData = sessionStorage.getItem('myData');
    return storedData ? JSON.parse(storedData) : [];
  };

  const [users, setUsers] = useState(getStoredDataFromLocalStorage())

   const saveDataToLocalStorage = () => {
    sessionStorage.setItem('myData', JSON.stringify(users));
  };


  const [tvalue, settvalue] = useState('');

  const [yearStart, setyearStart] = useState(null);

  const [yearEnd, setyearEnd] = useState(null);

  const [isChecked, setIsChecked] = useState(false);

  const [contextID, setcontextID] = useState(null);

  let database = "SocioMap"

  let selectedcategory = sociodomain

  let optionsForSelectedCategory = socioptions[age]

  if (useLocation().pathname.includes("archamap")) {
    database = "ArchaMap"
    selectedcategory = archdomain
    optionsForSelectedCategory = archoptions[age]
  } 
  
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    setSelectedCountry(countries[0].code)
  };

  console.log(useLocation().pathname.includes("sociomap"))

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 
  const totalPages = Math.ceil(infodata.length / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const tooltipContent = (
    <div style={{ color: 'black', backgroundColor: 'white' }}>
      {infodata
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .map((item, index) => (
          <div key={index} style={{ marginBottom: '10px' }}><span style={{ marginRight: '10px' }}><strong>{item.label}:</strong></span>
          <span>{item.description}</span></div>
        ))}
      <div>
        Page {currentPage} of {totalPages}
      </div>
      <div>
        <Button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</Button>
        <Button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
      </div>
    </div>
  );

  function handleClick(tvalue, age) {
    fetch("https://catmapper.org/api/search?domain=" + age + "&property=" + selectedOption + "&term=" + tvalue + "&database=" +database+  "&query=false" + "&yearStart=" + yearStart + "&yearEnd=" + yearEnd + "&country=" + selectedcountry + "&context=" + contextID,
    // fetch("http://127.0.0.1:5001/search?domain=" + age + "&property=" + selectedOption + "&term=" + tvalue + "&database=SocioMap"+  "&query=false" + "&yearStart=" + yearStart + "&yearEnd=" + yearEnd + "&country=" + selectedcountry + "&context=" + contextID,
    // fetch("https://catmapper.org/api/count?label=" + age + "&options=" + selectedOption + "&value=" + tvalue,
    // fetch("https://catmapper.org/api/search?domain=" + age + "&property=" + selectedOption + "&term=" + tvalue + "&database=SocioMap"+ "&query=false",
      {
        method: "GET"
      })
      .then(response => {
        // console.log(response.json)
        return response.json()
      })
      .then(data => {
        setUsers(data)
        saveDataToLocalStorage(data)
      })
  }

  return (
    <div style={{height:"auto"}}>
      <Box sx={{ backgroundColor: 'black', opacity: 1 }}>
        <div style={{display:"flex"}}>
          <FormControl sx={{ marginLeft: "1%" , width: 250,height: 70 }} variant="standard">
          <h6 id='[REDACTED]searchpagetext'>Select Category Domain</h6>
          <NativeSelect
            id="demo-customized-select-native"
            value={age}
            label=""
            style={{backgroundColor:"white"}}
            onChange={handleChange}
            input={<BootstrapInput />}
          >
            {selectedcategory.map((group, index) => (
          <optgroup key={index} label={group.category}>
            {group.values.map((value, valueIndex) => (
              <option key={valueIndex} value={value}>
                {value}
              </option>
            ))}
          </optgroup>
        ))}
          </NativeSelect>
        </FormControl>
        <Tooltip
      title={tooltipContent}
      arrow
    >
        <Button 
      startIcon={<InfoIcon sx={{height: '28px', width : '28px'}} />}
    >
    </Button>
    </Tooltip>
      <FormControl sx={{ marginLeft: "1%", width: 250,height: 70 }} variant="standard">
      <h6 id='[REDACTED]searchpagetext'>Property to search</h6>
        <NativeSelect
          id="dropdown"
          value={selectedOption}
          onChange={handleDropdownChange}
          style={{backgroundColor:"white"}}
          label=""
          input={<BootstrapInput />}
        >
          {optionsForSelectedCategory &&
            optionsForSelectedCategory.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
        </NativeSelect>
      </FormControl >
      <Button
      startIcon={<InfoIcon sx={{height: '28px', width : '28px'}}/>}
      onClick={() => {
        console.log('Info button clicked');
      }}
    >
    </Button>
      <input
        type="text"
        id="myInput"
        value={tvalue}
        style={{marginTop :22,marginLeft:"1%",width:450,height:45}}
        onChange={(event) => { settvalue(event.target.value) }}
        onKeyDown={(event) => { if (event.key === 'Enter') {handleClick(tvalue, age)} }}
      />
        {/* <TextField onChange={(event) => { settvalue(event.target.value) }} sx={{ m: 1,height: 40, width: 450, backgroundColor: "white" }} variant="standard" /> */}
        <Tooltip title="Search" arrow sx={{ fontSize: '30px' }}>
        <IconButton color="primary" aria-label="add to shopping cart"  onClick={() => { handleClick(tvalue, age) }} sx={{top:10}}>
          <SearchOutlinedIcon sx={{ fontSize: 33 }}/>
        </IconButton>
        </Tooltip>
        <label id='filters' style={{ whiteSpace: 'nowrap'}}>
        <input type="checkbox"  checked={isChecked}  onChange={handleCheckboxChange} style={{marginTop:35,marginLeft:"2%"}}/> Advanced search</label>
        </div>
      </Box>
      <div id="filters">
        {isChecked &&
        <div style={{display:"flex"}}>
          <FormControl sx={{ marginLeft: "1%",marginTop:"1%", width: 250,height: 80 }} variant="standard">
      <h6 id='[REDACTED]searchpagetext'>Country</h6>
        <NativeSelect
          id="dropdown"
          value={selectedcountry}
          onChange={(event) => {setSelectedCountry(event.target.value);}}
          style={{backgroundColor:"white"}}
          label=""
          input={<BootstrapInput />}
        >
        {countries.map((country, index) => (
          <option key={index} value={country.code}>
            {country.name}
          </option>
        ))}
        </NativeSelect>
      </FormControl >
      <FormControl sx={{ marginLeft: "1%", width: 250,height: 80 }} variant="standard">
      <h6 id='[REDACTED]searchpagetext'>Time range</h6>
      <div style={{display:'flex'}}>
      <div>
      <h6 id='[REDACTED]searchpagetext'>From</h6>
      <input
        type="text"
        id="myInput"
        value={yearStart}
        style={{marginLeft:"1%",width:150,height:35}}
        onChange={(event) => { setyearStart(event.target.value) }}
      />
      </div>
      <div>
      <h6 id='[REDACTED]searchpagetext'>To</h6>
       <input
        type="text"
        id="myInput"
        value={yearEnd}
        style={{marginLeft:"3%",width:150,height:35}}
        onChange={(event) => { setyearEnd(event.target.value) }}
      />
      </div>
      </div>
      </FormControl >
      <FormControl sx={{ marginLeft: "5%",marginTop:"1%", width: 250,height: 70 }} variant="standard">
      <h6 id='[REDACTED]searchpagetext'>Context ID</h6>
      <input
        type="text"
        id="myInput"
        value={contextID}
        style={{marginLeft:"1%",width:250,height:70}}
        onChange={(event) => { setcontextID(event.target.value) }}
      />     
      </FormControl >

        </div>
        }
      </div>
      <div style={{ padding: 10, backgroundColor: "black" }}>
        <Box sx={{ width: '100%', color: 'black', backgroundColor: "white" }}>
        {<DataTable users={users} label={age} />}
        </Box>
      </div>

    </div>

  );

}

//export default Searchbar