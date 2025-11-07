import React, { useState } from 'react'
import { Box, Button, FormControlLabel, Radio, RadioGroup, Checkbox, Typography, Divider, Select, TextField, MenuItem, FormControl, FormGroup, Snackbar, Alert } from '@mui/material';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';

const Propose_Merge = () => {
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const [data, setData] = useState();
  const [isValid, setIsValid] = useState(false);
  const [mergeLevel, setMergeLevel] = useState(1);
  const [firstDropdownValue, setFirstDropdownValue] = useState("");
  const [resultFormat, setResultFormat] = useState("key-to-key");
  let sections = [
    { label: 'ANY DOMAIN', keys: ['ANY DOMAIN'] },
    { label: 'AREA to PPL', keys: ['AREA', 'ADM0', 'ADM1', 'ADM2', 'ADM3', 'ADM4', 'ADMD', 'ADME', 'ADML', 'ADMX', 'PPL', 'NATURAL'] },
    { label: 'DATASET', keys: ['DATASET'] },
    { label: 'LANGUOID to FAMILY', keys: ['LANGUOID', 'LANGUAGE', 'DIALECT', 'FAMILY'] },
    { label: 'ETHNICITY', keys: ['ETHNICITY'] },
    { label: 'GENERIC', keys: ['GENERIC'] },
    { label: 'RELIGION', keys: ['RELIGION'] },
    { label: 'VARIABLE', keys: ['VARIABLE'] }
  ];

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
      { label: 'CERAMIC to CERAMIC_WARE', keys: ['CERAMIC', 'CERAMIC_TYPE', 'CERAMIC_WARE'] },
      { label: 'DATASET', keys: ['DATASET'] },
      { label: 'PERIOD', keys: ['PERIOD'] },
      { label: 'PROJECTILE_POINT TO PROJECTILE_POINT_TYPE', keys: ['PROJECTILE_POINT', 'PROJECTILE_POINT_CLUSTER', 'PROJECTILE_POINT_TYPE'] },
      { label: 'VARIABLE', keys: ['VARIABLE'] }
    ];
  }

  const menuItems = sections.flatMap((section, index) => [
    index > 0 ? <Divider key={`divider-${section.label}`} /> : null,
    ...section.keys.filter(key => !key.toUpperCase().includes('ANY DOMAIN')).map((key, idx) => (
      <MenuItem
        key={key}
        value={key}
        sx={idx === 0 ? { fontWeight: 'bold', backgroundColor: '#f0f0f0' } : {}}
      >
        {key}
      </MenuItem>
    ))
  ]).filter(Boolean);

  const [selectedOption, setSelectedOption] = useState('Standard');

  const handleRadioChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const [returnAllCategories, setReturnAllCategories] = useState(true);

  const handleCheckChange = (event) => {
    setReturnAllCategories(event.target.checked);
  };

  const handleValidate = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/validateDatasets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "names": inputValue,
          "database": database,
        }),
      });

      const result = await response.json();
      console.log(result)
      if (result.success === true) {
        alert(`Validation successful: ${result.message || "All nodes exist."}`);
        setIsValid(true);
      } else {
        alert(`Validation failed: ${result.message || "Some nodes are missing."}`);
      }
    } catch (error) {
      alert('Validation failed. Please try again.');
    }
  };


  const handleSubmit = async () => {
    if (!isValid) {
      alert('Please validate successfully before submitting.');
      return;
    }
    if (firstDropdownValue === "") {
      alert("Please select a category domain to match")
      return;
    }
    setLoading(true)
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/proposeMergeSubmit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "datasetChoices": inputValue,
          "categoryLabel": firstDropdownValue,
          "intersection": returnAllCategories,
          "database": database,
          "mergelevel": mergeLevel,
          "equivalence": selectedOption,
          "resultFormat": resultFormat,
        }),
      });

      const result = await response.json();
      if (
      !result || 
      (Array.isArray(result) && result.length === 0) ||
      (typeof result === "object" && Object.keys(result).length === 0)
    ) {
      alert("No results found. No merge results found.");
      return;
    }
      setData(result)
      setOpen(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
    finally {
      setLoading(false);
    }
  };

  const downloadMerge = async () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged_dataset.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (

    <Box sx={{
      height: '100%',
      overflow: 'auto',
      padding: '16px',
    }}>
      <h2 style={{ color: 'black', padding: "1px" }}>Propose Merges</h2>
      <h4 style={{ color: 'black', padding: "1px" }}>Select Datasets for Merging</h4>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <TextField
          label="Enter DatasetIDs seperated by commas"
          variant="outlined"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          sx={{ mr: 2, width: '34vw' }}
        />
        <Button variant="contained" onClick={handleValidate}>
          Validate
        </Button>
      </Box>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: "100%" }}>
          Merge proposal complete!
        </Alert>
      </Snackbar>
      <Divider sx={{ my: 2 }} />
      <h4 style={{ color: 'black', padding: "1px" }}>Choose Domain</h4>
      <Box display="flex" alignItems="center" gap={2}>
        <Box>
          <Typography variant="h7" style={{ color: 'black', padding: '1px' }}>
            Select Category Domain
          </Typography>
          <Select
            label="First Dropdown"
            value={firstDropdownValue}
            style={{ height: 40 }}
            sx={{ m: 1, width: '12vw' }}
            onChange={(event) => setFirstDropdownValue(event.target.value)}
          >
            {menuItems}
          </Select>
        </Box>
        <Box>
          <Typography variant="h7" style={{ color: 'black', padding: '1px' }}>
            Choose Result Format
          </Typography>
          <Select
            label="resultFormat"
            value={resultFormat}
            style={{ height: 40 }}
            sx={{ m: 1, width: '12vw' }}
            onChange={(event) => setResultFormat(event.target.value)}
          >
            {["key-to-key", "key-to-category", "category-to-category"].map((level) => (
              <MenuItem key={level} value={level}>{level}</MenuItem>
            ))}
          </Select>
        </Box>
        <Box>
          <Typography variant="h7" style={{ color: 'black', padding: '1px' }}>
            Choose Merge Level for Extended Merge
          </Typography>
          <Select
            label="Merge Level"
            value={mergeLevel}
            style={{ height: 40 }}
            sx={{ m: 1, width: '12vw' }}
            onChange={(event) => setMergeLevel(event.target.value)}
          >
            {[1, 2, 3, 4].map((level) => (
              <MenuItem key={level} value={level}>{level}</MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
      <h5 style={{ color: 'black', padding: "1px" }}>Choose Equivalence Criteria</h5>
      <FormControl component="fieldset">
        <RadioGroup
          aria-label="category"
          name="category"
          value={selectedOption}
          onChange={handleRadioChange}
        >
          <FormControlLabel
            value="Standard"
            control={<Radio />}
            label="Exact: Categories are only equivalent if they point to the same node"
          />
          <FormControlLabel
            value="Extended"
            control={<Radio />}
            label="Extended: Categories can be equivalent if they point to nodes that are connected by contains ties"
          />
          <FormControlLabel
            value="Extended-languages"
            control={<Radio />}
            label="TBD - Extended-languages: Categories can be equivalent if they have languages that are connected via contains ties"
            disabled
          />
          <FormControlLabel
            value="Refined"
            control={<Radio />}
            label="TBD - Refined: Categories are only equivalent if they point to the same node and are within a specified window of time and distance"
            disabled
          />
        </RadioGroup>
      </FormControl>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={returnAllCategories}
              onChange={handleCheckChange}
              name="returnAllCategories"
              color="primary"
            />
          }
          label={`Return only categories matched across all datasets`}
        />
      </FormGroup>

      <Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white',
        '&:hover': {
          backgroundColor: 'green',
        },
        mr: 4
      }} onClick={handleSubmit}>
        Submit
      </Button>
      <Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white',
        '&:hover': {
          backgroundColor: 'green',
        },
      }} onClick={downloadMerge}
       disabled={
    !data || 
    (Array.isArray(data) && data.length === 0) || 
    (typeof data === "object" && Object.keys(data).length === 0)
  }>
        Download Results
      </Button>
      <Backdrop
        open={loading}
        style={{ color: '#fff', zIndex: 1200 }}
      >
        <CircularProgress color="inherit" />
        <span style={{ marginLeft: 16 }}>Processing...</span>
      </Backdrop>
    </Box>
  )
}

export default Propose_Merge;