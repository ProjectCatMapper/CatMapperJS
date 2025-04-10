import React from 'react';
import { useState,useEffect } from 'react'
import { styled } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';
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
import infodata2 from './socio_property.json';
import "./Searchbar.css";
import image from '../assets/white.png'
import { Link } from 'react-router-dom'
import Divider from '@mui/material/Divider';

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

  const [domainDrop, setdomainDrop] = React.useState('ANY DOMAIN');

  const [advdomainDrop, setadvdomainDrop] = React.useState('ANY DOMAIN');

  const [advoptions, setadvoptions] = React.useState(['ANY DOMAIN']);

  const [selectedOption, setSelectedOption] = useState('Name');

  const [selectedcountry, setSelectedCountry] = useState(countries[0].code);

  const [users, setUsers] = useState([]);

  const [tvalue, settvalue] = useState('');

  const [yearStart, setyearStart] = useState(null);

  const [yearEnd, setyearEnd] = useState(null);

  const [isChecked, setIsChecked] = useState(false);

  const [contextID, setcontextID] = useState(null);

  const [datasetID, setdatasetID] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  let database = "SocioMap"

  let selectedcategory = sociodomain

  const [optionsForSelectedCategory,setoptionsForSelectedCategory] = useState(socioptions[advdomainDrop])

  const categories = [
    { label: 'ANY DOMAIN', description: 'Any category/domain. Excludes DATASETS.' },
    { label: 'DATASET', description: 'A dataset for which SocioMap includes metadata on categories and/or variables' },
    { label: 'DISTRICT', description: 'A category defined by its geographical boundary' },
    { label: 'ETHNICITY', description: 'A category of people defined by a shared origin which is often socially constructed. This can include categories defined by ethnicity, race, caste, religion, or ecological zone (e.g., hill people). It can be internally or externally defined depending on the source.' },
    { label: 'GENERIC', description: 'A general category used to organize other categories (e.g., Missing)' },
    { label: 'LANGUOID', description: 'A category defined by a linguistic tradition or group of related linguistic traditions' },
    {label: 'RELIGION', description: 'A category defined by a religious tradition'},
    {label: 'VARIABLE', description: 'A variable'}
  ];

  const options = useLocation().pathname.includes('archamap') ? archoptions : socioptions;
  
  if (useLocation().pathname.includes("archamap")) {
    database = "ArchaMap"
    selectedcategory = archdomain
  }

  useEffect(() => {   
    if (database === "ArchaMap") { 
    setoptionsForSelectedCategory(archoptions[advdomainDrop])
    }
  },[])

  useEffect(() => {
    const storedState = sessionStorage.getItem('searchState');
    if (storedState) {
      const {
        domainDrop,
        advdomainDrop,
        advoptions,
        selectedOption,
        selectedcountry,
        tvalue,
        yearStart,
        yearEnd,
        isChecked,
        contextID,
        optionsForSelectedCategory
      } = JSON.parse(storedState);

      setdomainDrop(domainDrop);
      setadvdomainDrop(advdomainDrop);
      setadvoptions(advoptions);
      setSelectedOption(selectedOption);
      setSelectedCountry(selectedcountry);
      settvalue(tvalue);
      setyearStart(yearStart);
      setyearEnd(yearEnd);
      setIsChecked(isChecked);
      setcontextID(contextID);
      setdatasetID(datasetID);
      setoptionsForSelectedCategory(optionsForSelectedCategory);
    }
  }, []);

  // Save state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('searchState', JSON.stringify({
      domainDrop,
      advdomainDrop,
      advoptions,
      selectedOption,
      selectedcountry,
      tvalue,
      yearStart,
      yearEnd,
      isChecked,
      contextID,
      optionsForSelectedCategory
    }));
  }, [domainDrop, advdomainDrop, advoptions, selectedOption, selectedcountry, tvalue, yearStart, yearEnd, isChecked, contextID, optionsForSelectedCategory]);

  // Fetch and save users data to sessionStorage
  useEffect(() => {
    const storedUsers = sessionStorage.getItem('myData');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('myData', JSON.stringify(users));
  }, [users]);
  
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    setSelectedCountry(countries[0].code)
  };

  const tooltipContent = (
    <div style={{ maxWidth: '400px' }}>
      <h4>Domain Descriptions</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px' }}>Label</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={index}>
              <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{category.label}</td>
              <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{category.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const tooltipContent2 = (
    <div style={{ maxWidth: '400px' }}>
      <h4>Domain Descriptions</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px' }}>Label</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {infodata.filter(desc => selectedcategory[domainDrop].includes(desc.label)).map((category, index) => (
            <tr key={index}>
              <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{category.label}</td>
              <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{category.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const tooltipContent3 = (
    <div style={{ maxWidth: '400px' }}>
      <h4>Property Descriptions</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px' }}>Label</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {infodata2.filter(desc => options[advdomainDrop].includes(desc.label)).map((category, index) => (
            <tr key={index}>
              <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{category.label}</td>
              <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{category.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  function handleClick(tvalue, domain) {
    console.log(database)
    fetch("https://catmapper.org/api/search?domain=" + domain + "&property=" + selectedOption + "&term=" + encodeURIComponent(tvalue) + "&database=" +database+  "&query=false" + "&yearStart=" + yearStart + "&yearEnd=" + yearEnd + "&country=" + selectedcountry + "&context=" + contextID,
    //fetch("http://127.0.0.1:5001/search?domain=" + domain + "&property=" + selectedOption + "&term=" + encodeURIComponent(tvalue) + "&database=ArchaMap"+  "&query=false" + "&yearStart=" + yearStart + "&yearEnd=" + yearEnd + "&country=" + selectedcountry + "&context=" + contextID,
    // fetch("https://catmapper.org/api/count?label=" + domain + "&options=" + selectedOption + "&value=" + tvalue,
    // fetch("https://catmapper.org/api/search?domain=" + domain + "&property=" + selectedOption + "&term=" + tvalue + "&database=SocioMap"+ "&query=false",
      {
        method: "GET"
      })
      .then(response => {
        //console.log(response.json)
        return response.json()
      })
      .then(data => {
        if (data.length === 0) {
          setUsers([]);
          setSnackbarOpen(true);
        } else {
          setUsers(data);
        }
      })
  }

  return (
    <div style={{height:"auto"}}>
      <Box sx={{ backgroundColor: 'black', opacity: 1 }}>
        <div style={{display:"flex",flexWrap:"wrap"}}>
          <FormControl sx={{ marginLeft: "1%" , width: 250,height: 70 }} variant="standard">
          <h6 id='[REDACTED]searchpagetext'>Select Category Domain</h6>
          <NativeSelect
            id="demo-customized-select-native"
            value={domainDrop}
            label=""
            style={{backgroundColor:"white"}}
            onChange={(event) => { setdomainDrop(event.target.value);setadvoptions(selectedcategory[event.target.value]);setadvdomainDrop(selectedcategory[event.target.value][0]);
              
              if (database === "ArchaMap") {
                setoptionsForSelectedCategory(archoptions[selectedcategory[event.target.value][0]]);
                selectedOption(archoptions[selectedcategory[event.target.value][0]][0])
              } else {
                setoptionsForSelectedCategory(socioptions[selectedcategory[event.target.value][0]]);
                setSelectedOption(socioptions[selectedcategory[event.target.value][0]][0])
              }            
            }}
            input={<BootstrapInput />}
          >
            {Object.keys(selectedcategory).map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            )
        )}
        
          </NativeSelect>
        </FormControl>
        <Tooltip title={tooltipContent} arrow>
        <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />}>
        </Button>
      </Tooltip>

      <input
        type="text"
        id="myInput"
        value={tvalue}
        style={{marginTop :22,marginLeft:"1%",width:"30vw",height:45}}
        onChange={(event) => { settvalue(event.target.value) }}
        onKeyDown={(event) => { if (event.key === 'Enter') {isChecked ? handleClick(tvalue, advdomainDrop.trim()) : handleClick(tvalue, domainDrop.trim()) } }}
      />
        {/* <TextField onChange={(event) => { settvalue(event.target.value) }} sx={{ m: 1,height: 40, width: 450, backgroundColor: "white" }} variant="standard" /> */}
        <Tooltip title="Search" arrow sx={{ fontSize: '30px' }}>
        <IconButton color="primary" aria-label="add to shopping cart"  onClick={() => { isChecked ? handleClick(tvalue, advdomainDrop.trim()) : handleClick(tvalue, domainDrop.trim())  }} sx={{top:10}}>
          <SearchOutlinedIcon sx={{ fontSize: 33 }}/>
        </IconButton>
        </Tooltip>
        <label id='filters' style={{ whiteSpace: 'nowrap'}}>
        <input type="checkbox"  checked={isChecked}  onChange={handleCheckboxChange} style={{marginTop:35,marginLeft:"2%"}}/> Advanced search</label>
        </div>
      </Box>
      <div id="filters">
        {isChecked &&
        <div className="flex-container">
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
      <FormControl sx={{ marginLeft: "1%" ,marginTop:"1%", width: 250,height: 70 }} variant="standard">
          <h6 id='[REDACTED]searchpagetext'>Select Category Sub-Domain</h6>
          <NativeSelect
            id="demo-customized-select-native"
            value={advdomainDrop}
            label=""
            style={{backgroundColor:"white"}}
            onChange={(event) => { setadvdomainDrop(event.target.value);
              if (database === "ArchaMap") {
                setoptionsForSelectedCategory(archoptions[event.target.value]);
              } else {
                setoptionsForSelectedCategory(socioptions[event.target.value]);
              }
            }}
            input={<BootstrapInput />}
          >
            {advoptions.map((value, index) => (
              <option key={index} value={value}>
                {value}
              </option>
            ))}        
          </NativeSelect>
        </FormControl>
        <Tooltip title={tooltipContent2} arrow>
        <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />}>
        </Button>
      </Tooltip>
        <FormControl sx={{ marginLeft: "1%",marginTop:"1%", width: 250,height: 70 }} variant="standard">
      <h6 id='[REDACTED]searchpagetext'>Property to search</h6>
        <NativeSelect
          id="dropdown"
          value={selectedOption}
          onChange={(event) => {setSelectedOption(event.target.value);}}
          style={{backgroundColor:"white"}}
          label=""
          input={<BootstrapInput />}
        >
          {
            optionsForSelectedCategory.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
        </NativeSelect>
      </FormControl >
      <Tooltip title={tooltipContent3} arrow>
        <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />}>
        </Button>
      </Tooltip>
      <FormControl sx={{ marginLeft: "1%",marginTop:".3%", width: 250,height: 80 }} variant="standard">
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
      <FormControl sx={{ marginLeft: "3%",marginTop:"1%", width: 250,height: 70 }} variant="standard">
      <h6 id='[REDACTED]searchpagetext'>Dataset ID</h6>
      <input
        type="text"
        id="myInput"
        value={datasetID}
        style={{marginLeft:"1%",width:250,height:70}}
        onChange={(event) => { setdatasetID(event.target.value) }}
      />     
      </FormControl >
      

        </div>
        }
      </div>
      <div style={{ padding: 10, backgroundColor: "black" }}>
        <Box sx={{ width: '100%', color: 'black', backgroundColor: "white" }}>
        {<DataTable users={users} label={domainDrop} snackbarOpen={snackbarOpen} setSnackbarOpen={setSnackbarOpen} />}
        </Box>
        <Divider sx={{ marginTop: 3, marginBottom: 7, marginLeft:1,marginRight:1, backgroundColor: 'white' }} />

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
      </Box>
      </div>

    </div>

  );

}

//export default Searchbar