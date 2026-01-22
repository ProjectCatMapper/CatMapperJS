import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  NativeSelect,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  Tooltip as MuiTool,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Backdrop,
  CircularProgress
} from "@mui/material";
import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import InfoIcon from "@mui/icons-material/Info";
import PropTypes from "prop-types";
import * as XLSX from "xlsx";

import CategoriesTable from "./TableCategories";
import ClickTable from "./TableClickView";
import LoadingSpinner from "./LoadingSpinner";
import Neo4jVisualization from "./VisNet";
import TimespanTable from "./TimeSpanTable";
import MapComponent from './MapComponent';

import image from "../assets/catmapperWhite.png";
import { useMetadata } from './UseMetadata';

import "./TableClick.css";
import "./LoadingSpinner.css";

// --- Constants ---
const orderOfProperties = [
  "CONTAINS", "DISTRICT_OF", "LANGUOID_OF", "RELIGION_OF",
  "PERIOD_OF", "CULTURE_OF", "POLITY_OF", "USES", "EQUIVALENT"
];

const hierarchy = [
  "PROJECTILE_POINT_TYPE", "PROJECTILE_POINT_CLUSTER", "PROJECTILE_POINT",
  "CERAMIC_TYPE", "CERAMIC_WARE", "CERAMIC", "PHYTOLITH", "BOTANICAL",
  "FAUNA", "SUBSPECIES", "SPECIES", "SUBGENUS", "GENUS", "FAMILY",
  "ORDER", "CLASS", "PHYLUM", "KINGDOM", "BIOTA", "FEATURE", "SITE",
  "ADM0", "ADM1", "ADM2", "ADM3", "ADM4", "ADMD", "ADME", "ADML",
  "ADMX", "REGION", "DISTRICT", "PERIOD", "DIALECT", "LANGUAGE",
  "LANGUOID", "ETHNICITY", "RELIGION", "OCCUPATION", "POLITY",
  "CULTURE", "STONE", "DATASET", "GENERIC", "VARIABLE"
];

const colorMap = {
  "PROJECTILE_POINT_TYPE": "#e6194b", "PROJECTILE_POINT_CLUSTER": "#3cb44b",
  "PROJECTILE_POINT": "#ffe119", "CERAMIC_TYPE": "#0082c8", "CERAMIC_WARE": "#f58231",
  "CERAMIC": "#911eb4", "PHYTOLITH": "#46f0f0", "BOTANICAL": "#f032e6",
  "FAUNA": "#d2f53c", "SUBSPECIES": "#fabebe", "SPECIES": "#008080",
  "SUBGENUS": "#e6beff", "GENUS": "#aa6e28", "FAMILY": "#fffac8",
  "ORDER": "#800000", "CLASS": "#aaffc3", "PHYLUM": "#808000",
  "KINGDOM": "#ffd8b1", "BIOTA": "#000080", "FEATURE": "#808080",
  "SITE": "#7b4173", "ADM0": "#d62728", "ADM1": "#2ca02c", "ADM2": "#ff7f0e",
  "ADM3": "#1f77b4", "ADM4": "#a9a9a9", "ADMD": "#9467bd", "ADME": "#8c564b",
  "ADML": "#e377c2", "ADMX": "#7f7f7f", "REGION": "#bcbd22", "DISTRICT": "#17becf",
  "PERIOD": "#393b79", "DIALECT": "#637939", "LANGUAGE": "#8c6d31",
  "LANGUOID": "#843c39", "ETHNICITY": "#7b4173", "RELIGION": "#3182bd",
  "OCCUPATION": "#fdd0a2", "POLITY": "#a1d99b", "CULTURE": "#9e9ac8",
  "STONE": "#f768a1", "DATASET": "#41ab5d", "GENERIC": "#6baed6", "VARIABLE": "#d6616b"
};

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  'label + &': { marginTop: theme.spacing(3) },
  '& .MuiInputBase-input': {
    borderRadius: 4, position: 'relative', backgroundColor: "white", border: '1px solid #ced4da',
    fontSize: 16, padding: '10px 26px 10px 12px', transition: theme.transitions.create(['border-color', 'box-shadow']),
    fontFamily: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'].join(','),
    '&:focus': { borderRadius: 4, borderColor: '#80bdff', boxShadow: '0 0 0 0.2rem rgba(255,255,255,.25)' },
  },
}));

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} {...other}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return { id: `simple-tab-${index}`, "aria-controls": `simple-tabpanel-${index}` };
}

export default function Tableclick(props) {
  const location = useLocation();
  const database = location.pathname.includes("archamap") ? "ArchaMap" : "SocioMap";
  const limit = 300;

  // --- State Hooks ---
  const [value, setValue] = useState(Number(props.cmid.tabval) || 0);
  const [usert, setUsert] = useState([]);
  const [mapt, setMapt] = useState([]);
  const [rev, setrev] = useState([]);
  const [categories, setCategories] = useState([]);
  const [childcategories, setChildCategories] = useState([]);
  const [points, setPoints] = useState([]);
  const [datasetpoints, setDatasetPoints] = useState([]);
  const [fdrop, setfdrop] = useState(["CONTAINS"]);
  const [orderedProperties, setOrderedProperties] = useState([]);
  const [firstDropdownValue, setFirstDropdownValue] = useState("");
  const [thirdDropdownValue, setThirdDropdownValue] = useState("All");
  const [fourthDropdownValue, setFourthDropdownValue] = useState("All");
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState(["All"]);
  const [originaldata, setoriginaldata] = useState(null);
  const [visData, setVisData] = useState(null);
  const [domains, setdomains] = useState([]);
  const [sources, setsources] = useState([]);
  const [rememberChoice, setRememberChoice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [badsources, setbadsources] = useState([]);
  const [domainDrop, setdomainDrop] = useState('ALL NODES');
  const [advdomainDrop, setadvdomainDrop] = useState('ALL NODES');
  const [advoptions, setadvoptions] = useState(['ALL NODES']);
  const [selectedCategory, setSelectedCategory] = useState({});
  const [open, setOpen] = useState(false);
  const normalizedRef = useRef({});

  const { infodata } = useMetadata(database);

  // --- Handlers ---
  const handleClose = () => setOpen(false);

  const generateTooltipContent = useCallback((properties) => {
    return Object.entries(properties).map(([key, val]) => `${key}: ${val}\n`);
  }, []);

  const getColorBasedOnValue = useCallback((labels) => {
    const inputSet = new Set(labels.flat().filter((v) => v !== "CATEGORY" && v !== "DISTRICT"));
    const match = hierarchy.find((type) => inputSet.has(type));
    return colorMap[match] || "#cccccc";
  }, []);

  const fetchData = useCallback(async (event) => {
    const relation = event?.target?.value || "CONTAINS";
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/networksjs?cmid=${props.cmid.cmid}&database=${database}&relation=${relation}&response=records&limit=${limit}`);
      const result = await response.json();

      const nodeRaw = [...Object.entries(result.node), ...Object.entries(result.relNodes)].map(([_, n]) => ({
        id: n.id, label: n.CMName, domain: n.labels, CMID: n.CMID,
        tooltipcon: generateTooltipContent(n), color: getColorBasedOnValue(n.labels)
      }));

      const nodes = Array.from(new Set(nodeRaw.map(JSON.stringify))).map(JSON.parse);
      const edges = Object.entries(result.relations).map(([_, r]) => ({
        from: r.start_node_id, to: r.end_node_id, color: "black", ...r
      }));

      setoriginaldata({ nodes, edges });
      setVisData({ nodes, edges });

      // Update Domain list
      let doms = nodes.map(n => n.domain).slice(1);
      doms = Array.from(new Set(doms.flat())).filter(v => v !== "CATEGORY");
      setdomains(doms);
      setSelectedValues(doms);

      // Update Nodes list
      let nodeLabels = nodes.map(n => n.label).slice(1).sort();
      nodeLabels.unshift("All");
      setSelectedNodes(nodeLabels);

      setFirstDropdownValue(relation);
    } catch (err) { console.error(err); }
  }, [database, props.cmid.cmid, generateTooltipContent, getColorBasedOnValue]);

  // Handle manual Node filter
  const updateNodeData = (event) => {
    const val = event.target.value;
    if (val === "All") {
      setVisData(originaldata);
    } else {
      const filteredNodes = originaldata.nodes.filter((n, i) => i === 0 || n.label === val);
      setVisData({ nodes: filteredNodes, edges: originaldata.edges });
    }
    setThirdDropdownValue(val);
  };

  // Handle manual Domain filter
  const updateData = (event) => {
    const selected = event.target.value;
    const filteredNodes = originaldata.nodes.filter((n, i) => i === 0 || n.domain.some(tag => selected.includes(tag)));
    setVisData({ nodes: filteredNodes, edges: originaldata.edges });
    setSelectedValues(selected);
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/category?cmid=${props.cmid.cmid}&database=${database}`)
      .then(res => res.json())
      .then(data => {
        setUsert(data.samples); setCategories(data.categories); setrev(data.info);
        setPoints(data.points); setDatasetPoints(data.datasetpoints); setfdrop(data.relnames);
        setbadsources(data.badsources); setOpen(Boolean(data.badsources?.length));
        const pts = data.datasetpoints?.length > 0 ? data.datasetpoints : data.points;
        setMapt(data.polygons);
        setsources([...new Set(pts.map(p => p.source))]);
      }).finally(() => setLoading(false));
  }, [database, props.cmid.cmid]);

  useEffect(() => {
    const ordered = orderOfProperties.filter(p => fdrop.includes(p));
    setOrderedProperties(ordered);
    if (ordered.length > 0) fetchData({ target: { value: ordered[0] } });
  }, [fdrop, fetchData]);

  // Subdomain Tooltip Table
  const tooltipContent2 = (
    <Box sx={{ maxWidth: '400px' }}>
      <Typography variant="h6">Sub-domain Descriptions</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {infodata && selectedCategory[domainDrop]?.length > 0 ? (
              infodata.filter(desc => selectedCategory[domainDrop].includes(desc.label))
                .map((cat, i) => (
                  <TableRow key={i}>
                    <TableCell>{cat.label}</TableCell>
                    <TableCell>{cat.description}</TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow><TableCell colSpan={2}>No data available</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: "white", width: "100%", color: "black" }}>
      {/* Top Banner / Info Header */}
      <Box sx={{ p: 2, backgroundImage: `linear-gradient(to bottom right,#555555, #cccccc)` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Category Info: {rev.CMName || 'Loading...'}</Typography>
          <MuiTool title="Toggle between sample info, maps, and network ties." arrow>
            <InfoIcon sx={{ color: "blue", cursor: "pointer", ml: 1 }} />
          </MuiTool>
        </Box>

        {/* Info List */}
        <Box component="ul" sx={{ fontSize: '1rem' }}>
          {rev && Object.entries(rev).map(([k, v]) => v ? (
            <li key={k}><strong>{k}:</strong> {v}</li>
          ) : null)}
        </Box>

        {/* Dataset Controls */}
        {(props.cmid.cmid.startsWith("SD") || props.cmid.cmid.startsWith("AD")) && (
          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <FormControl variant="standard" sx={{ minWidth: 200 }}>
              <Typography variant="caption">Domain Filter</Typography>
              <NativeSelect
                input={<BootstrapInput />}
                value={domainDrop}
                onChange={(e) => setdomainDrop(e.target.value)}
              >
                <option value="ALL NODES">ALL NODES</option>
              </NativeSelect>
            </FormControl>

            <FormControlLabel
              control={<Checkbox checked={rememberChoice} onChange={() => setRememberChoice(!rememberChoice)} />}
              label="Include children?"
            />

            <Button variant="contained" sx={{ bgcolor: 'black', color: 'white' }}>Download Data</Button>
          </Box>
        )}
      </Box>

      {/* Main Content Tabs */}
      <Tabs value={value} onChange={(e, v) => setValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Network Explorer" {...a11yProps(0)} />
        <Tab label="Map View" {...a11yProps(1)} />
        <Tab label="Datasets" {...a11yProps(3)} />
        <Tab label="Categories" {...a11yProps(4)} />
      </Tabs>

      <CustomTabPanel value={value} index={0}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Relationship</InputLabel>
            <Select value={firstDropdownValue} onChange={fetchData} label="Relationship">
              {orderedProperties.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Domain Filter</InputLabel>
            <Select multiple value={selectedValues} onChange={updateData} label="Domain Filter">
              {domains.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Node Filter</InputLabel>
            <Select value={thirdDropdownValue} onChange={updateNodeData} label="Node Filter">
              {selectedNodes.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ height: 500, border: '1px solid #ddd', borderRadius: 2 }}>
          {visData && <Neo4jVisualization visData={visData} />}
        </Box>
      </CustomTabPanel>

      <CustomTabPanel value={value} index={1}>
        <Box sx={{ height: '70vh' }}>
          <MapComponent points={points.length > 0 ? points : datasetpoints} mapt={mapt} sources={sources} />
        </Box>
      </CustomTabPanel>

      <CustomTabPanel value={value} index={3}>
        <ClickTable usert={usert} />
      </CustomTabPanel>

      <CustomTabPanel value={value} index={4}>
        <CategoriesTable categories={categories} childcategories={childcategories} />
      </CustomTabPanel>

      {/* Dialog for bad sources */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Data Source Warnings</DialogTitle>
        <DialogContent>
          {badsources.map((s, i) => (
            <Typography key={i} color="error" variant="body2">• {s.source}: {s.error}</Typography>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Loading Backdrop */}
      <Backdrop open={loading} sx={{ zIndex: 9999, color: '#fff', flexDirection: 'column' }}>
        <LoadingSpinner />
        <Typography sx={{ mt: 2 }}>Loading Archaeological Data...</Typography>
      </Backdrop>

      {/* Footer */}
      <Box sx={{ p: 4, bgcolor: "black", color: "white", textAlign: 'center' }}>
        <Divider sx={{ mb: 3, bgcolor: 'grey.800' }} />
        <img src={image} alt="Logo" style={{ height: 60 }} />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 3 }}>
          <Link to="/people" style={{ color: 'white', textDecoration: 'none' }}>People</Link>
          <Link to="/news" style={{ color: 'white', textDecoration: 'none' }}>News</Link>
          <Link to="/terms" style={{ color: 'white', textDecoration: 'none' }}>Terms</Link>
        </Box>
      </Box>
    </Box>
  );
}