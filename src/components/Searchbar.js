import React from 'react';
import { useState,useEffect } from 'react'
import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import { Box, Button, Checkbox, FormControl, Grid, NativeSelect, Tooltip, Typography } from "@mui/material";
import DataTable from './tableviewsc';
import archdomain from "./domain_archamap.json"
import sociodomain from "./domain_sociomap.json"
import socioptions from "./dropdown.json"
import archoptions from "./dropdown_archamap.json";
import countries from "./records.json";
import archamap_countries from "./records_archamap.json";
import InfoIcon from '@mui/icons-material/Info';
import { useLocation } from 'react-router-dom';
import infodata from './infodata.json';
import infodata2 from './socio_property.json';
import "./Searchbar.css";
import image from '../assets/white.png'
import { Link } from 'react-router-dom'
import Divider from '@mui/material/Divider';
import NeonButton from './Button';

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
    { label: 'AREA', description: 'A category defined by its geographical boundary' },
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

  const searchStateKey = `${database}_searchState`;
const usersKey = `${database}_myData`;


  useEffect(() => {   
    if (database === "ArchaMap") { 
    setoptionsForSelectedCategory(archoptions[advdomainDrop])
    }
  },[])

  useEffect(() => {
    const storedState = sessionStorage.getItem(searchStateKey);
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
  }, [searchStateKey]);

  // Save state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(searchStateKey, JSON.stringify({
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
      datasetID,
      optionsForSelectedCategory
    }));
  },[searchStateKey,domainDrop, advdomainDrop, advoptions, selectedOption, selectedcountry, tvalue, yearStart, yearEnd, isChecked, contextID,datasetID, optionsForSelectedCategory]);

  // Fetch and save users data to sessionStorage
  useEffect(() => {
    const storedUsers = sessionStorage.getItem(usersKey);
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, [usersKey]);

  useEffect(() => {
    sessionStorage.setItem(usersKey, JSON.stringify(users));
  }, [usersKey,users]);
  
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
        {infodata && selectedcategory?.[domainDrop] ? (
          infodata
            .filter(desc => selectedcategory[domainDrop].includes(desc.label))
            .map((category, index) => (
              <tr key={index}>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{category.label}</td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{category.description}</td>
              </tr>
            ))
        ) : (
          <tr>
            <td colSpan={2} style={{ padding: '8px', fontStyle: 'italic' }}>
              Loading...
            </td>
          </tr>
        )}
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
        {infodata2 && options?.[advdomainDrop] ? (
          infodata2
            .filter(desc => options[advdomainDrop].includes(desc.label))
            .map((category, index) => (
              <tr key={index}>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{category.label}</td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{category.description}</td>
              </tr>
            ))
        ) : (
          <tr>
            <td colSpan={2} style={{ padding: '8px', fontStyle: 'italic' }}>
              Loading...
            </td>
          </tr>
        )}
        </tbody>
      </table>
    </div>
  );

  function handleClick(tvalue, domain) {
    fetch("https://catmapper.org/api/search?domain=" + domain + "&property=" + selectedOption + "&term=" + encodeURIComponent(tvalue) + "&database=" +database+  "&query=false" + "&yearStart=" + yearStart + "&yearEnd=" + yearEnd + "&country=" + selectedcountry + "&context=" + contextID,
    //fetch("http://127.0.0.1:5001/search?domain=" + domain + "&property=" + selectedOption + "&term=" + encodeURIComponent(tvalue) + "&database=" +database+  "&query=false" + "&yearStart=" + yearStart + "&yearEnd=" + yearEnd + "&country=" + selectedcountry + "&context=" + contextID,
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
    <div style={{ height: "auto" }}>
     <Box
        sx={{
          p: 2,
          bgcolor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          color: 'white',
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", mb: 2, gap: 2 }}>
          <NeonButton
          type="infoOutlined"
          tooltipText={
            <>
              Explore all datasets and categories using the search bar. Use the advanced search to limit the search by domain or other criteria. Leave the search bar empty to return all results limited to the first 10,000 categories.{" "}
              <a href="https://catmapper.org/help/" target="_blank" rel="noopener noreferrer" style={{ color: "#00BFFF", textDecoration: "underline" }}>
                See for more information.
              </a>
            </>
          }
        />
          <input
            type="text"
            id="myInput"
            value={tvalue}
            style={{ flexGrow: 1, minWidth: 180, height: 45, padding: "0 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 16 }}
            placeholder="Search..."
            onChange={(event) => {
              settvalue(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                isChecked
                  ? handleClick(tvalue, advdomainDrop.trim())
                  : handleClick(tvalue, domainDrop.trim());
              }
            }}
          />
          <NeonButton
            type="searchOutlined"
            onClick={() => handleClick(tvalue, isChecked ? advdomainDrop.trim() : domainDrop.trim())}
          />
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer", userSelect: "none" }}>
          <Checkbox checked={isChecked} onChange={handleCheckboxChange} style={{color:"white"}} />
          Advanced search
        </label>
      </Box>
        {isChecked && (
            <Box
              sx={{
                backgroundColor: "#000000", 
                color: "white",             
                borderRadius: 2,
                padding: 2,
                mt: 2,
              }}
            >
            <Grid container spacing={1}>
              <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center'}}>
              <FormControl sx={{ width: 320 }} variant="standard">
                  <Typography variant="subtitle2" gutterBottom>Category Domain</Typography>
                <NativeSelect
                  id="demo-customized-select-native"
                  value={domainDrop}
                  label=""
                  sx={{ fontSize: 14, letterSpacing: 0.5, borderRadius: 1,backgroundColor:"white" }}
                  onChange={(event) => {
                    setdomainDrop(event.target.value);
                    setadvoptions(selectedcategory[event.target.value]);
                    setadvdomainDrop(selectedcategory[event.target.value][0]);

                    if (database === "ArchaMap") {
                      setoptionsForSelectedCategory(
                        archoptions[selectedcategory[event.target.value][0]]
                      );
                      setSelectedOption(
                        archoptions[selectedcategory[event.target.value][0]][0]
                      );
                    } else {
                      setoptionsForSelectedCategory(
                        socioptions[selectedcategory[event.target.value][0]]
                      );
                      setSelectedOption(
                        socioptions[selectedcategory[event.target.value][0]][0]
                      );
                    }
                  }}
                  input={<BootstrapInput />}
                >
                  {Object.keys(selectedcategory).map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
              <Tooltip title={tooltipContent} arrow>
                <Button
                  startIcon={
                    <InfoIcon sx={{ height: "28px", width: "28px" }} />
                  }
                ></Button>
              </Tooltip>
              </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center'}}>
              <FormControl sx={{ width: 300 }} variant="standard">
                <Typography variant="subtitle2" gutterBottom>Category Subdomain</Typography>
                <NativeSelect
                  id="demo-customized-select-native"
                  value={advdomainDrop}
                  label=""
                  sx={{ fontSize: 14, letterSpacing: 0.5, borderRadius: 1,backgroundColor:"white" }}
                  onChange={(event) => {
                    setadvdomainDrop(event.target.value);
                    if (database === "ArchaMap") {
                      setoptionsForSelectedCategory(
                        archoptions[event.target.value]
                      );
                    } else {
                      setoptionsForSelectedCategory(
                        socioptions[event.target.value]
                      );
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
                <Button
                  startIcon={
                    <InfoIcon sx={{ height: "28px", width: "28px" }} />
                  }
                ></Button>
              </Tooltip>
              </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
              <FormControl sx={{ width: 250 }} variant="standard">
                  <Typography variant="subtitle2" gutterBottom>Country</Typography>
                <NativeSelect
                  id="dropdown"
                  value={selectedcountry}
                  onChange={(event) => {
                    setSelectedCountry(event.target.value);
                  }}
                  sx={{ fontSize: 14, letterSpacing: 0.5, borderRadius: 1,backgroundColor:"white" }}
                  input={<BootstrapInput />}
                >
                  {(database === 'ArchaMap' ? archamap_countries : countries).map((country, index) => (
                    <option key={index} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
              </Grid>

            <Grid item xs={12} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControl sx={{ width: 250 }} variant="standard">
                  <Typography variant="subtitle2" gutterBottom>Property to Search</Typography>
              <NativeSelect
                id="dropdown"
                value={selectedOption}
                onChange={(event) => {
                  setSelectedOption(event.target.value);
                }}
                sx={{ fontSize: 14, letterSpacing: 0.5, borderRadius: 1,backgroundColor:"white" }}
                input={<BootstrapInput />}
              >
                {optionsForSelectedCategory.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </NativeSelect>
            </FormControl>
            <Tooltip title={tooltipContent3} arrow>
              <Button
                startIcon={<InfoIcon sx={{ height: "28px", width: "28px" }} />}
              ></Button>
            </Tooltip>
            </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <FormControl variant="standard">
                <Typography variant="subtitle2" gutterBottom>Time Range</Typography>
              <Box sx={{ display: 'flex',width:"100%", gap: 1,overflow: 'hidden' }}>
                  <input
                    type="text"
                    id="myInput"
                    placeholder='From'
                    value={yearStart}
                    maxLength={10}
                    style={{ flex: '1 1 0',minWidth: 0, maxWidth: 100, height: 40, padding: "0 6px", borderRadius: 4, border: "1px solid #ccc" }}
                    onChange={(event) => {
                      setyearStart(event.target.value);
                    }}
                  />
                  <input
                    type="text"
                    id="myInput"
                    placeholder='To'
                    value={yearEnd}
                    maxLength={10}
                    style={{ flex: '1 1 0',minWidth: 0, maxWidth: 100, height: 40, padding: "0 6px", borderRadius: 4, border: "1px solid #ccc" }}
                    onChange={(event) => {
                      setyearEnd(event.target.value);
                    }}
                  />
                  </Box>
            </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <FormControl variant="standard">
                  <Typography variant="subtitle2" gutterBottom>Context ID</Typography>
              <input
                type="text"
                id="myInput"
                value={contextID}
                style={{ width: 100, height: 40, padding: "0 8px", borderRadius: 4, border: "1px solid #ccc" }}
                onChange={(event) => {
                  setcontextID(event.target.value);
                }}
              />
            </FormControl>
            </Grid>


            <Grid item xs={12} sm={6} md={3}>
                <FormControl variant="standard">
                  <Typography variant="subtitle2" gutterBottom>Dataset ID</Typography>
              <input
                type="text"
                id="myInput"
                value={datasetID}
                style={{ width: 100, height: 40, padding: "0 8px", borderRadius: 4, border: "1px solid #ccc" }}
                onChange={(event) => {
                  setdatasetID(event.target.value);
                }}
              />
            </FormControl>
            </Grid>
            </Grid>
            </Box>
        )}
      </Box>
      <div style={{ padding: 10, backgroundColor: "black" }}>
        <Box sx={{ width: "100%", color: "black", backgroundColor: "white" }}>
          {
            <DataTable
              users={users}
              label={domainDrop}
              snackbarOpen={snackbarOpen}
              setSnackbarOpen={setSnackbarOpen}
            />
          }
        </Box>
        <Divider
          sx={{
            marginTop: 3,
            marginBottom: 7,
            marginLeft: 1,
            marginRight: 1,
            backgroundColor: "white",
          }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 2,
            mb: 0,
          }}
        >
          <img src={image} alt="CatMapper Logo" style={{ height: 80 }} />
          <Box>
            <Link
              id="catmapperfooter"
              to="/people"
              underline="none"
              style={{
                color: "white",
                textDecoration: "none",
                margin: "0 8px",
              }}
            >
              People
            </Link>
            <Link
              to="/news"
              id="catmapperfooter"
              underline="none"
              style={{
                color: "white",
                textDecoration: "none",
                margin: "0 8px",
              }}
            >
              News
            </Link>
            <Link
              to="/funding"
              id="catmapperfooter"
              underline="none"
              style={{
                color: "white",
                textDecoration: "none",
                margin: "0 8px",
              }}
            >
              Funding
            </Link>
            <Link
              to="/citation"
              id="catmapperfooter"
              underline="none"
              style={{
                color: "white",
                textDecoration: "none",
                margin: "0 8px",
              }}
            >
              Citation
            </Link>
            <Link
              to="/terms"
              id="catmapperfooter"
              underline="none"
              style={{
                color: "white",
                textDecoration: "none",
                margin: "0 8px",
              }}
            >
              Terms
            </Link>
            <Link
              to="/contact"
              id="catmapperfooter"
              underline="none"
              style={{
                color: "white",
                textDecoration: "none",
                margin: "0 8px",
              }}
            >
              Contact
            </Link>
          </Box>
        </Box>
      </div>
    </div>
  );

}

//export default Searchbar