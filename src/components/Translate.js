import { useEffect, useState } from 'react';
import domainOptions from "../assets/dropdown.json";
import { Select, MenuItem } from '@mui/material';
import Papa from 'papaparse';
import Button from '@mui/material/Button';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Typography, Box } from '@mui/material';
import { useLocation, Link, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import TranslateTable from './TranslateResults';
import Backdrop from '@mui/material/Backdrop';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import './Translate.css';
import Divider from '@mui/material/Divider';
import image from '../assets/catmapperWhite.png';
import { useMetadata } from './UseMetadata';

const fallbackOptions = ["Name", "Key", "CatMapper ID (CMID)"];

function TranslateComponent() {
  const { appType } = useParams();
  const location = useLocation();

  const database = appType === 'archamap' || location.pathname.includes("archamap") ? "ArchaMap" : "SocioMap";

  // --- State Hooks ---
  const [zeroDropdownValue, setZeroDropdownValue] = useState("");
  const [firstDropdownValue, setFirstDropdownValue] = useState("ANY DOMAIN");
  const [dropdownData, setDropdownData] = useState([]);
  const [subDomain] = useState("");
  const [secondDropdownValue] = useState("Name");
  const [thirdDropdownValue] = useState("");
  const [fourthDropdownValue] = useState("");
  const [fifthDropdownValue] = useState("");
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [tcategories, setTcategories] = useState([]);
  const [isCheckedfour] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filename, setFilename] = useState("");
  const [jsonData, setJsondata] = useState(null);
  const [data, setData] = useState({});
  const [inputValue] = useState(-4000);
  const [inputValuetwo] = useState(2026);
  const [isUniqueRows] = useState(false);
  const [isCountSameName] = useState(false);

  // RESTORED STATES
  const [svalues, setsvalues] = useState(fallbackOptions);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const { infodata, loading: metadataLoading } = useMetadata(database);

  // --- Effects ---

  // Fetch Domain Data for Dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/getTranslatedomains?database=${database}`);
        const data = await response.json();
        const updatedData = Array.isArray(data) ? data.map(item => {
          if (item?.group === "DISTRICT") {
            return { ...item, group: "AREA", nodes: item.nodes.map(n => n === "DISTRICT" ? "AREA" : n) };
          }
          return item;
        }) : [];
        setDropdownData(updatedData);
        if (updatedData.length > 0) setFirstDropdownValue(updatedData[0].group);
      } catch (err) {
        console.error("Error fetching dropdown domains:", err);
      }
    };
    fetchDropdownData();
  }, [database]);

  // Sync Property Dropdown Options
  useEffect(() => {
    setsvalues(domainOptions[firstDropdownValue] || fallbackOptions);
  }, [firstDropdownValue]);

  // Load Tooltip and Subdomain Data
  useEffect(() => {
    const dbKey = database.toLowerCase();

    fetch(`${process.env.REACT_APP_API_URL}/metadata/domainDescriptions/${dbKey}`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));

    fetch(`${process.env.REACT_APP_API_URL}/metadata/subdomains/${dbKey}`)
      .then(res => res.json())
      .then(data => {
        const normalized = {};
        if (Array.isArray(data)) {
          data.forEach(({ domain, subdomains }) => { normalized[domain] = subdomains; });
        }
        setSelectedCategory(normalized);
      })
      .catch(err => console.error(err));
  }, [database]);

  // --- Handlers ---

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const fileExtension = file.name.split('.').pop().toLowerCase();
    setFilename(file.name.split('.').slice(0, -1).join('.'));
    setSelectedFile(file);

    const processData = (rows) => {
      if (!rows.length) return;
      const header = rows[0].map(h => String(h || "").trim());
      setColumns(header);
      const body = rows.slice(1).filter(r => r.some(c => c !== null && c !== ""));
      setRows(body);
      setJsondata(body.map(r => Object.fromEntries(header.map((h, i) => [h, r[i]]))));
    };

    if (fileExtension === 'csv') {
      Papa.parse(file, { complete: (res) => processData(res.data) });
    } else {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
      processData(data);
    }
  };

  const handleClick = async () => {
    setLoading(true);
    setProgress(10);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          database,
          property: secondDropdownValue,
          domain: subDomain || firstDropdownValue,
          key: String(isCheckedfour),
          term: zeroDropdownValue,
          country: thirdDropdownValue,
          context: fourthDropdownValue,
          dataset: fifthDropdownValue,
          yearStart: inputValue,
          yearEnd: inputValuetwo,
          table: jsonData,
          countsamename: isCountSameName,
          uniqueRows: isUniqueRows
        }),
      });

      if (!response.ok) throw new Error("Translation failed");
      const resData = await response.json();

      const matchedCol = zeroDropdownValue;
      const prefixes = ['matching_', 'matchingDistance_', 'matchType_', 'CMName_', 'CMID_', 'label_', 'CMcountry_'];
      const suffixCols = prefixes.map(p => p + matchedCol).filter(c => resData.order.includes(c));
      const reordered = [matchedCol, ...suffixCols, 'CMuniqueRowID', ...resData.order.filter(k => ![matchedCol, 'CMuniqueRowID', ...suffixCols].includes(k))];

      setData(resData.file);
      setColumns(reordered);
      setRows(resData.file.map(row => reordered.map(k => row[k])));

      const counts = resData.file.reduce((acc, r) => {
        const type = r['matchType_' + matchedCol];
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      setTcategories(Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, (v / resData.file.length * 100).toFixed(2) + '%'])));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleClicktwo = () => {
    const ws = XLSX.utils.json_to_sheet(data, { header: columns });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Matches');
    XLSX.writeFile(wb, `${filename}_Matched_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getRowStyle = (row) => {
    const idx = columns.indexOf('matchType_' + zeroDropdownValue);
    const status = String(row[idx] || "").trim();
    switch (status) {
      case 'exact match': return 'exact-matches';
      case 'fuzzy match': return 'fuzzy-matches';
      case 'one-to-many': return 'one-to-many';
      case 'many-to-one': return 'many-to-one';
      case 'none': return 'none';
      default: return '';
    }
  };

  return (
    <Box sx={{ backgroundColor: 'black', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flexGrow: 1, p: 2, gap: 2 }}>
        {/* Sidebar */}
        <Paper sx={{ width: "28%", p: 3, borderRadius: 3, backgroundColor: '#f5f5f5', overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom>Match Spreadsheet</Typography>

          <input type="file" accept=".csv, .xlsx" onChange={handleFileChange} />

          {columns.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">Match Column:</Typography>
              <Select fullWidth size="small" value={zeroDropdownValue} onChange={(e) => setZeroDropdownValue(e.target.value)}>
                {columns.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">Category Domain:</Typography>
            <Select fullWidth size="small" value={firstDropdownValue} onChange={(e) => setFirstDropdownValue(e.target.value)}>
              {dropdownData.map((d, i) => <MenuItem key={i} value={d.group}>{d.group}</MenuItem>)}
            </Select>
          </Box>

          <Button variant="contained" fullWidth sx={{ mt: 3, bgcolor: 'black' }} onClick={handleClick} disabled={!zeroDropdownValue}>
            Search CatMapper
          </Button>

          <Box sx={{ mt: 2 }}>
            <TranslateTable categories={tcategories} />
          </Box>

          <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={handleClicktwo} disabled={!Object.keys(data).length}>
            Download Results
          </Button>
        </Paper>

        {/* Main Table Area */}
        <Paper sx={{ flexGrow: 1, p: 2, borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <TableContainer sx={{ flexGrow: 1 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {columns.map((col, i) => <TableCell key={i} sx={{ fontWeight: 'bold', bgcolor: '#eee' }}>{col}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, i) => (
                  <TableRow key={i} className={getRowStyle(row)}>
                    {row.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          />
        </Paper>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 3, bgcolor: 'black', color: 'white', textAlign: 'center' }}>
        <Divider sx={{ mb: 2, bgcolor: 'grey.800' }} />
        <img src={image} alt="Logo" style={{ height: 60 }} />
        <Box sx={{ mt: 1 }}>
          {['People', 'News', 'Funding', 'Citation', 'Terms', 'Contact'].map(link => (
            <Link key={link} to={`/${link.toLowerCase()}`} style={{ color: 'white', margin: '0 15px', textDecoration: 'none' }}>{link}</Link>
          ))}
        </Box>
      </Box>

      <Backdrop open={loading || metadataLoading} sx={{ zIndex: 9999, color: '#fff', flexDirection: 'column' }}>
        <CircularProgress color="inherit" />
        <Typography sx={{ mt: 2 }}>Processing Data...</Typography>
        {progress > 0 && <Box sx={{ width: '300px', mt: 2 }}><LinearProgress variant="determinate" value={progress} /></Box>}
      </Backdrop>
    </Box>
  );
}

export default TranslateComponent;