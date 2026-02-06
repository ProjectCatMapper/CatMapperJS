import React, { useState, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  NativeSelect,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  Tooltip as MuiTool,
  LinearProgress,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import InfoIcon from "@mui/icons-material/Info";

import PropTypes from "prop-types";
import * as XLSX from "xlsx";

import CategoriesTable from "./TableCategories";
import ClickTable from "./ExploreTabs";
import NetworkExplorerView from "./ExploreNetwork";
import LoadingSpinner from "./LoadingSpinner";

import TimespanTable from "./TimeSpanTable";
import MapComponent from './MapComponent';

import { useMetadata } from './UseMetadata';

import "./ExploreNode.css";



function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
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
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

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

export default function Tableclick({ cmid, database, tabval }) {
  const navigate = useNavigate();
  const [value, setValue] = useState(tabval || "network");
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
  const [selectedNodes, setSelectedNodes] = useState(["All"]);
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [dropdownNodeLimit, setDropdownNodeLimit] = useState(10);
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState(["All"]);
  const [originaldata, setoriginaldata] = useState(null);
  const [visData, setVisData] = useState(null);
  const [domains, setdomains] = useState([]);
  const [sources, setsources] = useState([]);
  const [loadingNetwork, setLoadingNetwork] = useState(false);
  const [loadingBackground, setLoadingBackground] = useState(false);
  const orderOfProperties = [
    "CONTAINS",
    "DISTRICT_OF",
    "LANGUOID_OF",
    "RELIGION_OF",
    "PERIOD_OF",
    "CULTURE_OF",
    "POLITY_OF",
    "USES",
    "EQUIVALENT"
  ];

  const [activeFilters, setActiveFilters] = useState({
    domain: [],      // From updateData (was string, now array for safety)
    nodeLabel: "All",// From updateNodeData
    dataset: "All",  // From updateDatasetNodeData
    eventType: ["All"] // From updateEventTypeData
  });

  //   const orderOfProperties = [
  //   "CONTAINS",
  //   "DISTRICT_OF",
  //   "*_OF",
  //   "USES",
  //   "EQUIVALENT"
  // ];

  const [rememberChoice, setRememberChoice] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const abortControllerRef = useRef(null);
  const [badsources, setbadsources] = useState([]);
  const [domainDrop, setdomainDrop] = React.useState('ALL NODES');
  const [advdomainDrop, setadvdomainDrop] = React.useState('ALL NODES');
  const [advoptions, setadvoptions] = React.useState(['ALL NODES']);
  const [selectedCategory, setSelectedCategory] = useState({});
  const normalizedRef = useRef({});

  const [open, setOpen] = useState(false);

  let limit = 300;

  const { infodata, loadingInfo: metadataLoading } = useMetadata(database);
  // dialog box for bad sources
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (advoptions.length > 0) {
      setadvdomainDrop([advoptions[0]]);
    }
  }, [advoptions]);

  const generateTooltipContent = (properties) => {
    return Object.entries(properties)
      .filter(([key, value]) => value != null && value !== "" && value !== "NULL" && value !== "null") // Skip null, undefined, or empty strings
      .map(([key, value]) => `${key}: ${value}\n`);
  };

  const getColorBasedOnValue = (value) => {
    const hierarchy = [
      "PROJECTILE_POINT_TYPE",
      "PROJECTILE_POINT_CLUSTER",
      "PROJECTILE_POINT",
      "CERAMIC_TYPE",
      "CERAMIC_WARE",
      "CERAMIC",
      "PHYTOLITH",
      "BOTANICAL",
      "FAUNA",
      "SUBSPECIES",
      "SPECIES",
      "SUBGENUS",
      "GENUS",
      "FAMILY",
      "ORDER",
      "CLASS",
      "PHYLUM",
      "KINGDOM",
      "BIOTA",
      "FEATURE",
      "SITE",
      "ADM0",
      "ADM1",
      "ADM2",
      "ADM3",
      "ADM4",
      "ADMD",
      "ADME",
      "ADML",
      "ADMX",
      "REGION",
      "DISTRICT",
      "PERIOD",
      "DIALECT",
      "LANGUAGE",
      "FAMILY",
      "LANGUOID",
      "ETHNICITY",
      "RELIGION",
      "OCCUPATION",
      "POLITY",
      "CULTURE",
      "STONE",
      "DATASET",
      "GENERIC",
      "VARIABLE"
    ];

    const colorMap = {
      "PROJECTILE_POINT_TYPE": "#e6194b", // strong red
      "PROJECTILE_POINT_CLUSTER": "#3cb44b", // medium green
      "PROJECTILE_POINT": "#ffe119", // bright yellow
      "CERAMIC_TYPE": "#0082c8", // vivid blue
      "CERAMIC_WARE": "#f58231", // orange
      "CERAMIC": "#911eb4", // purple
      "PHYTOLITH": "#46f0f0", // cyan
      "BOTANICAL": "#f032e6", // magenta
      "FAUNA": "#d2f53c", // lime
      "SUBSPECIES": "#fabebe", // pink
      "SPECIES": "#008080", // teal
      "SUBGENUS": "#e6beff", // lavender
      "GENUS": "#aa6e28", // brown
      "FAMILY": "#fffac8", // pale yellow
      "ORDER": "#800000", // maroon
      "CLASS": "#aaffc3", // mint green
      "PHYLUM": "#808000", // olive
      "KINGDOM": "#ffd8b1", // peach
      "BIOTA": "#000080", // navy
      "FEATURE": "#808080", // gray
      "SITE": "#7b4173", // plum
      "ADM0": "#d62728", // crimson
      "ADM1": "#2ca02c", // bright green
      "ADM2": "#ff7f0e", // bright orange
      "ADM3": "#1f77b4", // medium blue
      "ADM4": "#a9a9a9", // dark gray
      "ADMD": "#9467bd", // lavender purple
      "ADME": "#8c564b", // dark brown
      "ADML": "#e377c2", // light pink
      "ADMX": "#7f7f7f", // medium gray
      "REGION": "#bcbd22", // yellow-green
      "DISTRICT": "#17becf", // aqua
      "PERIOD": "#393b79", // indigo
      "DIALECT": "#637939", // moss green
      "LANGUAGE": "#8c6d31", // mustard
      "LANGUOID": "#843c39", // brick red
      "ETHNICITY": "#7b4173", // plum
      "RELIGION": "#3182bd", // steel blue
      "OCCUPATION": "#fdd0a2", // sand
      "POLITY": "#a1d99b", // pale green
      "CULTURE": "#9e9ac8", // lilac
      "STONE": "#f768a1", // hot pink
      "DATASET": "#41ab5d", // grass green
      "GENERIC": "#6baed6", // sky blue
      "VARIABLE": "#d6616b" // dusty rose
    };


    const inputSet = new Set(
      value.flat().filter((v) => v !== "CATEGORY" && v !== "DISTRICT")
    );

    const match = hierarchy.find((type) => inputSet.has(type));

    return colorMap[match] || "#cccccc";
  };

  useEffect(() => {
    if (!cmid || !database) {
      console.warn("Skipping fetch: cmid or database is missing", { cmid, database });
      return;
    }
    const baseUrl = process.env.REACT_APP_API_URL;
    const infoUrl = `${baseUrl}/info/${database}/${cmid}`;
    const categoryUrl = `${baseUrl}/category/${database}/${cmid}`;
    const geometryUrl = `${baseUrl}/exploreGeometry/${database}/${cmid}`;

    // Start spinner
    setLoadingInfo(true);

    fetch(infoUrl)
      .then((res) => res.json())
      .then((infoData) => {
        setrev(infoData);
        // We have the info, so we can show the page now!
        setLoadingInfo(false);
      })
      .catch((err) => {
        console.error("Error fetching info:", err);
        // Even if it fails, we must turn off the spinner so the user isn't stuck
        setLoadingInfo(false);
      });

    setLoadingBackground(true);
    Promise.all([
      fetch(categoryUrl).then((res) => res.json()),
      fetch(geometryUrl).then((res) => res.json())
    ])
      .then(([categoryData, geometryData]) => {
        // --- Process Category Data ---
        setUsert(categoryData.samples);
        setCategories(categoryData.categories);

        // Safety check for child categories
        const children = categoryData.childcategories || [];
        setChildCategories(children);

        setfdrop(categoryData.relnames);

        // --- Process Geometry Data ---
        setMapt(geometryData.polygons);
        setPoints(geometryData.points);
        setDatasetPoints(geometryData.datasetpoints);
        setbadsources(geometryData.badsources);
        setOpen(Boolean(geometryData.badsources?.length));

        // --- Process Sources (Dependent on Geometry) ---
        const maptFeatures = geometryData.polygons?.features?.length
          ? geometryData.polygons.features
          : geometryData.polygons || [];

        const pointsToUse =
          geometryData.datasetpoints && geometryData.datasetpoints.length > 0
            ? geometryData.datasetpoints
            : geometryData.points || [];

        const uniqueSources = [
          ...new Set([
            ...pointsToUse.map((point) => point.source),
            ...maptFeatures.map((f) => f.source),
          ]),
        ];

        setsources(uniqueSources);
      })
      .catch((err) => {
        console.error("Error fetching background data:", err);
      }).finally(() => {
        setLoadingBackground(false); // <--- Stop background tab loading
      });

  }, [cmid, database]);

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

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/metadata/subdomains/${database}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const normalized = {};

        data.forEach(({ domain, subdomains }) => {
          normalized[domain] = subdomains;
        });

        normalizedRef.current = normalized;

        setSelectedCategory(normalized);
      })
      .catch((err) => {
        console.error("Error loading subdomains:", err);

        if (err.message.includes("NetworkError when attempting to fetch resource.")) {
          alert("We’re very sorry, but the server is currently down.  Please check back in a few minutes (email admin@catmapper.org for assistance).")
        }
      });
  }, [database]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/datasetDomains`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cmid: cmid,
              database: database,
              children: rememberChoice,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();

        const allowedKeys = new Set(result.map(item => item.label));

        // console.log(allowedKeys)

        // console.log(normalizedRef)

        const matchingDomains = Object.fromEntries([
          ["ANY DOMAIN", ["ANY DOMAIN"]],
          ...Object.entries(normalizedRef.current)
            .map(([domain, values]) => {
              const found = values.filter(v => allowedKeys.has(v));
              return [domain, found];
            })
            .filter(([_, found]) => found.length > 0) // only keep domains with matches
        ]);

        // console.log(matchingDomains)

        setSelectedCategory(matchingDomains)

        setadvoptions(["ANY DOMAIN"]);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [rememberChoice]);

  const datasetButtonClick = async (event) => {
    if (loadingDownload) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort(); // Cancel the fetch
      }
      setLoadingDownload(false);
      console.log("Process cancelled by user.");
      return;
    }
    setLoadingDownload(true);
    console.log("Started dataset download process");

    // Create a new AbortController for this specific request
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    const adjustedDomain = advdomainDrop.includes("ANY DOMAIN")
      ? ["CATEGORY"]
      : advdomainDrop;
    try {
      let response;
      if (Array.isArray(advdomainDrop) && advdomainDrop.length > 1) {
        response = await fetch(
          `${process.env.REACT_APP_API_URL}/dataset?cmid=` +
          cmid +
          "&database=" +
          database +
          "&domain=" +
          adjustedDomain +
          "&children=" +
          rememberChoice,
          {
            method: "GET",
            signal: signal, // <--- Connects the abort controller
          }
        );
      } else {
        response = await fetch(
          `${process.env.REACT_APP_API_URL}/dataset?cmid=` +
          cmid +
          "&database=" +
          database +
          "&domain=" +
          adjustedDomain +
          "&children=" +
          rememberChoice,
          {
            signal: signal // <--- Connects the abort controller
          }
        );
      }

      const result = await response.json();

      if (!Array.isArray(result)) {
        console.error("CRITICAL ERROR: Data is still not an array. It is:", typeof result);
        console.log(result); // Inspect this in console to see what it really is
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(result);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      const workbookBinaryString = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "binary",
      });

      const buffer = new ArrayBuffer(workbookBinaryString.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < workbookBinaryString.length; i++) {
        view[i] = workbookBinaryString.charCodeAt(i) & 0xff;
      }
      const blob = new Blob([buffer], { type: "application/octet-stream" });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      a.download = rev.CMName + " " + formattedDate + ".xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("Fetch successfully aborted");
      } else {
        console.error("Error fetching data:", error);
      }
    } finally {
      setLoadingDownload(false);
      console.log("Finished dataset download process");
    }
  };

  const handleOpenLogs = async () => {

    const url = `/${database.toLowerCase()}/${cmid}/logs`;

    window.open(url, '_blank');
  };


  const fetchData = async (event) => {
    setLoadingNetwork(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/networksjs?cmid=` +
        cmid +
        "&database=" +
        database +
        "&relation=" +
        event.target.value +
        "&response=records" +
        "&limit=" + limit
      );
      const result = await response.json();

      const node = [
        ...Object.entries(result["node"]),
        ...Object.entries(result["relNodes"]),
      ].map((node) => ({
        id: node["1"].id,
        label: node["1"].CMName,
        domain: node["1"].labels,
        CMID: node["1"].CMID,
        tooltipcon: generateTooltipContent(node["1"]),
        color: getColorBasedOnValue(node["1"].labels),
      }));

      const nodes = Array.from(new Set(node.map(JSON.stringify))).map(
        JSON.parse
      );

      const edges = Object.entries(result["relations"]).map((relationship) => {
        const { start_node_id, end_node_id, eventType, ...rest } = relationship["1"];

        const edge =
        {
          from: start_node_id,
          to: end_node_id,
          ...rest,
          color: "black",
        };

        if (event.target.value === "CONTAINS") {
          if (eventType && Array.isArray(eventType)) {
            const filtered = eventType.filter(e => e !== "HIERARCHY");
            if (filtered.length > 0) {
              edge.label = filtered.join(", ");
              edge.eventType = eventType;
            }
          } else if (eventType) {
            edge.eventType = eventType;
          }
        }

        return edge;
      });

      let domains = nodes.map((object) => object.domain).slice(1);
      domains = Array.from(new Set(domains.flat())).filter(
        (value) => value !== "CATEGORY"
      );
      // domains = Array.from(new Set(domains.flat())).filter(
      //   (value) => value !== "DISTRICT"
      // );
      setSelectedValues(domains);
      setdomains(domains);

      let nodevalues = nodes
        .map((object) => object.label)
        .slice(1)
        .sort();
      nodevalues.unshift("All");
      setSelectedNodes([...nodevalues]);

      if (
        event.target.value !== "USES" &&
        !cmid.startsWith("SD") &&
        !cmid.startsWith("AD")
      ) {
        let datasetvalues = new Set();
        edges.forEach((object) => {
          let keys = object.referenceKey;

          if (typeof keys === "string") {
            keys = [keys];
          }

          if (Array.isArray(keys)) {
            keys.forEach((key) => {
              let datasetName;
              if (key.includes(" Key:")) {
                datasetName = key.split(" Key:")[0].trim();
              } else {
                datasetName = key.trim();
              }
              datasetvalues.add(datasetName);
            });
          }
        });

        datasetvalues = Array.from(datasetvalues).sort();
        datasetvalues.unshift("All");
        setSelectedDatasets(datasetvalues);
      }

      setFirstDropdownValue(event.target.value);
      setoriginaldata({ nodes, edges });
      setVisData({ nodes, edges });

      if (event.target.value === "CONTAINS") {
        let eventSet = new Set();

        edges.forEach((edge) => {
          if (Array.isArray(edge.eventType)) {
            edge.eventType.forEach((ev) => eventSet.add(ev));
          }
        });

        const evTypes = Array.from(eventSet).sort();
        evTypes.unshift("All");
        setEventTypes(evTypes);
        setSelectedEventTypes(["All"]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingNetwork(false); // <--- Stop loading regardless of success/fail
    }
  };

  const applyFilters = (filters) => {
    // Always start fresh from originaldata
    let currentEdges = originaldata.edges;
    let currentNodes = originaldata.nodes;

    // --- STEP 1: FILTER EDGES ---

    // A. Filter by Dataset (Reference Key)
    if (filters.dataset !== "All") {
      currentEdges = currentEdges.filter((edge) =>
        edge.referenceKey?.some((key) => key.includes(filters.dataset))
      );
    }

    // B. Filter by Event Type
    // Note: We check if "All" is NOT in the array
    if (!filters.eventType.includes("All")) {
      currentEdges = currentEdges.filter((edge) =>
        Array.isArray(edge.eventType) &&
        edge.eventType.some((ev) => filters.eventType.includes(ev))
      );
    }

    // --- STEP 2: CALCULATE VALID NODES FROM EDGES ---
    // If we filtered edges, we must ensure we only show nodes attached to them.
    // If we didn't filter edges, we consider all nodes valid candidates so far.
    let validNodeIds = new Set(currentNodes.map(n => n.id)); // Default: all nodes

    if (filters.dataset !== "All" || !filters.eventType.includes("All")) {
      validNodeIds = new Set(currentEdges.flatMap((edge) => [edge.from, edge.to]));
    }

    // --- STEP 3: FILTER NODES ---

    currentNodes = currentNodes.filter((node, index) => {
      // Rule 1: Always keep the root node (index 0)
      if (index === 0) return true;

      // Rule 2: Must be part of the valid edge structure (from Step 2)
      if (!validNodeIds.has(node.id)) return false;

      // Rule 3: Filter by Node Label (Specific Name)
      if (filters.nodeLabel !== "All") {
        if (node.label !== filters.nodeLabel) return false;
      }

      // Rule 4: Filter by Domain (Category)
      // filters.domain can be a string or array, handle both
      if (filters.domain && filters.domain.length > 0 && filters.domain !== "All") {
        // If the node's domain list doesn't overlap with selected domains, hide it
        // (Assuming filters.domain is the value from the dropdown)
        const searchDomains = Array.isArray(filters.domain) ? filters.domain : [filters.domain];
        // Special check: If "All" or empty is passed, ignore
        const validSearch = searchDomains.filter(d => d !== "All");

        if (validSearch.length > 0) {
          const hasMatch = node.domain.some(tag =>
            validSearch.some(s => s.includes(tag) || tag.includes(s))
          );
          if (!hasMatch) return false;
        }
      }

      return true;
    });

    // --- STEP 4: CLEANUP EDGES ---
    // If we removed nodes in Step 3 (e.g., by Domain), we must remove edges 
    // that now point to non-existent nodes.
    const finalNodeIds = new Set(currentNodes.map(n => n.id));
    currentEdges = currentEdges.filter(e =>
      finalNodeIds.has(e.from) && finalNodeIds.has(e.to)
    );

    // --- STEP 5: UPDATE DERIVED UI STATE ---
    // Update the "Node Select" dropdown based on what's currently visible
    if (filters.domain !== "All") {
      let nodevalues = currentNodes.map((object) => object.label).slice(1).sort();
      nodevalues.unshift("All");
      setSelectedNodes([...nodevalues]);
    }

    // Finally, update the graph
    setVisData({ nodes: currentNodes, edges: currentEdges });
  };

  // 1. Domain Handler
  const updateData = (event) => {
    const newVal = event.target.value; // Likely a string or array of strings
    const newFilters = { ...activeFilters, domain: newVal };

    setActiveFilters(newFilters);

    setSelectedValues(newVal);     // Update UI Dropdown

    applyFilters(newFilters);
  };

  // 2. Node Label Handler
  const updateNodeData = (event) => {
    const newVal = event.target.value;
    const newFilters = { ...activeFilters, nodeLabel: newVal };

    setActiveFilters(newFilters);
    setThirdDropdownValue(newVal); // Update UI Dropdown

    applyFilters(newFilters);
  };

  // 3. Dataset Handler
  const updateDatasetNodeData = (event) => {
    const newVal = event.target.value;
    const newFilters = { ...activeFilters, dataset: newVal };

    setActiveFilters(newFilters);
    setFourthDropdownValue(newVal); // Update UI Dropdown

    applyFilters(newFilters);
  };

  // 4. Event Type Handler
  const updateEventTypeData = (event) => {
    const value = event.target.value; // This is an array
    const lastSelected = value[value.length - 1];

    let newSelection;
    if (lastSelected === "All") {
      newSelection = ["All"];
    } else {
      newSelection = value.filter((v) => v !== "All");
    }

    const newFilters = { ...activeFilters, eventType: newSelection };

    setActiveFilters(newFilters);
    setSelectedEventTypes(newSelection); // Update UI Dropdown

    applyFilters(newFilters);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
    const newPath = `/${database.toLowerCase()}/${cmid}/${newValue}`;
    navigate(newPath, { replace: true });
  };

  useEffect(() => {
    const ordered = orderOfProperties.filter((prop) => fdrop.includes(prop));
    setOrderedProperties(ordered);

    if (ordered.length > 0) {
      setFirstDropdownValue(ordered[0]);
      fetchData({ target: { value: ordered[0] } });
    }
  }, [fdrop]);

  // Sync URL with Tab State on Load/Change
  useEffect(() => {
    // If the tab in the URL doesn't match the current active tab state...
    if (tabval !== value) {
      // ...update the URL to match the current state.
      const newPath = `/${database.toLowerCase()}/${cmid}/${value}`;
      navigate(newPath, { replace: true });
    }
  }, [value, tabval, cmid, database, navigate]);

  const [boxHeight, setBoxHeight] = useState("auto");

  useEffect(() => {
    const element = document.getElementById("content");

    // Only calculate height if the element exists in the DOM
    if (element) {
      setBoxHeight(element.offsetHeight + "px");
    }
  }, [rev, loadingInfo]);

  const handleDatasetCheckbox = () => {
    setRememberChoice((prev) => !prev);
  };
  if (loadingInfo) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh", // Full viewport height
          width: "100%",
          backgroundColor: "white",
        }}
      >
        <LoadingSpinner />
      </Box>
    );
  };
  try {
    return (
      <div
        style={{
          backgroundColor: "white",
          width: "100%",
          color: "black",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateRows: "40px auto 20px",
            width: "100%",
            backgroundImage: `linear-gradient(to bottom right,#555555, #cccccc)`,
            backgroundSize: "cover",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px", // Adds spacing between the heading and the icon
            }}
          >
            <h2 style={{ color: "black", margin: 0 }}>Category Info</h2>
            <MuiTool
              title={
                <Typography sx={{ fontSize: "1rem", fontWeight: "bold" }}>
                  Here, you can toggle between viewing sample info, maps, and
                  the network of contextual ties to this category.
                </Typography>
              }
              arrow
            >
              <InfoIcon style={{ color: "blue", cursor: "pointer" }} />
            </MuiTool>
          </div>
          <ul
            id="content"
            style={{
              color: "black",
              gridColumn: "1",
              gridRow: "2",
              fontSize: "large",
            }}
          >
            {rev && Object.keys(rev).length > 0 ? (
              Object.entries(rev).map(([key, value]) =>
                value !== "" && value !== null && value !== undefined && value !== 0 ? (
                  <li key={key}>
                    <strong>{key}:</strong>{" "}
                    {key === "Dataset Location" || key === "Merged_into_CMID" ? (
                      <a href={value} target="_blank" rel="noopener noreferrer">
                        {value}
                      </a>
                    ) : (
                      <Box component="span" sx={{ wordBreak: "break-word" }}>
                        {value}
                      </Box>
                    )}
                  </li>
                ) : null
              )
            ) : (
              <p>No data</p>
            )}
          </ul>
          {(cmid.startsWith("SD") ||
            cmid.startsWith("AD")) && (
              <Box
                sx={{
                  gridColumn: "1",
                  gridRow: "4",
                  display: "flex",
                  justifyContent: "left",
                  alignItems: "center",
                  flexDirection: "row",
                  margin: "2 2",
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControl sx={{ width: 320 }} variant="standard" size="small">
                    <Typography variant="subtitle2" gutterBottom>Select Category Domains for downloading</Typography>
                    <NativeSelect
                      value={domainDrop}
                      label=""
                      sx={{
                        fontSize: 14, letterSpacing: 0.5, borderRadius: 1, backgroundColor: "white", "& .MuiNativeSelect-select": {
                          padding: "4px 8px",
                        },
                      }}
                      onChange={(event) => {
                        const newDomain = event.target.value;
                        const subdomains = selectedCategory[newDomain] || [];

                        setdomainDrop(newDomain);
                        setadvoptions(subdomains);
                        setadvdomainDrop(subdomains[0] || '');
                      }}
                      input={<BootstrapInput />}
                    >
                      {Object.keys(selectedCategory).map((category, index) => (
                        <option key={index} value={category}>
                          {category === "DISTRICT" ? "AREA" : category}
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

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControl sx={{ width: 300 }} variant="standard">
                    <Typography variant="subtitle2" gutterBottom>Category Subdomain</Typography>
                    <NativeSelect
                      id="demo-customized-select-native"
                      value={advdomainDrop}
                      label=""
                      sx={{
                        fontSize: 14, letterSpacing: 0.5, borderRadius: 1, backgroundColor: "white", "& .MuiNativeSelect-select": {
                          padding: "4px 8px",
                        },
                      }}
                      onChange={(event) => {
                        setadvdomainDrop(event.target.value);
                      }}
                      input={<BootstrapInput />}
                    >
                      {advoptions.map((value, index) => (
                        <option key={index} value={value}>
                          {value === "DISTRICT" ? "AREA" : value}
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

                {/* <Select
                multiple
                value={datasetdomainValue}
                onChange={datasetDropdownChange}
                displayEmpty
                sx={{ minWidth: 120, marginBottom: 2, marginLeft: 2 }}
              >
                <MenuItem value="" disabled>
                  Select an option
                </MenuItem>
                {datasetdropdown.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select> */}
                <Button
                  variant="contained"
                  onClick={datasetButtonClick}
                  sx={{
                    backgroundColor: "black",
                    color: "white",
                    // Change hover color based on loading state (Green for normal, Red for cancel)
                    "&:hover": {
                      backgroundColor: loadingDownload ? "#d32f2f" : "green",
                    },
                    marginLeft: 2,
                    width: 250,
                    fontSize: 12,
                    marginBottom: 2,
                    // Prevents the button from changing size when the spinner appears
                    minHeight: "36px",
                  }}
                >
                  {loadingDownload ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <CircularProgress size={14} color="inherit" />
                      <span>Cancel Download</span>
                    </div>
                  ) : (
                    "Download Dataset Categories and Metadata"
                  )}
                </Button>
                <FormControlLabel
                  sx={{ marginLeft: 2, marginBottom: 2 }}
                  control={<Checkbox />}
                  onChange={handleDatasetCheckbox}
                  label="Include connected datasets?"
                />
              </Box>
            )}
          <Button
            variant="outlined"
            onClick={handleOpenLogs}
            sx={{
              marginLeft: "auto",
              marginRight: 2,
              marginBottom: 2,
              fontSize: 12,
              color: "#000",
              borderColor: "#00BFFF",
              background:
                "linear-gradient(135deg, rgba(0,191,255,0.1), rgba(255,255,255,0.05))",
              backdropFilter: "blur(4px)",
              boxShadow: "0 0 8px rgba(0,191,255,0.5)",
              textTransform: "uppercase",
              fontWeight: 600,
              letterSpacing: 1,
              transition: "0.3s ease-in-out",
              // Ensure button doesn't shrink when text is replaced by spinner
              minWidth: "140px",
              "&:hover": {
                backgroundColor: "#00BFFF",
                color: "#000",
                boxShadow: "0 0 12px rgba(0,191,255,0.8)",
                borderColor: "#00BFFF",
              },
            }}
          >
            View Logs
          </Button>
        </Box>
        <Box
          sx={{
            position: "relative",
            left: "10px",
            top: boxHeight + 100,
          }}
        >
          {/* Render tabs here--first check for DATASET view, otherwise use CATEGORY view */}
          {cmid.startsWith("SD") ||
            cmid.startsWith("AD") ? (
            <React.Fragment>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  sx={{ maxHeight: 700 }}
                  value={value}
                  onChange={handleChange}
                  aria-label="tab layout"
                >
                  <Tab label="Network Explorer" value="network" {...a11yProps("network")} />
                  <Tab label="Map" value="map" {...a11yProps("map")} />
                  <Tab label="Categories" value="categories" {...a11yProps("categories")} />
                </Tabs>
              </Box>

              <CustomTabPanel value={value} index={"network"}>
                {/* Show loading bar only if fetching network data */}
                {loadingNetwork && <LinearProgress sx={{ marginBottom: 2 }} />}
                <NetworkExplorerView
                  database={database}
                  domainType="DATASET"
                  limit={limit}
                  dropdownNodeLimit={dropdownNodeLimit}
                  setDropdownNodeLimit={setDropdownNodeLimit}
                  firstDropdownValue={firstDropdownValue}
                  fetchData={fetchData}
                  orderedProperties={orderedProperties}
                  selectedValues={selectedValues}
                  updateData={updateData}
                  domains={domains}
                  thirdDropdownValue={thirdDropdownValue}
                  updateNodeData={updateNodeData}
                  selectedNodes={selectedNodes}
                  visData={visData}
                  fourthDropdownValue={fourthDropdownValue}
                  updateDatasetNodeData={updateDatasetNodeData}
                  selectedDatasets={selectedDatasets}
                  eventTypes={eventTypes}
                  selectedEventTypes={selectedEventTypes}
                  updateEventTypeData={updateEventTypeData}
                />
              </CustomTabPanel>

              <CustomTabPanel value={value} index={"map"}>
                {/* Show loading bar if background data is loading */}
                {loadingBackground && <LinearProgress sx={{ marginBottom: 2 }} />}
                <div
                  style={{
                    position: "relative",
                    top: "10",
                    left: "200",
                    width: "95%",
                    height: "80vh",
                  }}
                >
                  {loadingBackground ? null : (
                    mapt.length !== 0 || datasetpoints.length !== 0 ? (
                      <MapComponent points={datasetpoints} mapt={mapt} sources={sources} />
                    ) : (
                      <p>No map available for this dataset.</p>
                    )
                  )}
                  <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Alert</DialogTitle>
                    <DialogContent>
                      {badsources && badsources.length > 0 ? (
                        <ul>
                          {badsources.map((source, index) => (
                            <li key={index}>
                              <strong>Source:</strong> {source.source}
                              <br />
                              <strong>Error:</strong> {source.error}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No bad sources</p>
                      )}
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleClose} color="primary">
                        Close
                      </Button>
                    </DialogActions>
                  </Dialog>
                </div>
              </CustomTabPanel>

              <CustomTabPanel value={value} index={"categories"}>
                {/* Show loading bar if background data is loading */}
                {loadingBackground && <LinearProgress sx={{ marginBottom: 2 }} />}
                <CategoriesTable categories={categories} childcategories={childcategories} rememberChoice={rememberChoice} normalized={normalizedRef.current} />
              </CustomTabPanel>
            </React.Fragment>
          ) : (
            // Render for category view
            <React.Fragment>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  sx={{ maxHeight: 700 }}
                  value={value}
                  onChange={handleChange}
                  aria-label="basic tabs example"
                >
                  <Tab label="Network Explorer" value="network" {...a11yProps("network")} />
                  <Tab label="Map" value="map" {...a11yProps("map")} />
                  <Tab label="Timespan" value="timespan" {...a11yProps("timespan")} />
                  <Tab label="Datasets" value="datasets" {...a11yProps("datasets")} />
                  {categories.length !== 0 ? (
                    <Tab label="Categories" value="categories" {...a11yProps("categories")} />
                  ) : null}
                </Tabs>
              </Box>
              <CustomTabPanel value={value} index={"network"}>
                {/* Show loading bar if background data is loading */}
                {loadingBackground && <LinearProgress sx={{ marginBottom: 2 }} />}
                <NetworkExplorerView
                  database={database}
                  domainType="CATEGORY"
                  limit={limit}
                  dropdownNodeLimit={dropdownNodeLimit}
                  setDropdownNodeLimit={setDropdownNodeLimit}
                  firstDropdownValue={firstDropdownValue}
                  fetchData={fetchData}
                  orderedProperties={orderedProperties}
                  selectedValues={selectedValues}
                  updateData={updateData}
                  domains={domains}
                  thirdDropdownValue={thirdDropdownValue}
                  updateNodeData={updateNodeData}
                  selectedNodes={selectedNodes}
                  visData={visData}
                  fourthDropdownValue={fourthDropdownValue}
                  updateDatasetNodeData={updateDatasetNodeData}
                  selectedDatasets={selectedDatasets}
                  eventTypes={eventTypes}
                  selectedEventTypes={selectedEventTypes}
                  updateEventTypeData={updateEventTypeData}
                />
              </CustomTabPanel>
              <CustomTabPanel value={value} index={"map"}>
                <div
                  style={{
                    position: "relative",
                    top: "10",
                    left: "200",
                    width: "95%",
                    height: "60vh",
                  }}
                >
                  {mapt.length !== 0 || points.length !== 0 ? (
                    <MapComponent points={points} mapt={mapt} sources={sources} />
                  ) : (
                    <p>No map available for this category.</p>
                  )}
                  <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Alert</DialogTitle>
                    <DialogContent>
                      {badsources && badsources.length > 0 ? (
                        <ul>
                          {badsources.map((source, index) => (
                            <li key={index}>
                              <strong>Source:</strong> {source.source}
                              <br />
                              <strong>Error:</strong> {source.error}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No bad sources</p>
                      )}
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleClose} color="primary">
                        Close
                      </Button>
                    </DialogActions>
                  </Dialog>
                </div>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={"timespan"}>
                {usert ? (<TimespanTable data={usert} />) : (<p> No Timespan available for this category.</p>)}
              </CustomTabPanel>
              <CustomTabPanel value={value} index={"datasets"}>
                <ClickTable usert={usert} />
              </CustomTabPanel>
              <CustomTabPanel value={value} index={"categories"}>
                <CategoriesTable categories={categories} />
              </CustomTabPanel>
            </React.Fragment>
          )}
        </Box>
      </div >
    );
  } catch (error) {
    alert(error);
  }
}