/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

import { useLocation, useNavigate } from "react-router-dom";
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
  Snackbar,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import InfoIcon from "@mui/icons-material/Info";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

import PropTypes from "prop-types";
import { downloadJsonAsXlsx } from "../utils/excelExport";

import CategoriesTable from "./TableCategories";
import ClickTable from "./ExploreTabs";
import NetworkExplorerView from "./ExploreNetwork";
import LoadingSpinner from "./LoadingSpinner";

import TimespanTable from "./TimeSpanTable";
import MapComponent from './MapComponent';

import { useMetadata } from './UseMetadata';
import { useAuth } from './AuthContext';
import { addBookmark, addHistoryItem } from '../api/profileApi';
import {
  getRequestedExploreTab,
  getResolvedExploreTab,
  shouldRedirectExploreTab,
} from "../utils/exploreTabSync";

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
  const location = useLocation();
  const { user, cred } = useAuth();
  const requestedTab = getRequestedExploreTab(tabval);
  const [value, setValue] = useState(requestedTab);
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
  const [thirdDropdownValue, setThirdDropdownValue] = useState(["All"]);
  const [fourthDropdownValue, setFourthDropdownValue] = useState("All");
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState(["All"]);
  const [allNodeOptions, setAllNodeOptions] = useState(["All"]);
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
    "EQUIVALENT",
    "MERGING"
  ];

  const [activeFilters, setActiveFilters] = useState({
    domain: [],      // From updateData (was string, now array for safety)
    nodeLabel: ["All"],// From updateNodeData
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
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const abortControllerRef = useRef(null);
  const [badsources, setbadsources] = useState([]);
  const [domainDrop, setdomainDrop] = React.useState('ALL NODES');
  const [advdomainDrop, setadvdomainDrop] = React.useState('ALL NODES');
  const [advoptions, setadvoptions] = React.useState(['ALL NODES']);
  const [selectedCategory, setSelectedCategory] = useState({});
  const normalizedRef = useRef({});
  const nodeRequestIdRef = useRef(0);

  const [open, setOpen] = useState(false);
  const [bookmarkNotice, setBookmarkNotice] = useState({ open: false, severity: "success", message: "" });
  const [redirectPrompt, setRedirectPrompt] = useState({ open: false, from: "", to: "", database: "" });
  const historyLoggedRef = useRef("");
  const [mergeTemplateSummary, setMergeTemplateSummary] = useState(null);
  const [loadingMergeTemplateSummary, setLoadingMergeTemplateSummary] = useState(false);
  const redirectNoticeStorageKey = "cmid_redirect_notice";
  const stayOnDeletedPage = new URLSearchParams(location.search).get("stayDeleted") === "1";

  let limit = 500;

  const { infodata } = useMetadata(database);
  const clearNodeData = useCallback(() => {
    setrev({});
    setUsert([]);
    setCategories([]);
    setChildCategories([]);
    setMapt([]);
    setPoints([]);
    setDatasetPoints([]);
    setbadsources([]);
    setsources([]);
    setOpen(false);
    setfdrop([]);
    setoriginaldata(null);
    setVisData(null);
    setdomains([]);
    setSelectedValues([]);
    setSelectedNodes(["All"]);
    setAllNodeOptions(["All"]);
    setSelectedDatasets([]);
    setEventTypes([]);
    setSelectedEventTypes(["All"]);
    setThirdDropdownValue(["All"]);
    setFourthDropdownValue("All");
  }, []);

  // dialog box for bad sources
  const handleClose = () => {
    setOpen(false);
  };

  const handleBookmarkCurrent = async () => {
    if (!user || !cred) {
      setBookmarkNotice({ open: true, severity: "warning", message: "Please log in to save bookmarks." });
      return;
    }
    try {
      await addBookmark({
        userId: user,
        database,
        cmid,
        cmname: rev?.CMName || "",
        cred
      });
      setBookmarkNotice({ open: true, severity: "success", message: `Bookmarked ${cmid}` });
    } catch (error) {
      setBookmarkNotice({ open: true, severity: "error", message: error.message || "Unable to bookmark this CMID." });
    }
  };

  useEffect(() => {
    const key = `${database}::${cmid}`;
    if (!user || !cred || !cmid || historyLoggedRef.current === key) return;
    historyLoggedRef.current = key;
    addHistoryItem({
      userId: user,
      database,
      cmid,
      cmname: rev?.CMName || "",
      cred
    }).catch(() => { });
  }, [user, cred, database, cmid, rev]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(redirectNoticeStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const targetDatabase = String(parsed?.database || "").toLowerCase();
      const targetCmid = String(parsed?.to || "");
      if (targetDatabase === String(database || "").toLowerCase() && targetCmid === String(cmid || "")) {
        setRedirectPrompt({
          open: true,
          from: String(parsed?.from || ""),
          to: String(parsed?.to || ""),
          database: targetDatabase
        });
        sessionStorage.removeItem(redirectNoticeStorageKey);
      }
    } catch (_error) {
      sessionStorage.removeItem(redirectNoticeStorageKey);
    }
  }, [cmid, database]);

  useEffect(() => {
    if (!stayOnDeletedPage) return;
    setBookmarkNotice({
      open: true,
      severity: "info",
      message: `Showing deleted CMID ${cmid}. Automatic redirect is paused for this page.`
    });
  }, [stayOnDeletedPage, cmid]);

  const handleCloseRedirectPrompt = () => {
    setRedirectPrompt((prev) => ({ ...prev, open: false }));
  };

  const handleStayOnDeletedPage = () => {
    const sourceDatabase = String(redirectPrompt.database || database || "").toLowerCase();
    const sourceCmid = String(redirectPrompt.from || "").trim();
    setRedirectPrompt((prev) => ({ ...prev, open: false }));
    if (!sourceDatabase || !sourceCmid) return;
    navigate(`/${sourceDatabase}/${sourceCmid}?stayDeleted=1`, { replace: true });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(() => {
    if (!cmid || !database) {
      console.warn("Skipping fetch: cmid or database is missing", { cmid, database });
      setLoadingInfo(false);
      setNavigationLoading(false);
      setLoadingBackground(false);
      clearNodeData();
      return;
    }

    const requestId = nodeRequestIdRef.current + 1;
    nodeRequestIdRef.current = requestId;
    const controller = new AbortController();
    const { signal } = controller;
    const isLatestRequest = () => nodeRequestIdRef.current === requestId;

    const baseUrl = process.env.REACT_APP_API_URL;
    const infoUrl = `${baseUrl}/info/${database}/${cmid}`;
    const categoryUrl = `${baseUrl}/category/${database}/${cmid}`;
    const geometryUrl = `${baseUrl}/exploreGeometry/${database}/${cmid}`;

    clearNodeData();

    // Start spinner
    setLoadingInfo(true);
    setNavigationLoading(true);
    setLoadingBackground(true);

    const loadInfo = async () => {
      try {
        const res = await fetch(infoUrl, { signal });
        if (!res.ok) {
          throw new Error(`Info request failed with status ${res.status}`);
        }
        const infoData = await res.json();
        if (!isLatestRequest()) return;
        const domainValues = Array.isArray(infoData?.Domains)
          ? infoData.Domains
          : infoData?.Domains
            ? String(infoData.Domains).split(",").map((x) => x.trim()).filter(Boolean)
            : [];
        const isDeletedNodeInfo = domainValues.includes("DELETED");
        const redirectTarget = typeof infoData?.Merged_into_CMID === "string"
          ? infoData.Merged_into_CMID.trim()
          : "";

        if (isDeletedNodeInfo && redirectTarget && redirectTarget !== cmid && !stayOnDeletedPage) {
          sessionStorage.setItem(
            redirectNoticeStorageKey,
            JSON.stringify({
              from: cmid,
              to: redirectTarget,
              database: String(database || "").toLowerCase()
            })
          );
          setNavigationLoading(true);
          navigate(`/${String(database || "").toLowerCase()}/${redirectTarget}`, { replace: true });
          return;
        }

        setrev(infoData);
        if (isDeletedNodeInfo && !redirectTarget) {
          setBookmarkNotice({
            open: true,
            severity: "warning",
            message: `CMID ${cmid} is DELETED and has no IS redirect relationship.`
          });
        }
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Error fetching info:", err);
        if (!isLatestRequest()) return;
        clearNodeData();
      } finally {
        if (!isLatestRequest()) return;
        setLoadingInfo(false);
        setNavigationLoading(false);
      }
    };

    const loadBackground = async () => {
      try {
        const [categoryRes, geometryRes] = await Promise.all([
          fetch(categoryUrl, { signal }),
          fetch(geometryUrl, { signal })
        ]);
        if (!categoryRes.ok) {
          throw new Error(`Category request failed with status ${categoryRes.status}`);
        }
        if (!geometryRes.ok) {
          throw new Error(`Geometry request failed with status ${geometryRes.status}`);
        }
        const [categoryData, geometryData] = await Promise.all([
          categoryRes.json(),
          geometryRes.json()
        ]);
        if (!isLatestRequest()) return;
        // --- Process Category Data ---
        const safeSamples = Array.isArray(categoryData?.samples) ? categoryData.samples : [];
        const safeCategories = Array.isArray(categoryData?.categories) ? categoryData.categories : [];
        const safeChildCategories = Array.isArray(categoryData?.childcategories) ? categoryData.childcategories : [];
        setUsert(safeSamples);
        setCategories(safeCategories);

        // Safety check for child categories
        const children = safeChildCategories;
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
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Error fetching background data:", err);
        if (!isLatestRequest()) return;
        setUsert([]);
        setCategories([]);
        setChildCategories([]);
        setMapt([]);
        setPoints([]);
        setDatasetPoints([]);
        setbadsources([]);
        setsources([]);
        setOpen(false);
        setfdrop([]);
      } finally {
        if (!isLatestRequest()) return;
        setLoadingBackground(false); // <--- Stop background tab loading
      }
    };

    loadInfo();
    loadBackground();

    return () => {
      controller.abort();
    };
  }, [cmid, database, clearNodeData, stayOnDeletedPage]);

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

      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      await downloadJsonAsXlsx(result, {
        fileName: `${rev.CMName} ${formattedDate}.xlsx`,
        sheetName: "Sheet1",
      });
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

  const goToCmidInfo = (targetCmid) => {
    if (!targetCmid || targetCmid === cmid) return;
    setNavigationLoading(true);
    navigate(`/${database.toLowerCase()}/${targetCmid}/network`);
  };

  const handleNodeNavigateStart = useCallback(() => {
    setNavigationLoading(true);
  }, []);

  const downloadRowsAsXlsx = async (rows, filename, sheetName = "Sheet1") => {
    if (!Array.isArray(rows) || rows.length === 0) {
      alert("No rows available to download.");
      return;
    }
    await downloadJsonAsXlsx(rows, {
      fileName: filename,
      sheetName,
    });
  };

  const downloadMergingTemplateTies = (tieType) => {
    if (!mergeTemplateSummary) return;
    const today = new Date();
    const dateTag = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (tieType === "merging") {
      void downloadRowsAsXlsx(
        mergeTemplateSummary.mergingTies || [],
        `${cmid}_merging_ties_${dateTag}.xlsx`,
        "MergingTies"
      );
    } else {
      void downloadRowsAsXlsx(
        mergeTemplateSummary.equivalenceTies || [],
        `${cmid}_equivalence_ties_${dateTag}.xlsx`,
        "EquivalenceTies"
      );
    }
  };

  const fetchData = async (eventOrOptions = {}) => {
    setLoadingNetwork(true);
    const relationValue = eventOrOptions?.target?.value ?? eventOrOptions?.relation ?? firstDropdownValue;
    const requestedDomainsRaw = eventOrOptions?.domains ?? [];
    const preserveDomainOptions = Boolean(eventOrOptions?.preserveDomainOptions);
    const requestedDomains = (Array.isArray(requestedDomainsRaw) ? requestedDomainsRaw : [requestedDomainsRaw])
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .filter((value) => value !== "All");

    setFirstDropdownValue(relationValue);
    try {
      const queryParams = new URLSearchParams({
        cmid,
        database,
        relation: relationValue,
        response: "records",
        limit: String(limit),
      });
      if (requestedDomains.length > 0) {
        queryParams.set("domain", requestedDomains.join(","));
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/networksjs?${queryParams.toString()}`);
      const result = await response.json();

      const rawNodes = [
        ...(Array.isArray(result?.node) ? result.node : []),
        ...(Array.isArray(result?.relNodes) ? result.relNodes : []),
      ];

      const groupDomains = new Set(Object.keys(normalizedRef.current || {}));
      const subdomains = new Set(
        Object.values(normalizedRef.current || {}).flat().filter(Boolean)
      );
      const isTopLevelDomain = (label) => groupDomains.has(label);

      const uniqueLabels = (labels = []) =>
        [...new Set(labels.filter((value) => value && value !== "CATEGORY"))];

      const getEffectiveLabels = (labels = []) => {
        const cleaned = uniqueLabels(labels);
        const nonGroupSubdomains = cleaned.filter(
          (label) => subdomains.has(label) && !isTopLevelDomain(label)
        );
        if (nonGroupSubdomains.length > 0) {
          return nonGroupSubdomains;
        }
        const nonGroup = cleaned.filter((label) => !groupDomains.has(label) || cleaned.length === 1);
        return nonGroup.length > 0 ? nonGroup : cleaned;
      };

      const normalizeLegendLabel = (rawLegendLabel, effectiveLabels) => {
        if (!rawLegendLabel) {
          return effectiveLabels.length > 0 ? effectiveLabels.join(":") : "UNMAPPED";
        }

        const tokens = String(rawLegendLabel)
          .split(/[:+,/|]/)
          .map((token) => token.trim())
          .filter(Boolean);

        const cleaned = uniqueLabels(tokens);
        const tokenSubdomains = cleaned.filter(
          (label) => subdomains.has(label) && !isTopLevelDomain(label)
        );
        const tokenNonGroups = cleaned.filter((label) => !groupDomains.has(label));

        const preferred =
          tokenSubdomains.length > 0
            ? tokenSubdomains
            : (tokenNonGroups.length > 0 ? tokenNonGroups : cleaned);

        if (preferred.length > 0) {
          return preferred.join(":");
        }
        return effectiveLabels.length > 0 ? effectiveLabels.join(":") : "UNMAPPED";
      };

      const node = rawNodes.map((nodeData) => {
        const effectiveLabels = getEffectiveLabels(nodeData.labels || []);
        const normalizedLegendLabel = normalizeLegendLabel(nodeData.legendLabel, effectiveLabels);

        return {
          id: nodeData.id,
          label: nodeData.CMName,
          // Domain labels for legend/color rendering (subdomain-preferred).
          domain: effectiveLabels,
          // Raw node labels for dropdown filtering; includes top-level labels.
          filterDomains: uniqueLabels(nodeData.labels || []),
          legendLabel: normalizedLegendLabel,
          CMID: nodeData.CMID,
          tooltipcon: generateTooltipContent({
            ...nodeData,
            legendLabel: normalizedLegendLabel
          }),
          color: nodeData.color || "#cccccc",
        };
      });

      const nodes = Array.from(new Set(node.map(JSON.stringify))).map(
        JSON.parse
      );

      const edges = (Array.isArray(result?.relations) ? result.relations : []).map((relationship) => {
        const { start_node_id, end_node_id, eventType, ...rest } = relationship;

        const edge =
        {
          from: start_node_id,
          to: end_node_id,
          ...rest,
          color: "black",
        };

        if (relationValue === "CONTAINS") {
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

      let domainOptions = domains;
      if (!preserveDomainOptions) {
        domainOptions = nodes.map((object) => object.filterDomains || object.domain).slice(1);
        domainOptions = Array.from(new Set(domainOptions.flat()));
        domainOptions = domainOptions.filter((value) => value !== "CATEGORY");
        setdomains(domainOptions);
      }
      const selectedDomainOptions = requestedDomains.length > 0
        ? domainOptions.filter((option) => requestedDomains.includes(option))
        : (preserveDomainOptions ? [] : domainOptions);
      setSelectedValues(selectedDomainOptions);

      let nodevalues = nodes
        .map((object) => object.label)
        .slice(1)
        .sort()
        .slice(0, limit);
      nodevalues.unshift("All");
      setAllNodeOptions([...nodevalues]);
      setSelectedNodes([...nodevalues]);
      setThirdDropdownValue(["All"]);

      if (
        relationValue !== "USES" &&
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

      setoriginaldata({ nodes, edges });
      setVisData({ nodes, edges });

      if (relationValue === "CONTAINS") {
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
      } else {
        setEventTypes([]);
        setSelectedEventTypes(["All"]);
      }

      setFourthDropdownValue("All");
      setActiveFilters((prev) => ({
        ...prev,
        domain: selectedDomainOptions,
        nodeLabel: ["All"],
        dataset: "All",
        eventType: ["All"],
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingNetwork(false); // <--- Stop loading regardless of success/fail
    }
  };

  const applyFilters = (filters) => {
    if (!originaldata) return;

    // Always start fresh from originaldata
    let currentEdges = originaldata.edges || [];
    let currentNodes = originaldata.nodes || [];

    // --- STEP 1: FILTER EDGES ---

    // A. Filter by Dataset (Reference Key)
    if (filters.dataset !== "All") {
      currentEdges = currentEdges.filter((edge) => {
        const keys = Array.isArray(edge.referenceKey)
          ? edge.referenceKey
          : edge.referenceKey
            ? [edge.referenceKey]
            : [];
        return keys.some((key) => String(key).includes(filters.dataset));
      });
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
      if (Array.isArray(filters.nodeLabel) && !filters.nodeLabel.includes("All")) {
        if (!filters.nodeLabel.includes(node.label)) return false;
      }

      // Rule 4: Filter by Domain (Category)
      // filters.domain can be a string or array, handle both
      if (Array.isArray(filters.domain) && filters.domain.length > 0 && !filters.domain.includes("All")) {
        // If the node's domain list doesn't overlap with selected domains, hide it
        // (Assuming filters.domain is the value from the dropdown)
        const validSearch = filters.domain.filter((d) => d !== "All");

        if (validSearch.length > 0) {
          const filterDomains = node.filterDomains || node.domain || [];
          const hasMatch = filterDomains.some(tag =>
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

    // Finally, update the graph.
    setVisData({ nodes: currentNodes, edges: currentEdges });
  };

  // 1. Domain Handler
  const updateData = (event) => {
    const rawValue = event.target.value;
    const newVal = Array.from(
      new Set((Array.isArray(rawValue) ? rawValue : [rawValue]).map((value) => String(value || "").trim()).filter(Boolean))
    );
    const newFilters = { ...activeFilters, domain: newVal, nodeLabel: ["All"], dataset: "All", eventType: ["All"] };
    setActiveFilters(newFilters);
    setSelectedValues(newVal);
    setFourthDropdownValue("All");
    setSelectedEventTypes(["All"]);
    setThirdDropdownValue(["All"]);
    setSelectedNodes(allNodeOptions);
    fetchData({ relation: firstDropdownValue, domains: newVal, preserveDomainOptions: true });
  };

  // 2. Node Label Handler
  const updateNodeData = (event) => {
    const rawValue = event.target.value;
    const value = Array.isArray(rawValue) ? rawValue : [rawValue];
    const lastSelected = value[value.length - 1];

    let newVal;
    if (lastSelected === "All") {
      newVal = ["All"];
    } else {
      newVal = value.filter((entry) => entry !== "All");
      if (newVal.length === 0) {
        newVal = ["All"];
      }
    }

    newVal = Array.from(new Set(newVal));
    const newFilters = { ...activeFilters, nodeLabel: newVal };

    setActiveFilters(newFilters);
    setThirdDropdownValue(newVal);
    setSelectedNodes(allNodeOptions);

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
    navigate(
      {
        pathname: newPath,
        search: location.search,
      },
      { replace: true }
    );
  };

  useEffect(() => {
    if (value !== requestedTab) {
      setValue(requestedTab);
    }
  }, [cmid, requestedTab]);

  useEffect(() => {
    let ordered = orderOfProperties.filter((prop) => fdrop.includes(prop));
    if (ordered.includes("MERGING")) {
      ordered = ordered.filter((prop) => prop !== "MERGING").concat("MERGING");
    }
    setOrderedProperties(ordered);

    if (ordered.length > 0) {
      setFirstDropdownValue(ordered[0]);
      fetchData({ target: { value: ordered[0] } });
    }
  }, [fdrop]);

  const domainLabels = Array.isArray(rev?.Domains)
    ? rev.Domains
    : rev?.Domains
      ? String(rev.Domains).split(",").map((x) => x.trim())
      : [];
  const isDeletedNode = domainLabels.includes("DELETED");
  const deletedRedirectTarget = typeof rev?.Merged_into_CMID === "string" ? rev.Merged_into_CMID.trim() : "";
  const hasDeletedRedirect = Boolean(deletedRedirectTarget && deletedRedirectTarget !== cmid);
  const categoryInfoEntries = useMemo(
    () => {
      if (!rev || typeof rev !== "object") return [];

      const filteredEntries = Object.entries(rev).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined && value !== 0
      );
      const isCitationKey = (key) => {
        const normalized = String(key || "")
          .toLowerCase()
          .replace(/[\s_]/g, "");
        return normalized === "citation" || normalized === "datasetcitation";
      };
      const nonCitation = filteredEntries.filter(([key]) => !isCitationKey(key));
      const citation = filteredEntries.filter(([key]) => isCitationKey(key));

      return [...nonCitation, ...citation];
    },
    [rev]
  );
  const isStackNode = domainLabels.includes("STACK");
  const isMergingTemplateNode = domainLabels.includes("MERGING");
  const isDatasetLike = cmid.startsWith("SD") || cmid.startsWith("AD") || isStackNode || isMergingTemplateNode || domainLabels.includes("DATASET");
  const showMergingTemplateTab = isStackNode || isMergingTemplateNode;
  const hasNetworkTab = orderOfProperties.some((prop) => fdrop.includes(prop));
  const hasPolygonData = Array.isArray(mapt)
    ? mapt.length > 0
    : Array.isArray(mapt?.features)
      ? mapt.features.length > 0
      : Boolean(mapt && Object.keys(mapt).length > 0);
  const hasDatasetMapTab = hasPolygonData || (Array.isArray(datasetpoints) && datasetpoints.length > 0);
  const hasCategoryMapTab = hasPolygonData || (Array.isArray(points) && points.length > 0);
  const hasDatasetCategoriesTab = (Array.isArray(categories) && categories.length > 0) || (Array.isArray(childcategories) && childcategories.length > 0);
  const hasCategoryDatasetsTab = Array.isArray(usert) && usert.length > 0;
  const hasCategoryTimespanData = Array.isArray(usert) && usert.some((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const candidates = [entry.rStart, entry.rEnd, entry.yStart, entry.yEnd];
    return candidates.some((value) => {
      if (value === null || value === undefined) return false;
      const text = String(value).trim().toLowerCase();
      return text !== "" && text !== "null";
    });
  });
  const hasCategoryTimespanTab = !isDatasetLike && hasCategoryTimespanData;
  const hasCategoryCategoriesTab = Array.isArray(categories) && categories.length > 0;
  const hasMergingTemplateTabData = Boolean(
    mergeTemplateSummary &&
    (
      (mergeTemplateSummary.nodeType === "MERGING" && Array.isArray(mergeTemplateSummary.stackSummary) && mergeTemplateSummary.stackSummary.length > 0) ||
      (mergeTemplateSummary.nodeType === "STACK" && (
        (Array.isArray(mergeTemplateSummary.datasetSummary) && mergeTemplateSummary.datasetSummary.length > 0) ||
        Number(mergeTemplateSummary.mergingTemplateCount || 0) > 0
      ))
    )
  );
  const showMergingTemplateTabWithData = showMergingTemplateTab && hasMergingTemplateTabData;

  useEffect(() => {
    if (!showMergingTemplateTab || !cmid || !database) {
      setMergeTemplateSummary(null);
      return;
    }
    setLoadingMergeTemplateSummary(true);
    fetch(`${process.env.REACT_APP_API_URL}/merge/template/summary/${database}/${cmid}`)
      .then((res) => res.json())
      .then((data) => setMergeTemplateSummary(data))
      .catch((err) => {
        console.error("Error fetching merge template summary:", err);
        setMergeTemplateSummary(null);
      })
      .finally(() => setLoadingMergeTemplateSummary(false));
  }, [showMergingTemplateTab, cmid, database]);

  useEffect(() => {
    const availableTabs = isDatasetLike
      ? [
        hasNetworkTab ? "network" : null,
        hasDatasetMapTab ? "map" : null,
        hasDatasetCategoriesTab ? "categories" : null,
        showMergingTemplateTabWithData ? "merging-template" : null
      ].filter(Boolean)
      : [
        hasNetworkTab ? "network" : null,
        hasCategoryMapTab ? "map" : null,
        hasCategoryTimespanTab ? "timespan" : null,
        hasCategoryDatasetsTab ? "datasets" : null,
        hasCategoryCategoriesTab ? "categories" : null
      ].filter(Boolean);

    const resolvedTab = getResolvedExploreTab(requestedTab, availableTabs, {
      allowFallback: !loadingInfo && !loadingBackground && !navigationLoading,
    });
    if (!resolvedTab) return;
    if (value !== resolvedTab) {
      setValue(resolvedTab);
    }
    if (shouldRedirectExploreTab(tabval, resolvedTab)) {
      navigate(
        {
          pathname: `/${database.toLowerCase()}/${cmid}/${resolvedTab}`,
          search: location.search,
        },
        { replace: true }
      );
    }
  }, [
    isDatasetLike,
    tabval,
    requestedTab,
    value,
    cmid,
    database,
    navigate,
    hasNetworkTab,
    hasDatasetMapTab,
    hasDatasetCategoriesTab,
    showMergingTemplateTabWithData,
    hasCategoryMapTab,
    hasCategoryTimespanTab,
    hasCategoryDatasetsTab,
    hasCategoryCategoriesTab,
    loadingInfo,
    loadingBackground,
    navigationLoading,
    location.search,
  ]);

  const handleDatasetCheckbox = () => {
    setRememberChoice((prev) => !prev);
  };
  if (loadingInfo || navigationLoading) {
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
            gridTemplateRows: "auto auto auto",
            width: "100%",
            position: "relative",
            backgroundImage: `linear-gradient(to bottom right,#555555, #cccccc)`,
            backgroundSize: "cover",
          }}
        >
          <Box className="view-logs-anchor">
            <Button
              variant="outlined"
              onClick={handleOpenLogs}
              className="view-logs-btn"
            >
              View Logs
            </Button>
          </Box>
          <div className="category-info-header-row">
            <div className="category-info-header-pill">
              <h2 className="category-info-header-title">
                {isDeletedNode ? "DELETED Node Info" : "Category Info"}
              </h2>
              <MuiTool
                title={
                  <Typography sx={{ fontSize: "1rem", fontWeight: "bold" }}>
                    Here, you can toggle between viewing sample info, maps, and
                    the network of contextual ties to this category.
                  </Typography>
                }
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      color: "#000000",
                      border: "1px solid rgba(0, 0, 0, 0.2)",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                    },
                  },
                  arrow: {
                    sx: {
                      color: "rgba(255, 255, 255, 0.9)",
                    },
                  },
                }}
              >
                <InfoIcon className="category-info-header-info-icon" />
              </MuiTool>
              <Button
                size="small"
                startIcon={<BookmarkBorderIcon />}
                variant="outlined"
                onClick={handleBookmarkCurrent}
                className="category-info-bookmark-btn"
              >
                Bookmark
              </Button>
            </div>
          </div>
          {isDeletedNode && (
            <Alert
              severity={hasDeletedRedirect ? "info" : "warning"}
              sx={{
                gridColumn: "1",
                gridRow: "2",
                mt: 1,
                mb: 1,
                mx: 0.5,
                py: 1,
                px: 1.5,
                "& .MuiAlert-icon": { fontSize: "1.9rem", alignItems: "center" },
              }}
            >
              <Typography variant="body1" sx={{ mb: 0.75, fontWeight: 700 }}>
                <strong>CMID:</strong> {rev?.CMID || cmid} &nbsp;|&nbsp; <strong>CMName:</strong> {rev?.CMName || "(No CMName)"} &nbsp;|&nbsp; <strong>Domain:</strong> DELETED
              </Typography>
              {hasDeletedRedirect ? (
                <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                  <Typography variant="body1">
                    This deleted node is linked to active CMID {deletedRedirectTarget}.
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/${String(database || "").toLowerCase()}/${deletedRedirectTarget}`)}
                  >
                    Go to Active CMID
                  </Button>
                </Box>
              ) : (
                <Typography variant="body1">
                  No IS redirect relationship exists for this deleted node.
                </Typography>
              )}
            </Alert>
          )}
          <Box id="content" className="category-info-grid">
            {categoryInfoEntries.length > 0 ? (
              <Box className="category-info-grid-inner">
                {categoryInfoEntries.map(([key, value]) => (
                  <Box key={key} className="category-info-card">
                    <Box component="span" className="category-info-inline">
                      <Box component="span" className="category-info-key">
                        {key}
                      </Box>
                      <Box component="span" className="category-info-value">
                        {key === "Dataset Location" ? (
                          <a
                            className="category-info-link"
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {value}
                          </a>
                        ) : key === "Merged_into_CMID" ? (
                          <a className="category-info-link" href={`/${database.toLowerCase()}/${value}`}>
                            {value}
                          </a>
                        ) : (
                          value
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography sx={{ color: "black", fontSize: "1rem", p: 1 }}>No data</Typography>
            )}
          </Box>
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
        </Box>
        <Box
          sx={{
            marginLeft: "10px",
            marginTop: 2,
          }}
        >
          {/* Render tabs here--first check for DATASET view, otherwise use CATEGORY view */}
          {isDatasetLike ? (
            <React.Fragment>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  sx={{ maxHeight: 700 }}
                  value={value}
                  onChange={handleChange}
                  aria-label="tab layout"
                >
                  {hasNetworkTab && <Tab label="Network Explorer" value="network" {...a11yProps("network")} />}
                  {hasDatasetMapTab && <Tab label="Map" value="map" {...a11yProps("map")} />}
                  {hasDatasetCategoriesTab && <Tab label="Categories" value="categories" {...a11yProps("categories")} />}
                  {showMergingTemplateTabWithData && (
                    <Tab label="Merging Template" value="merging-template" {...a11yProps("merging-template")} />
                  )}
                </Tabs>
              </Box>

              {hasNetworkTab && (
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
                    onNodeNavigateStart={handleNodeNavigateStart}
                  />
                </CustomTabPanel>
              )}

              {hasDatasetMapTab && (
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
              )}

              {hasDatasetCategoriesTab && (
                <CustomTabPanel value={value} index={"categories"}>
                  {/* Show loading bar if background data is loading */}
                  {loadingBackground && <LinearProgress sx={{ marginBottom: 2 }} />}
                  <CategoriesTable categories={categories} childcategories={childcategories} rememberChoice={rememberChoice} normalized={normalizedRef.current} />
                </CustomTabPanel>
              )}
              {showMergingTemplateTabWithData && (
                <CustomTabPanel value={value} index={"merging-template"}>
                  {loadingMergeTemplateSummary && <LinearProgress sx={{ marginBottom: 2 }} />}
                  {!loadingMergeTemplateSummary && !mergeTemplateSummary && (
                    <p>No merging template summary available.</p>
                  )}

                  {!loadingMergeTemplateSummary && mergeTemplateSummary?.nodeType === "MERGING" && (
                    <Box>
                      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        <Button variant="contained" onClick={() => downloadMergingTemplateTies("merging")}>
                          Download Merging Ties
                        </Button>
                        <Button variant="contained" onClick={() => downloadMergingTemplateTies("equivalence")}>
                          Download Equivalence Ties
                        </Button>
                      </Box>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Stack CMID</TableCell>
                              <TableCell>Stack CMName</TableCell>
                              <TableCell># of Datasets</TableCell>
                              <TableCell># of Equivalence Ties</TableCell>
                              <TableCell># of Key Reassignment</TableCell>
                              <TableCell># of Variables</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(mergeTemplateSummary.stackSummary || []).map((row) => (
                              <TableRow key={row.stackID}>
                                <TableCell>
                                  <Button
                                    size="small"
                                    variant="text"
                                    sx={{ p: 0, minWidth: 0 }}
                                    onClick={() => goToCmidInfo(row.stackID)}
                                  >
                                    {row.stackID}
                                  </Button>
                                </TableCell>
                                <TableCell>{row.stackCMName || ""}</TableCell>
                                <TableCell>{row.datasetCount || 0}</TableCell>
                                <TableCell>{row.equivalenceTieCount || 0}</TableCell>
                                <TableCell>{row.keyReassignmentCount || 0}</TableCell>
                                <TableCell>{row.variableCount || 0}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                              <TableCell />
                              <TableCell sx={{ fontWeight: 700 }}>{mergeTemplateSummary.stackSummaryTotals?.datasetCount || 0}</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>{mergeTemplateSummary.stackSummaryTotals?.equivalenceTieCount || 0}</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>{mergeTemplateSummary.stackSummaryTotals?.keyReassignmentCount || 0}</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>{mergeTemplateSummary.stackSummaryTotals?.variableCount || 0}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}

                  {!loadingMergeTemplateSummary && mergeTemplateSummary?.nodeType === "STACK" && (
                    <Box>
                      <Typography sx={{ fontWeight: 700, mb: 1 }}>
                        # of Merging Templates using this Stack: {mergeTemplateSummary.mergingTemplateCount || 0}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        <Button variant="contained" onClick={() => downloadMergingTemplateTies("merging")}>
                          Download Merging Ties
                        </Button>
                        <Button variant="contained" onClick={() => downloadMergingTemplateTies("equivalence")}>
                          Download Equivalence Ties
                        </Button>
                      </Box>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Dataset CMID</TableCell>
                              <TableCell>Dataset CMName</TableCell>
                              <TableCell># of Equivalence Ties</TableCell>
                              <TableCell># of Key Reassignment</TableCell>
                              <TableCell># of Variables</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(mergeTemplateSummary.datasetSummary || []).map((row) => (
                              <TableRow key={row.datasetID}>
                                <TableCell>
                                  <Button
                                    size="small"
                                    variant="text"
                                    sx={{ p: 0, minWidth: 0 }}
                                    onClick={() => goToCmidInfo(row.datasetID)}
                                  >
                                    {row.datasetID}
                                  </Button>
                                </TableCell>
                                <TableCell>{row.datasetCMName || ""}</TableCell>
                                <TableCell>{row.equivalenceTieCount || 0}</TableCell>
                                <TableCell>{row.keyReassignmentCount || 0}</TableCell>
                                <TableCell>{row.variableCount || 0}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </CustomTabPanel>
              )}
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
                  {hasNetworkTab && <Tab label="Network Explorer" value="network" {...a11yProps("network")} />}
                  {hasCategoryMapTab && <Tab label="Map" value="map" {...a11yProps("map")} />}
                  {hasCategoryTimespanTab && <Tab label="Timespan" value="timespan" {...a11yProps("timespan")} />}
                  {hasCategoryDatasetsTab && <Tab label="Datasets" value="datasets" {...a11yProps("datasets")} />}
                  {hasCategoryCategoriesTab ? (
                    <Tab label="Categories" value="categories" {...a11yProps("categories")} />
                  ) : null}
                </Tabs>
              </Box>
              {hasNetworkTab && (
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
                    onNodeNavigateStart={handleNodeNavigateStart}
                  />
                </CustomTabPanel>
              )}
              {hasCategoryMapTab && (
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
              )}
              {hasCategoryTimespanTab && (
                <CustomTabPanel value={value} index={"timespan"}>
                  <TimespanTable data={usert} />
                </CustomTabPanel>
              )}
              {hasCategoryDatasetsTab && (
                <CustomTabPanel value={value} index={"datasets"}>
                  <ClickTable usert={usert} />
                </CustomTabPanel>
              )}
              {hasCategoryCategoriesTab && (
                <CustomTabPanel value={value} index={"categories"}>
                  <CategoriesTable categories={categories} />
                </CustomTabPanel>
              )}
            </React.Fragment>
          )}
        </Box>
        <Snackbar
          open={bookmarkNotice.open}
          autoHideDuration={3000}
          onClose={() => setBookmarkNotice((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity={bookmarkNotice.severity} variant="filled">
            {bookmarkNotice.message}
          </Alert>
        </Snackbar>
        <Dialog open={redirectPrompt.open} onClose={handleCloseRedirectPrompt}>
          <DialogTitle>Deleted Node Redirected</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              Redirected from deleted CMID {redirectPrompt.from} to {redirectPrompt.to} via IS relationship.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              You can close this message or stay on the deleted node page.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRedirectPrompt}>Close</Button>
            <Button variant="contained" onClick={handleStayOnDeletedPage}>
              Stay On Deleted Page
            </Button>
          </DialogActions>
        </Dialog>
      </div >
    );
  } catch (error) {
    alert(error);
  }
}
