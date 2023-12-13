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
import doptions from "./dropdown.json";
import countries from "./countries.json";
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
    // Use the system font instead of the default Roboto font.
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

  const [selectedcountry, setSelectedCountry] = useState('');

  const optionsForSelectedCategory = doptions[age];

  const handleDropdownChange = (event) => {setSelectedOption(event.target.value);};

  const handleChange = (event) => { setAge(event.target.value); };

  const [users, setUsers] = useState([])

  const [tvalue, settvalue] = useState('');

  const [yearStart, setyearStart] = useState(-4000);

  const [yearEnd, setyearEnd] = useState(2023);

  const [isChecked, setIsChecked] = useState(false);

  const [contextID, setcontextID] = useState(null);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  function handleclick(tvalue, age) {
    console.log(`option: ${selectedOption},tvalue: ${tvalue}, age: ${age}`)
    // fetch("http://127.0.0.1:5001/search?domain=" + age + "&property=" + selectedOption + "&term=" + tvalue + "&database=SocioMap"+  "&query=false",
    // "&yearStart=" + yearStart + "&yearEnd=" + yearEnd + "&context=" + contextID +
    // fetch("https://catmapper.org/api/count?label=" + age + "&options=" + selectedOption + "&value=" + tvalue,
    fetch("https://catmapper.org/api/search?domain=" + age + "&property=" + selectedOption + "&term=" + tvalue + "&database=SocioMap"+ "&query=false",
      {
        method: "GET"
      })
      .then(response => {
        // console.log(response.json)
        return response.json()

      })
      .then(data => {
        setUsers(data)
        console.log(data)
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
            <option value={"ADM0"}>ADM0</option>
            <option value={"ADM1"}>ADM1</option>
            <option value={"ADM2"}>ADM2</option>
            <option value={"ADM3"}>ADM3</option>
            <option value={"ADMD"}>ADMD</option>
            <option value={"ADME"}>ADME</option>
            <option value={"ADMX"}>ADMX</option>
            <option value={"CATEGORY"}>CATEGORY</option>
            <option value={"DATASET"}>DATASET</option>
            <option value={"DIALECT"}>DIALECT</option>
            <option value={"DISTRICT"}>DISTRICT</option>
            <option value={"ETHNICITY"}>ETHNICITY</option>
            <option value={"FAMILY"}>FAMILY</option>
            <option value={"GENERIC"}>GENERIC</option>
            <option value={"LANGUAGE"}>LANGUAGE</option>
            <option value={"LANGUOID"}>LANGUOID</option>
            <option value={"PPL"}>PPL</option>
            <option value={"RELIGION"}>RELIGION</option>
            <option value={"VARIABLE"}>VARIABLE</option>
          </NativeSelect>
        </FormControl>
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
      <input
        type="text"
        id="myInput"
        value={tvalue}
        style={{marginTop :22,marginLeft:"1%",width:450,height:45}}
        onChange={(event) => { settvalue(event.target.value) }}
      />
        {/* <TextField onChange={(event) => { settvalue(event.target.value) }} sx={{ m: 1,height: 40, width: 450, backgroundColor: "white" }} variant="standard" /> */}
        <IconButton color="primary" aria-label="add to shopping cart"  onClick={() => { handleclick(tvalue, age) }} sx={{top:10}}>
          <SearchOutlinedIcon />
        </IconButton>
        </div>
      </Box>
      <div id="filters">
      <label>
        <input type="checkbox"  checked={isChecked}  onChange={handleCheckboxChange} style={{marginLeft:"1%"}}/>Optional filters</label>
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
          <DataTable users={users} label={age} />
        </Box>
      </div>

    </div>

  );

}

//export default Searchbar