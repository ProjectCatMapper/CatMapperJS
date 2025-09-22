import React from 'react';
import { useState,useEffect } from 'react'
import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import { Box, Button, Checkbox, FormControl, Grid, NativeSelect, Tooltip, Typography } from "@mui/material";
import DataTable from './tableviewsc';
import domainOptions from "./dropdown.json"
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
import DownloadDialogButton from './advancedDownload';
import CircularProgress from '@mui/material/CircularProgress';

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

  const [domainDrop, setdomainDrop] = React.useState('ALL NODES');

  const [advdomainDrop, setadvdomainDrop] = React.useState('ALL NODES');

  const [advoptions, setadvoptions] = React.useState(['ALL NODES']);

  const [selectedOption, setSelectedOption] = useState('Name');

  const [selectedcountry, setSelectedCountry] = useState(countries[0].code);

  const [users, setUsers] = useState([]);

  const [tvalue, settvalue] = useState('');

  const [yearStart, setyearStart] = useState(null);

  const [yearEnd, setyearEnd] = useState(null);

  const [isChecked, setIsChecked] = useState(false);

  const [contextID, setcontextID] = useState(null);

  const [datasetID, setdatasetID] = useState(null);

  const [qcount, setqcount] = useState(null);

  const [cmid_download, setCMIDDownload] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [loading,setLoading] = useState(false);

  const fallbackOptions = ["Name", "Key", "CatMapper ID (CMID)"];

  let database = "SocioMap"
  
  if (useLocation().pathname.includes("archamap")) {
    database = "ArchaMap"
  }

  const [selectedCategory, setSelectedCategory] = useState({});

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/metadata/subdomains/${database}`)
      .then((res) => res.json())
      .then((data) => {
        const normalized = {};

        data.forEach(({ domain, subdomains }) => {
          normalized[domain] = subdomains;
        });

        setSelectedCategory(normalized);
      })
      .catch((err) => {
        console.error("Error loading subdomains:", err);
      });
  }, [database]);

  const [optionsForSelectedCategory,setoptionsForSelectedCategory] = useState(domainOptions[advdomainDrop] || fallbackOptions)

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/metadata/domainDescriptions/${database}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load domain descriptions");
        return res.json();
      })
      .then((data) => {
        // Assuming data is in the format [{ label: "X", description: "Y" }, ...]
        setCategories(data);
      })
      .catch((err) => {
        console.error("Error loading categories:", err);
      });
  }, [database]);

 

const searchStateKey = `${database}_searchState`;
const usersKey = `${database}_myData`;

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
        datasetID,
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
      //setqlimit(qlimit);
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

  const handleReset = () => {
    setdomainDrop("ALL NODES")
    setadvdomainDrop("ALL NODES")
    setadvoptions(["ALL NODES"])
    setSelectedOption("Name")
    setSelectedCountry(countries[0].code)
    setyearStart("")
    setyearEnd("")
    setcontextID("")
    setdatasetID("")
  }

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
        {infodata && selectedCategory?.[domainDrop]?.length > 0 ? (
          infodata
            .filter(desc => selectedCategory[domainDrop].includes(desc.label))
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
        {infodata2 && (domainOptions?.[advdomainDrop] || fallbackOptions) ? (
          infodata2
            .filter(desc => (domainOptions[advdomainDrop] || fallbackOptions).includes(desc.label))
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
    setLoading(true);
    //fetch("http://127.0.0.1:5001/search?domain=" + domain + "&property=" + selectedOption + "&term=" + encodeURIComponent(tvalue) + "&database=" +database+  "&query=false" + "&yearStart=" + yearStart + "&yearEnd=" + yearEnd + "&country=" + selectedcountry + "&context=" + contextID + "&dataset=" + datasetID,
    fetch(`${process.env.REACT_APP_API_URL}/search?domain=` + domain + "&property=" + selectedOption + "&term=" + encodeURIComponent(tvalue) + "&database=" +database+  "&query=false" + "&yearStart=" + yearStart + "&yearEnd=" + yearEnd + "&country=" + selectedcountry + "&context=" + contextID+ "&dataset=" + datasetID,
      {
        method: "GET"
      })
      .then(response => {
        return response.json()
      })
      .then(data => {
        if (data.count[0].totalCount === 0) {
          setUsers([]);
          setSnackbarOpen(true);
        } else {
          setUsers(data.data);
          setqcount(data.count[0].totalCount)
          setCMIDDownload(data.count[0].CMID)
        }
      })
      .catch(error => {
      console.error("Fetch error:", error);
      setSnackbarOpen(true); 
    })
    .finally(() => {
      setLoading(false);
    });
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
              <a href="https://catmapper.org/help/" target="_blank" rel="noopener noreferrer" style={{ color: "#0645AD !important", textDecoration: "underline" }}>
                See for more information.
              </a>
            </>
          }
        />
          <input
            type="text"
            id="myInput"
            value={tvalue}
            style={{ flexGrow: 1, minWidth: 150, height: 45, padding: "0 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 16 }}
            placeholder="Search..."
            onChange={(event) => {
              settvalue(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                  handleClick(tvalue, advdomainDrop.trim())
              }
            }}
          />
          <NeonButton
            type="searchOutlined"
            onClick={() => handleClick(tvalue,advdomainDrop.trim())}
          />
          {loading && (
            <div style={{ position: "absolute", top: "40vh", left: "50vw", transform: "translate(-50%, -50%)" }}>
              <CircularProgress />
            </div>
          )}
          <DownloadDialogButton users={users} database={database} domain={advdomainDrop} count ={qcount} cmid_download={cmid_download}/>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            Advanced Search: 
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <Checkbox
              checked={isChecked}
              onChange={handleCheckboxChange}
              style={{ color: "white" }}
            />
            Show 
          </label>
          <NeonButton label="Reset" onClick={handleReset} />
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
              <FormControl sx={{ width: 320 }} variant="standard" size="small">
                  <Typography variant="subtitle2" gutterBottom>Category Domain</Typography>
                <NativeSelect
                  value={domainDrop}
                  label=""
                  sx={{ fontSize: 14, letterSpacing: 0.5, borderRadius: 1,backgroundColor:"white","& .MuiNativeSelect-select": {
      padding: "4px 8px",
    }, }}
                  onChange={(event) => {
                    const newDomain = event.target.value;
                    const subdomains = selectedCategory[newDomain] || [];

                    setdomainDrop(newDomain);
                    setadvoptions(subdomains);
                    setadvdomainDrop(subdomains[0] || '');

                    const firstSub = subdomains[0];

                    if (firstSub) {
                        setoptionsForSelectedCategory(domainOptions[firstSub] || fallbackOptions || []);
                        setSelectedOption((domainOptions[firstSub] || fallbackOptions || [])[0] || '');
                    } else {
                      // fallback if no subdomain exists
                      setoptionsForSelectedCategory([]);
                      setSelectedOption('');
                    }
                  }}
                  input={<BootstrapInput />}
                >
                  {Object.keys(selectedCategory).map((category, index) => (
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
                  sx={{ fontSize: 14, letterSpacing: 0.5, borderRadius: 1,backgroundColor:"white","& .MuiNativeSelect-select": {
      padding: "4px 8px",
    }, }}
                  onChange={(event) => {
                    setadvdomainDrop(event.target.value);
                      setoptionsForSelectedCategory(
                        domainOptions[event.target.value] || fallbackOptions || []
                      );
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
                  sx={{ fontSize: 14, letterSpacing: 0.5, borderRadius: 1,backgroundColor:"white","& .MuiNativeSelect-select": {
      padding: "4px 8px",
    }, }}
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
                sx={{ fontSize: 14, letterSpacing: 0.5, borderRadius: 1,backgroundColor:"white","& .MuiNativeSelect-select": {
      padding: "4px 8px",
    }, }}
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
                    style={{ flex: '1 1 0',minWidth: 0, maxWidth: 100, height: 30, padding: "0 6px", borderRadius: 4, border: "1px solid #ccc" }}
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
                    style={{ flex: '1 1 0',minWidth: 0, maxWidth: 100, height: 30, padding: "0 6px", borderRadius: 4, border: "1px solid #ccc" }}
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
                style={{ width: 100, height: 30, padding: "0 8px", borderRadius: 4, border: "1px solid #ccc" }}
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
                style={{ width: 100, height: 30, padding: "0 8px", borderRadius: 4, border: "1px solid #ccc" }}
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
            <Link
              to="/download"
              id="catmapperfooter"
              underline="none"
              style={{
                color: "white",
                textDecoration: "none",
                margin: "0 8px",
              }}
            >
              Download
            </Link>
          </Box>
        </Box>
      </div>
    </div>
  );

}

//export default Searchbar