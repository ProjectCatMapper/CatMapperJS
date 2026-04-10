import React, { useState, useEffect, useMemo } from 'react'
import { Box, Button, FormControlLabel, Radio, RadioGroup, Checkbox, Typography, Divider, Select, NativeSelect, TextField, MenuItem, FormControl, FormGroup, Snackbar, Alert, Paper, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
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
  const [crossSourceDomain, setCrossSourceDomain] = useState('');
  const [crossTargetDomain, setCrossTargetDomain] = useState('');
  const [crossReturnDomain, setCrossReturnDomain] = useState('');
  const [crossPrimaryDataset, setCrossPrimaryDataset] = useState('');
  const [crossMaxHops, setCrossMaxHops] = useState(3);
  const [mergeInputError, setMergeInputError] = useState('');
  const [validatedDatasets, setValidatedDatasets] = useState([]);
  const [mergeWarning, setMergeWarning] = useState('');
  const [mergeError, setMergeError] = useState('');

  const [advoptions, setadvoptions] = React.useState(['ANY DOMAIN']);

  const parseDatasetIds = () =>
    inputValue
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

  const toDomainLabel = (value) => (value === "DISTRICT" ? "AREA" : value);
  const fromDomainLabel = (value) => (value === "AREA" ? "DISTRICT" : value);

  const crossDomainOptions = useMemo(() => {
    const subdomains = Object.values(selectedCategory || {}).flat().filter(Boolean);
    return [...new Set(subdomains)].filter((value) => value !== "ANY DOMAIN");
  }, [selectedCategory]);

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

  useEffect(() => {
    if (crossDomainOptions.length === 0) return;
    if (!crossSourceDomain) setCrossSourceDomain(crossDomainOptions[0]);
    if (!crossTargetDomain) setCrossTargetDomain(crossDomainOptions[0]);
  }, [crossDomainOptions, crossSourceDomain, crossTargetDomain]);

  useEffect(() => {
    const datasetIds = validatedDatasets
      .map((row) => row.CMID || row.cmid)
      .filter(Boolean);
    if (datasetIds.length === 0) {
      setCrossPrimaryDataset('');
      return;
    }
    if (!datasetIds.includes(crossPrimaryDataset)) {
      setCrossPrimaryDataset(datasetIds[0]);
    }
  }, [validatedDatasets, crossPrimaryDataset]);

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
    const keyDomain = selectedOption === "CrossDomain"
      ? fromDomainLabel((crossSourceDomain || "").trim())
      : advdomainDrop;
    if (!keyDomain) {
      alert('Select a source domain before loading key variables.');
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/getKeys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "names": inputValue,
          "database": database,
          "subdomain": keyDomain
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
    const isCrossDomain = selectedOption === "CrossDomain";
    if (!isCrossDomain && firstDropdownValue === "") {
      alert("Please select a category domain to match")
      return;
    }
    if (isCrossDomain) {
      if (!crossSourceDomain || !crossTargetDomain) {
        alert("Please select both source and target domains for cross-domain matching.");
        return;
      }
      if (!crossPrimaryDataset) {
        alert("Please choose a primary dataset for cross-domain matching.");
        return;
      }
    }
    setMergeWarning('');
    setMergeError('');
    setLoading(true)
    try {
      const payload = {
        "datasetChoices": inputValue,
        "categoryLabel": advdomainDrop,
        "intersection": returnAllCategories,
        "database": database,
        "mergelevel": mergeLevel,
        "equivalence": selectedOption,
        "resultFormat": resultFormat,
        "selectedKeyvariable": selectedKeyVariables
      };
      if (isCrossDomain) {
        payload.sourceDomain = fromDomainLabel(crossSourceDomain);
        payload.targetDomain = fromDomainLabel(crossTargetDomain);
        payload.returnDomain = crossReturnDomain ? fromDomainLabel(crossReturnDomain) : "";
        payload.primaryDataset = crossPrimaryDataset;
        payload.maxHops = Number(crossMaxHops) || 3;
      }
      const response = await fetch(`${process.env.REACT_APP_API_URL}/proposeMergeSubmit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
      await downloadMerge(result, isCrossDomain);
      setOpen(true);
    } catch (error) {
      setMergeError('Error submitting form. Please try again.');
      console.error('Error submitting form:', error);
    }
    finally {
      setLoading(false);
    }
  };

  const downloadMerge = async (resultData, isCrossDomain = false) => {
    const isInvalid = !resultData ||
      (Array.isArray(resultData) && resultData.length === 0) ||
      (typeof resultData === "object" && Object.keys(resultData).length === 0);

    if (isInvalid) {
      console.warn("Download aborted: No valid data provided.");
      alert("There is no data available to download.");
      return; // Exit the function early
    }
    const filename = inputValue.split(",").map(s => s.trim()).join("_");
    const modeLabel = isCrossDomain
      ? `${toDomainLabel(crossSourceDomain)}_to_${toDomainLabel(crossTargetDomain)}`
      : advdomainDrop;
    const { downloadJsonAsXlsx } = await import('../utils/excelExport');
    await downloadJsonAsXlsx(resultData, {
      fileName: `ProposedMerge_${filename}_${modeLabel}.xlsx`,
      sheetName: 'Sheet1',
    });
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
      {selectedOption !== "CrossDomain" ? (
        <>
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
                    {toDomainLabel(category)}
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
                    {toDomainLabel(value)}
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
        </>
      ) : (
        <>
          <h4 style={{ color: 'black', padding: "1px" }}>Choose Cross-Domain Settings</h4>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Box>
              <Typography variant="h7" style={{ color: 'black', padding: '1px' }}>
                Source Domain
              </Typography>
              <NativeSelect
                value={crossSourceDomain}
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
                }}
                onChange={(event) => setCrossSourceDomain(event.target.value)}
              >
                {crossDomainOptions.map((value) => (
                  <option key={`cross-source-${value}`} value={value}>{toDomainLabel(value)}</option>
                ))}
              </NativeSelect>
            </Box>
            <Box>
              <Typography variant="h7" style={{ color: 'black', padding: '1px' }}>
                Target Domain
              </Typography>
              <NativeSelect
                value={crossTargetDomain}
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
                }}
                onChange={(event) => setCrossTargetDomain(event.target.value)}
              >
                {crossDomainOptions.map((value) => (
                  <option key={`cross-target-${value}`} value={value}>{toDomainLabel(value)}</option>
                ))}
              </NativeSelect>
            </Box>
            <Box>
              <Typography variant="h7" style={{ color: 'black', padding: '1px' }}>
                Return Domain (Optional)
              </Typography>
              <NativeSelect
                value={crossReturnDomain}
                sx={{
                  fontSize: 16,
                  letterSpacing: 0.5,
                  borderRadius: 1,
                  backgroundColor: "white",
                  border: "2px solid #1976d2",
                  height: 42,
                  minWidth: "16vw",
                  "& .MuiNativeSelect-select": {
                    padding: "8px 12px",
                  },
                }}
                onChange={(event) => setCrossReturnDomain(event.target.value)}
              >
                <option value="">(Use target domain)</option>
                {crossDomainOptions.map((value) => (
                  <option key={`cross-return-${value}`} value={value}>{toDomainLabel(value)}</option>
                ))}
              </NativeSelect>
            </Box>
            <Box>
              <Typography variant="h7" style={{ color: 'black', padding: '1px' }}>
                Primary Dataset
              </Typography>
              <NativeSelect
                value={crossPrimaryDataset}
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
                }}
                onChange={(event) => setCrossPrimaryDataset(event.target.value)}
              >
                {(validatedDatasets || []).map((row) => {
                  const id = row.CMID || row.cmid;
                  if (!id) return null;
                  return (
                    <option key={`primary-${id}`} value={id}>{id}</option>
                  );
                })}
              </NativeSelect>
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
        </>
      )}
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
            value="CrossDomain"
            control={<Radio />}
            label="Cross-domain (experimental): Match across domains using CONTAINS plus the discovered *_OF relationship"
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
      {selectedOption === "CrossDomain" && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="h7" style={{ color: 'black', padding: '1px' }}>
            Choose Max Hops for Cross-Domain Search
          </Typography>
          <Select
            label="Cross Domain Max Hops"
            value={crossMaxHops}
            style={{ height: 40 }}
            sx={{ m: 1, width: '12vw' }}
            onChange={(event) => setCrossMaxHops(event.target.value)}
          >
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <MenuItem key={level} value={level}>{level}</MenuItem>
            ))}
          </Select>
          <Tooltip title={"Cross-domain traversal uses CONTAINS on both sides plus one *_OF relation, capped by this hop limit."} arrow>
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

    </Box>
  )
}

export default Propose_Merge;
