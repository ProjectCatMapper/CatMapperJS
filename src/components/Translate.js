import { useEffect, useMemo, useRef, useState } from 'react';
import domainOptions from "./SearchSelectDropdown";
import { Select, MenuItem } from '@mui/material';
import Button from '@mui/material/Button';
import { Typography, Box, FormControlLabel, Checkbox, IconButton } from '@mui/material';
import TranslateTable from './TranslateResults';
import Backdrop from '@mui/material/Backdrop';
import LinearProgress from '@mui/material/LinearProgress';
import './Translate.css'
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import infodata from './infodata.json';
import FooterLinks from './FooterLinks';
import { parseTabularFile } from '../utils/tabularUpload';
import TranslateMatchReview from './TranslateMatchReview';
import { useAuth } from './AuthContext';
import { addReviewIds, getMatchTypePercentages, stripReviewFields } from '../utils/translateReview';
import { DataGrid } from '@mui/x-data-grid';
import { downloadJsonAsXlsx } from '../utils/excelExport';

const getTooltipContent = (nm) => {
  const tooltipTexts = {
    UPLOAD_INSTRUCTION: 'Upload a spreadsheet of category names for an automated proposal of matches to CatMapper categories". See <https://catmapper.org/help/> for more information.',
    INPUT_COLUMN: 'Column in input spreadsheet you want to find matches for in CatMapper?',
    DOMAIN_SELECTION: 'From which category domain do you want to find matches?',
    MATCH_PROPERTY: 'Usually this will be Name. This allows advanced users to mach by other category properties in CatMapper, such as CatMapper ID or Key.',
    FILTER_BY_COUNTRY: 'This permits only finding matches to categories associated with a specific country.  This requires an additional spreadsheet column with the CatMapper ID for the country.',
    FILTER_BY_CONTEXT: "This permits only finding matches to categories that are contained by specific contexts (e.g., only counties in Ohio).  This requires an additional spreadsheet column with the CatMapper ID for the context (e.g., Ohio's CatMapper ID in SocioMap is SM2577)",
    FILTER_BY_DATASET: "This permits only finding matches to categories that are used by a specific dataset (e.g., only language categories used by glottolog 4.4).  This requires an additional spreadsheet column with the CatMapper ID for the dataset (e.g., the CatMapper ID for glottolog 4.4 is SD20)",
    TIME_RANGE: 'Specify a time range which matching categories need to fall within.  This uses  information about the years for which a category was observed.',
    TBD_OPTION: 'Checking this button… TBD',
    MATCH_STATISTICS: "Summary table + review row colors use the same legend: exact match (white), fuzzy match (orange), one-to-many (salmon), many-to-one (pink), and no match (yellow). Percentages are out of all uploaded rows for the selected match column.",
    SPLIT_CATEGORIES: "Press apply to split categories in the selected category domain by the selected separator.  This will create new rows for each split category, and will assign them the same context (e.g., country) as the combined category.",
    COMBINE_IDENTICAL: "Checking this button will combine identical categories from the selected column into a single row for matching, although it will preserve other information if selected. For example, if Country, Context, and/or Dataset is checked then categories will be considered identical only if they have the same spelling and are associated with the same Country, Context, and/or Dataset.  This is useful if your spreadsheet has many identical categories that you want to match only once to speed up processing time and make corrections easier.",
  };

  return tooltipTexts[nm];
};

const fallbackOptions = ["Name", "Key", "CatMapper ID (CMID)"];
const EXCEL_CELL_CHAR_LIMIT = 32767;

const sanitizeRowsForExcelExport = (rows, limit = EXCEL_CELL_CHAR_LIMIT) => {
  let truncatedCells = 0;
  const sanitizedRows = (Array.isArray(rows) ? rows : []).map((row) => {
    if (!row || typeof row !== 'object') return row;
    const nextRow = { ...row };
    Object.keys(nextRow).forEach((key) => {
      const value = nextRow[key];
      if (typeof value !== 'string') return;
      if (value.length <= limit) return;
      nextRow[key] = value.slice(0, limit);
      truncatedCells += 1;
    });
    return nextRow;
  });
  return { sanitizedRows, truncatedCells };
};

function TranslateComponent({ database }) {
  const { user, cred } = useAuth();

  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [zeroDropdownValue, setZeroDropdownValue] = useState([]);
  const [firstDropdownValue, setFirstDropdownValue] = useState("ANY DOMAIN");
  const [dropdownData, setDropdownData] = useState([]);
  const [subDomain, setsubDomain] = useState([]);
  const [secondDropdownValue, setsecondDropdownValue] = useState(["Name"]);
  const [thirdDropdownValue, setthirdDropdownValue] = useState([""]);
  const [fourthDropdownValue, setfourthDropdownValue] = useState([""]);
  const [fifthDropdownValue, setfifthDropdownValue] = useState([""]);
  const [svalues, setsvalues] = useState(["Name", "SocioMapID"]);
  const [columns, setColumns] = useState([]);
  const [reviewRows, setReviewRows] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [tcategories, setTcategories] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isCheckedtwo, setIsCheckedtwo] = useState(false);
  const [isCheckedthree, setIsCheckedthree] = useState(false);
  const [isCheckedfour, setIsCheckedfour] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [loadingElapsedSeconds, setLoadingElapsedSeconds] = useState(0);
  const [translateTaskId, setTranslateTaskId] = useState('');
  const translatePollTimeoutRef = useRef(null);
  const translateAbortRef = useRef(null);
  const [filename, setFilename] = useState("");
  const [jsonData, setJsondata] = useState();
  let query = "false"

  const [isUniqueRows, setUniqueRows] = useState(false);

  const handleUniqueRows = (event) => {
    setUniqueRows(event.target.checked);
  };

  const [isCountSameName, setCountSameName] = useState(false);

  const handleCountSameName = (event) => {
    setCountSameName(event.target.checked);
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    if (isChecked) {
      setthirdDropdownValue([""]);
    }
  }

  const handleCheckboxChangetwo = () => {
    setIsCheckedtwo(!isCheckedtwo);
    if (isCheckedtwo) {
      setfourthDropdownValue([""]);
    }
  }

  const handleCheckboxChangethree = () => {
    setIsCheckedthree(!isCheckedthree);
    if (isCheckedthree) {
      setfifthDropdownValue([""]);
    }
  }

  const handleCheckboxChangefour = () => {
    setIsCheckedfour(!isCheckedfour);
  }

  const clearTranslatePoll = () => {
    if (translatePollTimeoutRef.current) {
      clearTimeout(translatePollTimeoutRef.current);
      translatePollTimeoutRef.current = null;
    }
  };

  const applyTranslateResult = (responseData) => {
    const warnings = Array.isArray(responseData?.warnings)
      ? responseData.warnings.filter((msg) => typeof msg === 'string' && msg.trim() !== '')
      : [];
    if (warnings.length > 0) {
      alert(`Warning: ${warnings.join(' ')}`);
    }

    const allKeys = Array.isArray(responseData?.order) ? responseData.order : [];
    const matchedColumn = zeroDropdownValue;

    const patternPrefixes = [
      'matching_',
      'matchingDistance_',
      'matchType_',
      'CMName_',
      'CMID_',
      'label_',
      'CMcountry_',
    ];

    const suffixColumns = patternPrefixes.map(prefix => prefix + zeroDropdownValue).filter(col => allKeys.includes(col));
    const usedColumns = new Set([matchedColumn, 'CMuniqueRowID', ...suffixColumns]);
    const remainingColumns = allKeys.filter(key => !usedColumns.has(key));

    const reorderedColumns = [
      matchedColumn,
      ...suffixColumns,
      'CMuniqueRowID',
      ...remainingColumns
    ];

    const withReviewIds = addReviewIds(responseData.file || []);
    setReviewRows(withReviewIds);
    setColumns(reorderedColumns);
    setTcategories(getMatchTypePercentages(withReviewIds, zeroDropdownValue));
  };

  const pollTranslateTaskStatus = (taskId) => {
    const pollDelayMs = 1000;
    clearTranslatePoll();

    translatePollTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/translate/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskId }),
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          const message = payload?.error || 'Unable to read translation status.';
          setError(message);
          setLoading(false);
          setLoadingStage('');
          setLoadingPercent(0);
          setTranslateTaskId('');
          return;
        }

        setLoadingStage(payload?.message || 'Processing translation...');
        setLoadingPercent(Math.max(0, Math.min(100, Number(payload?.percent ?? 0))));
        setLoadingElapsedSeconds(Number(payload?.elapsedSeconds ?? 0));

        const status = String(payload?.status || '').toLowerCase();
        if (status === 'processing') {
          pollTranslateTaskStatus(taskId);
          return;
        }

        clearTranslatePoll();
        setTranslateTaskId('');
        setLoading(false);

        if (status === 'completed') {
          setLoadingStage('Parsing results...');
          applyTranslateResult(payload);
          setLoadingStage('');
          setLoadingPercent(100);
          return;
        }

        if (status === 'canceled') {
          setLoadingStage('');
          setLoadingPercent(0);
          return;
        }

        setLoadingStage('');
        setLoadingPercent(0);
        setError(payload?.error || 'Propose translate failed.');
      } catch (error) {
        if (error?.name === 'AbortError') {
          return;
        }
        setLoading(false);
        setLoadingStage('');
        setLoadingPercent(0);
        setTranslateTaskId('');
        setError('Unable to read translation status.');
      }
    }, pollDelayMs);
  };

  const handleClick = async () => {
    clearTranslatePoll();
    if (translateAbortRef.current) {
      translateAbortRef.current.abort();
    }
    const controller = new AbortController();
    translateAbortRef.current = controller;

    setLoading(true);
    setLoadingStage('Processing input...');
    setLoadingPercent(10);
    setLoadingElapsedSeconds(0);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/translate/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          database: database,
          property: secondDropdownValue,
          domain: subDomain && subDomain.length > 0 ? subDomain : firstDropdownValue,
          key: String(isCheckedfour),
          term: zeroDropdownValue,
          country: thirdDropdownValue,
          context: fourthDropdownValue,
          dataset: fifthDropdownValue,
          yearStart: inputValue,
          yearEnd: inputValuetwo,
          table: jsonData,
          query: query,
          countsamename: isCountSameName,
          uniqueRows: isUniqueRows,
          batchSize: 500,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        alert('Propose translate was not completed, please check your matching column for unusual characters and please contact the CatMapper team if the issue persists.');
        setLoading(false);
        setLoadingStage('');
        setLoadingPercent(0);
        return;
      }

      const responseData = await response.json().catch(() => ({}));
      const taskId = responseData?.taskId;
      if (!taskId) {
        throw new Error('Translation task did not start.');
      }

      setTranslateTaskId(taskId);
      setLoadingStage(responseData?.message || 'Processing input...');
      setLoadingPercent(Math.max(0, Math.min(100, Number(responseData?.percent ?? 10))));
      setLoadingElapsedSeconds(Number(responseData?.elapsedSeconds ?? 0));
      pollTranslateTaskStatus(taskId);

    } catch (error) {
      if (error?.name === 'AbortError') {
        return;
      }
      console.error('Error sending POST request:', error);
      setError('Unable to start translation.');
      setLoading(false);
      setLoadingStage('');
      setLoadingPercent(0);
      setTranslateTaskId('');
    }
    finally {
      if (translateAbortRef.current === controller) {
        translateAbortRef.current = null;
      }
    }
  };

  const handleCancelTranslate = async () => {
    clearTranslatePoll();
    if (translateAbortRef.current) {
      translateAbortRef.current.abort();
      translateAbortRef.current = null;
    }
    if (translateTaskId) {
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/translate/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskId: translateTaskId }),
        });
      } catch (_error) {
        // ignore network errors while canceling
      }
    }
    setTranslateTaskId('');
    setLoading(false);
    setLoadingStage('');
    setLoadingPercent(0);
    setLoadingElapsedSeconds(0);
  };

  useEffect(() => {
    return () => {
      clearTranslatePoll();
      if (translateAbortRef.current) {
        translateAbortRef.current.abort();
        translateAbortRef.current = null;
      }
    };
  }, []);

  const handleClicktwo = async () => {
    try {
      const exportRows = stripReviewFields(reviewRows);
      const { sanitizedRows, truncatedCells } = sanitizeRowsForExcelExport(exportRows);

      const date = new Date().toISOString().split('T')[0];
      const customFileName = `${filename}_Matched_${date}.xlsx`;

      await downloadJsonAsXlsx(sanitizedRows, {
        fileName: customFileName,
        sheetName: 'Sheet1',
        headers: columns,
      });

      if (truncatedCells > 0) {
        alert(
          `Downloaded file with ${truncatedCells} cell value(s) truncated to Excel's 32767-character limit.`
        );
      }
    } catch (err) {
      console.error('Error exporting translated spreadsheet:', err);
      setError(err?.message || 'Unable to export translated spreadsheet.');
    }
  };

  const [inputValue, setinputValue] = useState(-4000);
  const [inputValuetwo, setinputValuetwo] = useState(2024);
  const [inputValueSep, setinputValueSep] = useState(';');

  const handleClickSeparator = () => {
    if (!jsonData || !zeroDropdownValue || !inputValueSep) return;

    const newTable = jsonData.flatMap(row => {
      const cellValue = row[zeroDropdownValue];
      if (cellValue == null) return [row]; // keep row as-is if empty

      // Split + trim each part
      const parts = String(cellValue)
        .split(inputValueSep)
        .map(part => part.trim())   // ✅ trim whitespace
        .filter(part => part.length > 0);

      return parts.map(part => ({
        ...row,
        [zeroDropdownValue]: part, // replace with trimmed value
      }));
    });

    setJsondata(newTable);

    const newColumns = Object.keys(newTable[0] || {});
    setColumns(newColumns);
    setPreviewRows(newTable);
  };

  const handleFileChange = async (event) => {
    setSelectedFile(null);
    setError(null);
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError(`File size exceeds 50MB limit.`);
      return;
    }

    const fileName = file.name;
    const baseFileName = fileName.split('.').slice(0, -1).join('.');
    setFilename(baseFileName);
    setSelectedFile(file);

    try {
      const parsed = await parseTabularFile(file, {
        checkMergedCells: true,
        stripWrappingQuotes: true,
        normalizeEmptyToNull: true,
        dropDuplicateHeaders: true,
      });
      if (Array.isArray(parsed.warnings) && parsed.warnings.length > 0) {
        alert(`Warning: ${parsed.warnings.join(' ')}`);
      }

      setColumns(parsed.headers);
      setPreviewRows(parsed.records);
      setJsondata(parsed.records);
      setReviewRows([]);
    } catch (err) {
      const msg = err?.message || 'Please upload a valid CSV/TSV/Excel (.csv/.tsv/.xlsx) file.';
      if (msg.toLowerCase().includes('please upload a valid file')) {
        alert(msg);
      } else {
        setError(msg);
      }
      event.target.value = null;
      setSelectedFile(null);
    }
  };

  useEffect(() => {
    setTcategories(getMatchTypePercentages(reviewRows, zeroDropdownValue));
  }, [reviewRows, zeroDropdownValue]);

  const LoadingBar = ({ stage, percent, elapsedSeconds }) => (
    <Box
      sx={{
        width: 'min(560px, 80vw)',
        mt: 2,
        p: 2,
        borderRadius: 1,
        bgcolor: 'rgba(255, 255, 255, 0.92)',
        color: 'black',
      }}
    >
      <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
        {stage || 'Working...'}
      </Typography>
      <LinearProgress variant="determinate" value={Math.max(0, Math.min(100, Number(percent || 0)))} />
      <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
        {Math.max(0, Math.min(100, Number(percent || 0))).toFixed(0)}% complete
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', mt: 0.25 }}>
        Elapsed: {Number(elapsedSeconds || 0).toFixed(1)}s
      </Typography>
    </Box>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {

        const response = await fetch(`${process.env.REACT_APP_API_URL}/getTranslatedomains?database=` + database, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const updatedData = Array.isArray(data)
          ? data.map((item) => {
            if (item && typeof item === "object" && "group" in item) {
              if (item.group === "DISTRICT") {
                return {
                  ...item,
                  group: "AREA",
                  nodes: item.nodes.map((n) => (n === "DISTRICT" ? "AREA" : n)),
                };
              }
              return item;
            }
            return item;
          })
          : [];
        setDropdownData(updatedData);

        if (updatedData.length > 0) setFirstDropdownValue(updatedData[0].group);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [database]);

  const secondDropdownOptions = useMemo(() => {
    if (!firstDropdownValue) {
      return [];
    }

    const options = dropdownData.find(
      (item) => item.group === firstDropdownValue
    )?.nodes || [];

    return [
      ...options.filter((opt) => opt === firstDropdownValue),
      ...options.filter((opt) => opt !== firstDropdownValue),
    ];
  }, [dropdownData, firstDropdownValue]);

  useEffect(() => {
    if (secondDropdownOptions.length > 0) {
      setsubDomain(secondDropdownOptions[0]);
    } else {
      setsubDomain("");
    }
  }, [firstDropdownValue, secondDropdownOptions]);


  useEffect(() => {
    setsvalues(domainOptions[firstDropdownValue] || fallbackOptions);
  }, [firstDropdownValue]);

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

  const previewGridRows = useMemo(
    () => (previewRows || []).map((row, index) => ({ ...row, __previewId: `preview-${index + 1}` })),
    [previewRows]
  );

  const previewGridColumns = useMemo(
    () =>
      (columns || []).map((col) => ({
        field: col,
        headerName: col,
        width: Math.max(140, Math.min(420, String(col).length * 10 + 48)),
        minWidth: 120,
        resizable: true,
      })),
    [columns]
  );

  const tooltipContent = (
    <div style={{ maxWidth: '400px' }}>
      <h3>From which category domain do you want to find matches?</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th id="tooltip-table">Label</th>
            <th id="tooltip-table">Description</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={index}>
              <td id="tooltip-table">{category.label === "DISTRICT" ? "AREA" : category.label}</td>
              <td id="tooltip-table">{category.description}</td>
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
            <th id="tooltip-table">Label</th>
            <th id="tooltip-table">Description</th>
          </tr>
        </thead>
        <tbody>
          {infodata && selectedCategory?.[(firstDropdownValue === "AREA" ? "DISTRICT" : firstDropdownValue)]?.length > 0 ? (
            infodata
              .filter(desc => selectedCategory[firstDropdownValue === "AREA" ? "DISTRICT" : firstDropdownValue].includes(desc.label))
              .map((category, index) => (
                <tr key={index}>
                  <td id="tooltip-table">{category.label}</td>
                  <td id="tooltip-table">{category.description}</td>
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

  const isDownloadDisabled = loading || reviewRows.length === 0 || columns.length === 0;

  return (
    <Box sx={{ backgroundColor: 'black', opacity: 1, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, flexGrow: 1 }}>
        <div
          style={{
            width: isSidebarCollapsed ? "56px" : "26%",
            backgroundColor: '#e0e0e0',
            padding: isSidebarCollapsed ? '10px 6px' : '20px',
            border: '1px solid #ccc',
            borderRadius: '10px',
            overflow: "auto",
            transition: 'width 0.2s ease, padding 0.2s ease',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: isSidebarCollapsed ? 'center' : 'flex-end' }}>
            <Tooltip title={isSidebarCollapsed ? 'Expand panel' : 'Collapse panel'} arrow>
              <IconButton
                size="small"
                onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                aria-label={isSidebarCollapsed ? 'Expand translate sidebar' : 'Collapse translate sidebar'}
              >
                {isSidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Tooltip>
          </Box>
          {!isSidebarCollapsed && (
            <>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <p class="dropdown-labels">Choose spreadsheet to match</p>
            <Tooltip title={getTooltipContent('UPLOAD_INSTRUCTION')} arrow>
              <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
            </Tooltip>
          </Box>
          <input id="fileInput" style={{ color: 'black', fontWeight: "bold", marginLeft: 7, padding: "2px" }} type="file" accept=".csv,.tsv,.xlsx" onChange={handleFileChange} />
          <br />
          {selectedFile !== null && (
            <div>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <p class="dropdown-labels">Choose spreadsheet column to match</p>
                <Tooltip title={getTooltipContent("INPUT_COLUMN")} arrow>
                  <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
                </Tooltip>
              </Box>
              <Select
                label="Zero Dropdown"
                style={{ height: 40 }}
                value={zeroDropdownValue}
                sx={{ m: 1, width: "12vw" }}
                onChange={(event) => setZeroDropdownValue(event.target.value)}>
                {columns.map((key) => (
                  <MenuItem key={key} value={key}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </div>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <p class="dropdown-labels">Select category domain</p>
            <Tooltip title={tooltipContent} arrow>
              <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
            </Tooltip>
          </Box>
          <Select
            label="First Dropdown"
            value={firstDropdownValue}
            style={{ height: 40 }}
            sx={{ m: 1, width: "12vw" }}
            onChange={(event) => setFirstDropdownValue(event.target.value)}>
            {dropdownData.map((key, index) => (
              <MenuItem key={index} value={key.group}>
                {key.group}
              </MenuItem>
            ))}
          </Select>
          {secondDropdownOptions.length > 1 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <p class="dropdown-labels">Select category sub-domain</p>
                <Tooltip title={tooltipContent2} arrow>
                  <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
                </Tooltip>
              </Box>
              <Select
                label="Sub Dropdown"
                value={subDomain}
                style={{ height: 40 }}
                sx={{ m: 1, width: "12vw" }}
                onChange={(event) => setsubDomain(event.target.value)}>
                {secondDropdownOptions.map((key, index) => (
                  <MenuItem key={index} value={key}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <p class="dropdown-labels">CatMapper Property to Search</p>
            <Tooltip title={getTooltipContent("MATCH_PROPERTY")} arrow>
              <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
            </Tooltip>
          </Box>
          <Select
            label="Second Dropdown"
            value={secondDropdownValue}
            style={{ height: 40 }}
            sx={{ m: 1, width: "12vw" }}
            onChange={(event) => {
              setsecondDropdownValue(event.target.value);
            }}>
            {svalues.map((key) => (
              <MenuItem key={key} value={key}>
                {key}
              </MenuItem>
            ))}
          </Select>

          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <label style={{ fontWeight: "bold", marginLeft: 7 }}>
              <input
                type="checkbox"
                checked={showAdvanced}
                onChange={() => setShowAdvanced(!showAdvanced)}
              />{" "}
              Advanced Options
            </label>
            <Tooltip title="Enable additional data filters and settings" arrow>
              <Button startIcon={<InfoIcon sx={{ height: 28, width: 28 }} />} />
            </Tooltip>
          </Box>


          {showAdvanced && (
            <Box sx={{ ml: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <label>
                  <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
                  Limit by Country?
                </label>
                <Tooltip title={getTooltipContent("FILTER_BY_COUNTRY")} arrow>
                  <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
                </Tooltip>
              </Box>
              {selectedFile !== null && isChecked && (
                <div>
                  <p class="dropdown-labels">Select column with Country IDs</p>
                  <Select
                    label="Third Dropdown"
                    style={{ height: 40 }}
                    value={thirdDropdownValue}
                    sx={{ m: 1, width: "12vw" }}
                    onChange={(event) => setthirdDropdownValue(event.target.value)}>
                    {columns.map((key) => (
                      <MenuItem key={key} value={key}>
                        {key}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <label>
                  <input type="checkbox" checked={isCheckedtwo} onChange={handleCheckboxChangetwo} />
                  Limit by Context?
                </label>
                <Tooltip title={getTooltipContent("FILTER_BY_CONTEXT")} arrow>
                  <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
                </Tooltip>
              </Box>
              {selectedFile !== null && isCheckedtwo && (
                <div>
                  <p class="dropdown-labels">Select Column with context IDs</p>
                  <Select
                    label="Fourth Dropdown"
                    style={{ height: 40 }}
                    value={fourthDropdownValue}
                    sx={{ m: 1, width: "12vw" }}
                    onChange={(event) => setfourthDropdownValue(event.target.value)}>
                    {columns.map((key) => (
                      <MenuItem key={key} value={key}>
                        {key}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <label>
                  <input type="checkbox" checked={isCheckedthree} onChange={handleCheckboxChangethree} />
                  Limit by Dataset?
                </label>
                <Tooltip title={getTooltipContent("FILTER_BY_DATASET")} arrow>
                  <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
                </Tooltip>
              </Box>
              {selectedFile !== null && isCheckedthree && (
                <div>
                  <p class="dropdown-labels">Select column with Dataset IDs</p>
                  <Select
                    label="Fifth Dropdown"
                    style={{ height: 40 }}
                    value={fifthDropdownValue}
                    sx={{ m: 1, width: "12vw" }}
                    onChange={(event) => setfifthDropdownValue(event.target.value)}>
                    {columns.map((key) => (
                      <MenuItem key={key} value={key}>
                        {key}
                      </MenuItem>
                    ))}
                  </Select>
                  <br />
                  <label>
                    <input type="checkbox" checked={isCheckedfour} onChange={handleCheckboxChangefour} />
                    Return Dataset Keys?
                  </label>
                  <br />
                </div>
              )}
              <br />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <p class="dropdown-labels">Time range (years)</p>
                <Tooltip title={getTooltipContent("TIME_RANGE")} arrow>
                  <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
                </Tooltip>
              </Box>
              <p class="dropdown-labels">from &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; to</p>
              <input
                type="text"
                id="myTextbox"
                style={{ height: 30, width: 70 }}
                value={inputValue}
                onChange={(event) => setinputValue(event.target.value)}
              />
              <input
                type="text"
                id="myTextbox"
                style={{ height: 30, width: 70, marginLeft: 7 }}
                value={inputValuetwo}
                onChange={(event) => setinputValuetwo(event.target.value)}
              />
              <br />
              <br />
              {/* Add row separator */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ marginRight: 2, color: 'black', fontWeight: 500 }}>
                  Split rows by separator
                </Typography>
                <input
                  type="text"
                  id="rowSeparator"
                  style={{ height: 30, width: 15, marginLeft: 7, marginRight: 7 }}
                  value={inputValueSep}
                  onChange={(event) => setinputValueSep(event.target.value)}
                />
                <Button variant="contained" sx={{
                  backgroundColor: 'black',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'green',
                  },
                }} onClick={handleClickSeparator}>
                  Apply
                </Button>
                <Tooltip title={getTooltipContent("SPLIT_CATEGORIES")} arrow>
                  <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
                </Tooltip>
              </Box>
              <br />
              {/* Add unique rows */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ marginRight: 2, color: 'black', fontWeight: 500 }}>
                  Combine identical categories
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isUniqueRows}
                      onChange={handleUniqueRows}
                      name="checkboxButton"
                      color="default"
                      sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                    />
                  }
                  label=""
                />
                <Tooltip title={getTooltipContent("COMBINE_IDENTICAL")} arrow>
                  <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
                </Tooltip>
              </Box>
              <br />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ marginRight: 2, color: 'black', fontWeight: 500 }}>
                  Assign many-to-one to identical spellings
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isCountSameName}
                      onChange={handleCountSameName}
                      name="checkboxButton"
                      color="default"
                      sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                    />
                  }
                  label=""
                />
                <Tooltip title={getTooltipContent("TBD_OPTION")} arrow>
                  <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
                </Tooltip>
              </Box>
            </Box>
          )}
          <Button variant="contained" sx={{
            backgroundColor: 'black',
            color: 'white',
            '&:hover': {
              backgroundColor: 'green',
            },
          }} onClick={handleClick} disabled={loading}>
            Search
          </Button>
          <br />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TranslateTable categories={tcategories} />
            <Tooltip title={getTooltipContent("MATCH_STATISTICS")} arrow>
              <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
            </Tooltip>
          </Box>
          <br />
          <Backdrop style={{ color: '#fff', zIndex: 1300 }} open={loading}>
            <div>
              <Typography variant="h6" align="center" style={{ marginTop: '10px' }}>
                Translating
              </Typography>
              <LoadingBar stage={loadingStage} percent={loadingPercent} elapsedSeconds={loadingElapsedSeconds} />
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancelTranslate}
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': { borderColor: '#ddd', backgroundColor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </div>
          </Backdrop>
          <Button variant="contained" sx={{
            backgroundColor: 'black',
            color: 'white',
            '&:hover': {
              backgroundColor: 'green',
            },
          }} onClick={handleClicktwo} disabled={isDownloadDisabled}>
            Download proposed matches
          </Button>
          <Dialog open={Boolean(error)} onClose={() => setError(null)}>
            <DialogTitle>Error</DialogTitle>
            <DialogContent>{error}</DialogContent>
            <DialogActions>
              <Button onClick={() => setError(null)} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
            </>
          )}
        </div>
        <div style={{ width: isSidebarCollapsed ? "94%" : "72%", backgroundColor: "white", padding: '20px', border: '1px solid #ccc', borderRadius: '10px', overflow: 'auto', transition: 'width 0.2s ease' }}>
          {columns.length > 0 && reviewRows.length > 0 && (
            <TranslateMatchReview
              rows={reviewRows}
              columns={columns}
              termColumn={zeroDropdownValue}
              database={database}
              user={user}
              cred={cred}
              onRowsChange={setReviewRows}
            />
          )}
          {columns.length > 0 && reviewRows.length === 0 && previewRows.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Uploaded Data Preview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Preview the uploaded spreadsheet before running Search.
              </Typography>
              <div style={{ height: 560, width: '100%' }}>
                <DataGrid
                  rows={previewGridRows}
                  columns={previewGridColumns}
                  getRowId={(row) => row.__previewId}
                  disableColumnResize={false}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                  disableRowSelectionOnClick
                />
              </div>
            </Box>
          )}
        </div>
      </Box>
      <div style={{ width: "100%", backgroundColor: "black", padding: '20px' }}>
        <FooterLinks />
      </div>
    </Box>

  );
};

export default TranslateComponent;
