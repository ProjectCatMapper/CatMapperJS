import React, { useState, useEffect } from 'react'
import { Box, Button, FormControlLabel, Radio, RadioGroup, Checkbox, Typography, Divider, Select, NativeSelect, TextField, MenuItem, FormControl, FormGroup, Snackbar, Alert, Paper, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import * as XLSX from 'xlsx';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import InfoIcon from '@mui/icons-material/Info';
import { useMetadata } from './UseMetadata';
import DownloadDatasetButton from './DownloadDatasetListButton';
import { useAuth } from './AuthContext';
import SavedCmidInsertPopover from './SavedCmidInsertPopover';
// import infodata from './infodata.json';

const Propose_Merge = ({ database }) => {
  const { user, cred } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [, setData] = useState();
  const [mergeLevel, setMergeLevel] = useState(1);
  const [firstDropdownValue, setFirstDropdownValue] = useState('ANY DOMAIN');
  const [resultFormat, setResultFormat] = useState("key-to-key");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [keysByDataset, setkeysByDataset] = useState(false);
  const [selectedKeyVariables, setSelectedKeyVariables] = useState({});
  const { infodata } = useMetadata(database);
  const [selectedCategory, setSelectedCategory] = useState({});
  const [advdomainDrop, setadvdomainDrop] = React.useState('ANY DOMAIN');
  const [mergeInputError, setMergeInputError] = useState('');
  const [validatedDatasets, setValidatedDatasets] = useState([]);
  const [mergeResults, setMergeResults] = useState([]);
  const [mergeWarning, setMergeWarning] = useState('');
  const [mergeError, setMergeError] = useState('');
  const [hasSubmittedMerge, setHasSubmittedMerge] = useState(false);

  const [advoptions, setadvoptions] = React.useState(['ANY DOMAIN']);
  const resultColumns = React.useMemo(() => {
    const columns = [];
    mergeResults.forEach((row) => {
      Object.keys(row || {}).forEach((key) => {
        if (!columns.includes(key)) columns.push(key);
      });
    });
    return columns;
  }, [mergeResults]);

  const parseDatasetIds = () =>
    inputValue
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

  const validateDatasetInputs = () => {
    const datasetIds = parseDatasetIds();
    const invalid = datasetIds.filter((cmid) => !/^(SD|AD)\d+$/i.test(cmid));
    if (invalid.length > 0) {
      setMergeInputError(`Only DATASET CMIDs are allowed here. Invalid values: ${invalid.join(', ')}`);
      return false;
    }
    setMergeInputError('');
    return true;
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/metadata/subdomains/${database}`)
      .then((res) => res.json())
      .then((data) => {
        const normalized = {};

        data.forEach(({ domain, subdomains }) => {
          normalized[domain] = subdomains;
        });

        delete normalized["ALL NODES"]

        setSelectedCategory(normalized);
      })
      .catch((err) => {
        console.error("Error loading subdomains:", err);
      });
  }, [database]);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/metadata/domainDescriptions/${database}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load domain descriptions");
        return res.json();
      })
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error("Error loading categories:", err);
      });
  }, [database]);

  const tooltipContent = (
    <div style={{ maxWidth: '400px' }}>
      <h3>From which category domain do you want to find matches?</h3>
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
              <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{category.label === "DISTRICT" ? "AREA" : category.label}</td>
              <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{category.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const tooltipContent2 = (
    <div style={{ maxWidth: '400px' }}>
      <h3>From which category sub-domain do you want to find matches?</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px' }}>Label</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {infodata && selectedCategory?.[firstDropdownValue]?.length > 0 ? (
            infodata
              .filter(desc => selectedCategory[firstDropdownValue].includes(desc.label))
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

  const [selectedOption, setSelectedOption] = useState('Standard');

  const handleRadioChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const [returnAllCategories, setReturnAllCategories] = useState(true);

  const handleCheckChange = (event) => {
    setReturnAllCategories(event.target.checked);
  };

  const handleValidate = async () => {
    if (!validateDatasetInputs()) return;
    try {
      const response = await fetch(process.env.REACT_APP_API_URL + "/validateDatasets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          names: inputValue,
          database: database,
        }),
      });

      const result = await response.json();
      const rows = result.datasets || [];
      setValidatedDatasets(rows);

      if (result.success === true) {
        alert("Validation successful: " + (result.message || "All nodes exist."));
        setIsValid(true);
      } else {
        const missing = Array.isArray(result.missing) && result.missing.length > 0
          ? " Missing IDs: " + result.missing.join(", ") + "."
          : "";
        alert("Validation failed: " + (result.message || "Some nodes are missing.") + missing);
        setIsValid(false);
      }
    } catch (error) {
      setIsValid(false);
      setValidatedDatasets([]);
      alert("Validation failed. Please try again.");
    }
  };

  const getKeys = async () => {
    if (!validateDatasetInputs()) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/getKeys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "names": inputValue,
          "database": database,
          "subdomain": advdomainDrop
        }),
      });

      const result = await response.json();
      if (result.success === true) {
        setkeysByDataset(result.keysByDataset || {});
        setIsValid(true);
      }
      else {
        //alert(`Validation failed: ${result.message}`);
        setIsValid(false);
        setkeysByDataset(result.keysByDataset || {});
      }
    } catch (error) {
      alert('Validation failed. Please try again.');
    }
  };


  const handleSubmit = async () => {
    if (!validateDatasetInputs()) return;
    if (!isValid) {
      alert('Please validate successfully before submitting.');
      return;
    }
    if (firstDropdownValue === "") {
      alert("Please select a category domain to match")
      return;
    }
    setHasSubmittedMerge(true);
    setMergeResults([]);
    setMergeWarning('');
    setMergeError('');
    setLoading(true)
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/proposeMergeSubmit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "datasetChoices": inputValue,
          "categoryLabel": advdomainDrop,
          "intersection": returnAllCategories,
          "database": database,
          "mergelevel": mergeLevel,
          "equivalence": selectedOption,
          "resultFormat": resultFormat,
          "selectedKeyvariable": selectedKeyVariables
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        const message = result?.error || result?.message || 'Unable to generate merge proposal.';
        setMergeError(message);
        return;
      }
      if (
        !result ||
        (Array.isArray(result) && result.length === 0) ||
        (typeof result === "object" && Object.keys(result).length === 0)
      ) {
        setMergeWarning("No merge results found for the current settings.");
        return;
      }
      if (!Array.isArray(result)) {
        setMergeError(result?.message || result?.error || 'Unexpected response format.');
        return;
      }
      setMergeResults(result);
      setData(result)
      setOpen(true);
    } catch (error) {
      setMergeError('Error submitting form. Please try again.');
      console.error('Error submitting form:', error);
    }
    finally {
      setLoading(false);
    }
  };

  const downloadMerge = (resultData) => {
    const isInvalid = !resultData ||
      (Array.isArray(resultData) && resultData.length === 0) ||
      (typeof resultData === "object" && Object.keys(resultData).length === 0);

    if (isInvalid) {
      console.warn("Download aborted: No valid data provided.");
      alert("There is no data available to download.");
      return; // Exit the function early
    }
    const worksheet = XLSX.utils.json_to_sheet(resultData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = inputValue.split(",").map(s => s.trim()).join("_");
    a.download = `ProposedMerge_${filename}_${advdomainDrop}.xlsx`;
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
      <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        Select Datasets for Merging
        <DownloadDatasetButton databaseName={database} fileName="dataset_list.xlsx" />
      </h4>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <TextField
          label="Enter DatasetIDs separated by commas"
          variant="outlined"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setMergeInputError('');
            setIsValid(false);
            setValidatedDatasets([]);
          }}
          error={Boolean(mergeInputError)}
          helperText={mergeInputError || 'Only DATASET CMIDs are valid here (SD/AD).'}
          sx={{ mr: 2, width: '34vw' }}
        />
        <Button variant="contained" onClick={handleValidate}>
          Validate DatasetIDs
        </Button>
      </Box>
      <Box sx={{ mt: 1 }}>
        <SavedCmidInsertPopover
          user={user}
          cred={cred}
          database={database}
          datasetOnly
          title="Insert Dataset from Bookmarks/History"
          onInsert={(cmid) => {
            const ids = parseDatasetIds();
            if (!ids.includes(cmid)) {
              setInputValue([...ids, cmid].join(', '));
            }
          }}
        />
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

      {validatedDatasets.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, mb: 2, maxWidth: "100%" }}>
          <Table size="small" aria-label="validated dataset details">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>CMID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>CMName</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>shortName</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>DatasetCitation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {validatedDatasets.map((row) => (
                <TableRow key={row.CMID || row.cmid}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{row.CMID || row.cmid || ""}</TableCell>
                  <TableCell>{row.CMName || row.cmname || ""}</TableCell>
                  <TableCell>{row.shortName || row.shortname || ""}</TableCell>
                  <TableCell>{row.DatasetCitation || row.datasetcitation || ""}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Divider sx={{ my: 2 }} />
      <h4 style={{ color: 'black', padding: "1px" }}>Choose Domain</h4>
      <Box display="flex" alignItems="center" gap={2}>
        <Box>
          <Typography variant="h7" style={{ color: 'black', padding: '1px' }}>
            Select Category Domain
          </Typography>
          <NativeSelect
            value={firstDropdownValue}
            label="First Dropdown"
            sx={{
              fontSize: 16,
              letterSpacing: 0.5,
              borderRadius: 1,
              backgroundColor: "white",
              border: "2px solid #1976d2",
              height: 42,
              minWidth: "14vw",
              "& .MuiNativeSelect-select": {
                padding: "8px 12px",
              },
              "&:hover": {
                borderColor: "#115293",
              },
              "&:focus-within": {
                borderColor: "#0d47a1",
                boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
              },
            }}
            onChange={(event) => {
              const newDomain = event.target.value;
              const subdomains = selectedCategory[newDomain] || [];

              setFirstDropdownValue(newDomain);
              setadvoptions(subdomains);
              setadvdomainDrop(subdomains[0] || '');
            }}
          >
            {Object.keys(selectedCategory).map((category, index) => (
              <option key={index} value={category}>
                {category === "DISTRICT" ? "AREA" : category}
              </option>
            ))}
          </NativeSelect>
          <Tooltip title={tooltipContent} arrow>
            <Button
              startIcon={
                <InfoIcon sx={{ height: "28px", width: "28px" }} />
              }
            ></Button>
          </Tooltip>
        </Box>
        <Box>
          <Typography variant="h7" style={{ color: 'black', padding: '1px' }}>
            Select Category Sub-Domain
          </Typography>
          <NativeSelect
            label="second Dropdown"
            value={advdomainDrop}
            sx={{
              fontSize: 16,
              letterSpacing: 0.5,
              borderRadius: 1,
              backgroundColor: "white",
              border: "2px solid #1976d2",
              height: 42,
              minWidth: "14vw",
              "& .MuiNativeSelect-select": {
                padding: "8px 12px",
              },
              "&:hover": {
                borderColor: "#115293",
              },
              "&:focus-within": {
                borderColor: "#0d47a1",
                boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
              },
            }}
            onChange={(event) => {
              setadvdomainDrop(event.target.value);
            }}
          >
            {advoptions.map((value, index) => (
              <option key={index} value={value}>
                {value === "DISTRICT" ? "AREA" : value}
              </option>
            ))}
          </NativeSelect>
          <Tooltip title={tooltipContent2} arrow>
            <Button
              startIcon={
                <InfoIcon sx={{ height: "28px", width: "28px" }} />
              }
            ></Button>
          </Tooltip>
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={showAdvanced}
              onChange={(e) => setShowAdvanced(e.target.checked)}
              color="primary"
            />
          }
          label="Advanced Options"
        />
      </Box>
      {showAdvanced && (
        <Box>
          <Paper
            elevation={3}
            sx={{ mt: 1, p: 1, backgroundColor: 'rgba(0, 0, 0, 1)' }}
          >
            <Box>
              <Typography variant="h7" style={{ color: 'white', padding: '1px' }}>
                Choose Result Format
              </Typography>
              <Select
                label="resultFormat"
                value={resultFormat}
                style={{ height: 40, color: "black", backgroundColor: "white" }}
                sx={{ m: 1, width: '12vw' }}
                onChange={(event) => setResultFormat(event.target.value)}
              >
                {["key-to-key", "key-to-category", "category-to-category"].map((level) => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
              <Tooltip title={"The default key-to-key option exports a spreadsheet with rows showing how each key from one dataset corresponds to a key from another dataset. The key-to-category option exports a spreadsheet with one row per key and dataset pair and shows which CatMapper category the key points to.  The category-to-category option exports a spreadsheet showing how each category in one dataset is associated with a category in another dataset."} arrow>
                <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
              </Tooltip>
            </Box>
            <br />
            <FormControlLabel
              sx={{ color: "white" }}
              control={
                <Checkbox
                  checked={showKeys}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setShowKeys(checked)
                    if (checked) {
                      getKeys();
                    }
                  }}
                  sx={{
                    color: "white",
                    "&.Mui-checked": {
                      color: "white",
                    },
                  }}
                />
              }
              label="Select Key variables"
            />
            {showKeys && isValid && (
              <Box sx={{ mt: 2 }}>
                {Object.entries(keysByDataset).map(([datasetID, keys]) => {
                  const hasKeys = keys && keys.length > 0;

                  return (
                    <Box key={datasetID} sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ color: 'white', minWidth: 150 }}>{`Key variables for ${datasetID}`}</Box>
                      {hasKeys ? (
                        <FormControl sx={{ flex: 1 }} key={datasetID}>
                          <Select
                            value={selectedKeyVariables[datasetID] || ""}
                            onChange={(e) =>
                              setSelectedKeyVariables((prev) => ({
                                ...prev,
                                [datasetID]: e.target.value,
                              }))
                            }
                            sx={{
                              color: "white",
                              ".MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                              "& .MuiSvgIcon-root": { color: "white" },
                            }}
                          >
                            {keys.map((k) => (
                              <MenuItem key={k} value={k}>
                                {k}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <Box
                          sx={{
                            flex: 1,
                            color: "gray",
                            border: "1px solid gray",
                            p: 1.2,
                            borderRadius: 1,
                            opacity: 0.7,
                          }}
                        >
                          No keys exist
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Box>)}
      <h4 style={{ color: 'black', padding: "1px" }}>Choose Equivalence Criteria</h4>
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
      {selectedOption === "Extended" && (
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
          <Tooltip title={"This specifies how many steps to search through the CONTAINS tie network to find a potential matching category."} arrow>
            <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
          </Tooltip>
        </Box>
      )}
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

      <Backdrop
        open={loading}
        style={{ color: '#fff', zIndex: 1200 }}
      >
        <CircularProgress color="inherit" />
        <span style={{ marginLeft: 16 }}>Processing...</span>
      </Backdrop>

      {mergeError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {mergeError}
        </Alert>
      )}

      {mergeWarning && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {mergeWarning}
        </Alert>
      )}

      {hasSubmittedMerge && (
        <Box sx={{ mt: 3 }}>
          <Paper
            elevation={1}
            sx={{
              p: 1.5,
              mb: 1,
            }}
          >
            <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              columnGap: 2,
              rowGap: 1
            }}
          >
            <Typography variant="h6" style={{ color: 'black', flex: '1 1 auto' }}>
              Merge Results ({mergeResults.length})
            </Typography>
            <Button
              variant="contained"
              onClick={() => downloadMerge(mergeResults)}
              disabled={mergeResults.length === 0}
              sx={{ flexShrink: 0 }}
            >
              Download Results
            </Button>
            </Box>
          </Paper>
          {mergeResults.length > 0 && (
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: "55vh", maxWidth: "100%", overflowX: "auto", mt: 0.5 }}>
              <Table size="small" stickyHeader aria-label="merge results table" sx={{ minWidth: "max-content" }}>
                <TableHead>
                  <TableRow>
                    {resultColumns.map((col) => (
                      <TableCell key={col} sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mergeResults.map((row, rowIndex) => (
                    <TableRow key={`merge-row-${rowIndex}`}>
                      {resultColumns.map((col) => (
                        <TableCell key={`${rowIndex}-${col}`} sx={{ whiteSpace: "nowrap" }}>
                          {Array.isArray(row[col]) ? row[col].join(", ") : String(row[col] ?? "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  )
}

export default Propose_Merge;
