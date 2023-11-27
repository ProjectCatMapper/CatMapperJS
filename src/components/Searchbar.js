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
  
  const [selectedOption, setSelectedOption] = useState('');

  const optionsForSelectedCategory = doptions[age];

  const handleDropdownChange = (event) => {setSelectedOption(event.target.value);};

  const handleChange = (event) => { setAge(event.target.value); };

  const [users, setUsers] = useState([])

  const [tvalue, settvalue] = useState('');

  function handleclick(tvalue, age) {
    console.log(`option: ${selectedOption},tvalue: ${tvalue}, age: ${age}`)
    fetch("https://catmapper.org/api/count?label=" + age + "&options=" + selectedOption + "&value=" + tvalue,
      {
        method: "GET"
      })
      .then(response => {
        //console.log(response.json)
        return response.json()

      })
      .then(data => {
        setUsers(data)
      })

  }

  return (
    <div style={{height:"auto"}}>
      <Box sx={{ backgroundColor: 'black', opacity: 1 }}>
          <p style={{ color: 'White', fontWeight: "bold", marginLeft: 7, padding: "2px" }}>Category Domain</p>
          <FormControl sx={{ m: 1, width: 300,backgroundColor:"white" }} variant="standard">
          <NativeSelect
            id="demo-customized-select-native"
            value={age}
            label=""
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
      <FormControl sx={{ m: 1, width: 150, height:50, top:1,backgroundColor:"white" }} variant="outlined">
        <InputLabel id="dropdown-label">Select an option</InputLabel>
        <Select
          labelId="dropdown-label"
          id="dropdown"
          value={selectedOption}
          onChange={handleDropdownChange}
          label="Select an option"
        >
          {optionsForSelectedCategory &&
            optionsForSelectedCategory.map((option, index) => (
              <MenuItem key={index} value={option}>
                {option}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
        <TextField id="outlined-basic" onChange={(event) => { settvalue(event.target.value) }} placeholder="Search" sx={{ m: 1, width: 500, top: 1, backgroundColor: "white" }} variant="outlined" />
        <IconButton color="primary" aria-label="add to shopping cart" style={{ top: 15 }} onClick={() => { handleclick(tvalue, age) }}>
          <SearchOutlinedIcon />
        </IconButton>
      </Box>
      <div style={{ padding: 10, backgroundColor: "black" }}>
        <Box sx={{ width: '100%', color: 'black', backgroundColor: "white" }}>
          <DataTable users={users} label={age} />
        </Box>
      </div>

    </div>

  );

}

//export default Searchbar