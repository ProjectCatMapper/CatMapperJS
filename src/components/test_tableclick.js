import React, { useState, useEffect} from "react";

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
  MenuItem,
  Select,
  Tab,
  Tabs,
  Typography,
  Tooltip as MuiTool,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

import PropTypes from "prop-types";
import * as XLSX from "xlsx";

import CategoriesTable from "./categories_table";
import ClickTable from "./tableclickview";
import LoadingSpinner from "./LoadingSpinner";
import Neo4jVisualization from "./visnet";
import TimespanTable from "./timespantable";
import MapComponent from './Map_component';

import image from "../assets/white.png";

import "./tableclick.css";
import "./LoadingSpinner.css";


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

export default function Tableclick(props) {
  const [value, setValue] = useState(Number(props.cmid.tabval) || 0);
  const [usert, setUsert] = useState([]);
  const [mapt, setMapt] = useState([]);
  const [rev, setrev] = useState([]);
  const [categories, setCategories] = useState([]);
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
  const [originaldata, setoriginaldata] = useState(null);
  const [visData, setVisData] = useState(null);
  const [domains, setdomains] = useState([]);
  const [sources, setsources] = useState([]);
  const orderOfProperties = [
    "CONTAINS",
    "DISTRICT_OF",
    "LANGUOID_OF",
    "RELIGION_OF",
    "PERIOD_OF",
    "CULTURE_OF",
    "POLITY_OF",
    "USES",
  ];
  const [datasetdomainValue, setdatasetdomainValue] = useState([]);
  const [datasetdropdown, setDatasetDropdown] = useState(["ANY DOMAIN"]);
  const [rememberChoice, setRememberChoice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [badsources, setbadsources] = useState([]);

  const [open, setOpen] = useState(false);

  let database = "SocioMap";

  if (useLocation().pathname.includes("archamap")) {
    database = "ArchaMap";
  }

  // dialog box for bad sources
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (datasetdropdown.length > 0) {
      setdatasetdomainValue([datasetdropdown[0]]);
    }
  }, [datasetdropdown]);

  const datasetDropdownChange = (event) => {
    setdatasetdomainValue(event.target.value);
  };

  const generateTooltipContent = (properties) => {
    return Object.entries(properties).map(
      ([key, value]) => `${key}: ${value}\n`
    );
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
      "ADM4",
      "ADM3",
      "ADM2",
      "ADM1",
      "ADM0",
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
  "SITE": "#FFFFFF", // white
  "ADM4": "#a9a9a9", // dark gray
  "ADM3": "#1f77b4", // medium blue
  "ADM2": "#ff7f0e", // bright orange
  "ADM1": "#2ca02c", // bright green
  "ADM0": "#d62728", // crimson
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
    fetch(
      `${process.env.REACT_APP_API_URL}/category?cmid=` +
        props.cmid.cmid +
        "&database=" +
        database,
      //fetch("http://127.0.0.1:5001/category?cmid=" + props.cmid.cmid + "&database="+ database,
      {
        method: "GET",
      }
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setUsert(data.samples);
        setCategories(data.categories);
        setMapt(data.polygons);
        setrev(data.info);
        setPoints(data.points);
        setDatasetPoints(data.datasetpoints);
        setfdrop(data.relnames);
        console.log(data.relnames)
        setbadsources(data.badsources);
        setOpen(Boolean(data.badsources?.length));

        const maptFeatures = data.polygons?.features?.length
          ? data.polygons.features
          : data.polygons;

        const pointsToUse = data.datasetpoints && data.datasetpoints.length > 0 ? data.datasetpoints : data.points;
        

        const uniqueSources = [
          ...new Set([
            ...pointsToUse.map((point) => point.source),
            ...(maptFeatures.features
              ? maptFeatures.features.map((feature) => feature.source)
              : maptFeatures.map((feature) => feature.source)),
          ]),
        ];

        setsources(uniqueSources);
      });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/datasetDomains`,
          {
            //const response = await fetch("http://127.0.0.1:5001/datasetDomains", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cmid: props.cmid.cmid,
              database: database,
              children: rememberChoice,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();
        setDatasetDropdown(["ANY DOMAIN", ...result.map((item) => item.label)]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [rememberChoice]);

  const datasetButtonClick = async (event) => {
    setLoading(true);
    const adjustedDomain = datasetdomainValue.includes("ANY DOMAIN")
      ? ["CATEGORY"]
      : datasetdomainValue;
    try {
      let response;
      if (Array.isArray(datasetdomainValue) && datasetdomainValue.length > 1) {
        response = await fetch(`${process.env.REACT_APP_API_URL}/dataset`, {
          // response = await fetch("http://127.0.0.1:5001/dataset", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cmid: props.cmid.cmid,
            database: database,
            domain: adjustedDomain,
            children: rememberChoice,
          }),
        });
      } else {
        // response = await fetch("http://127.0.0.1:5001/dataset?cmid=" + props.cmid.cmid + "&database=" +database+ "&domain=" + datasetdomainValue+ "&children=" + rememberChoice,{method: "GET"})
        response = await fetch(
          `${process.env.REACT_APP_API_URL}/dataset?cmid=` +
            props.cmid.cmid +
            "&database=" +
            database +
            "&domain=" +
            adjustedDomain +
            "&children=" +
            rememberChoice,
          { method: "GET" }
        );
      }

      const result = await response.json();

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
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogsDownload = async () => {
  try {
    const response = await fetch(`https://catmapper.org/api/logs/${encodeURIComponent(database)}/${encodeURIComponent(props.cmid.cmid)}`,
        { method: "GET"}
      );

    if (!response.ok) throw new Error("Failed to download file.");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `logs_${props.cmid.cmid}.txt`);
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Failed to download file.");
  }
};


  const fetchData = async (event) => {
    try {
      //const response = await fetch("http://127.0.0.1:5001/networksjs?cmid=" + props.cmid.cmid + "&database=" +database+ "&relation=" + event.target.value + "&response=records");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/networksjs?cmid=` +
          props.cmid.cmid +
          "&database=" +
          database +
          "&relation=" +
          event.target.value +
          "&response=records"
      );
      const result = await response.json();

      const node = [
        ...Object.entries(result["node"]),
        ...Object.entries(result["relNodes"]),
      ].map((node) => ({
        id: node["1"].id, // Adjust this based on your node structure
        label: node["1"].CMName, // Adjust this based on your node structure
        domain: node["1"].labels,
        CMID: node["1"].CMID,
        tooltipcon: generateTooltipContent(node["1"]),
        color: getColorBasedOnValue(node["1"].labels),
      }));

      const nodes = Array.from(new Set(node.map(JSON.stringify))).map(
        JSON.parse
      );

      const edges = Object.entries(result["relations"]).map((relationship) => {
        const { start_node_id, end_node_id, ...rest } = relationship["1"];
        return {
          from: start_node_id,
          to: end_node_id,
          ...rest,
          color: "black",
        };
      });

      let domains = nodes.map((object) => object.domain).slice(1);
      domains = Array.from(new Set(domains.flat())).filter(
        (value) => value !== "CATEGORY"
      );
      domains = Array.from(new Set(domains.flat())).filter(
        (value) => value !== "DISTRICT"
      );
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
        !props.cmid.cmid.startsWith("SD") &&
        !props.cmid.cmid.startsWith("AD")
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
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const updateData = (event) => {
    const nodes = originaldata["nodes"].filter((item, index) => {
      if (index === 0) {
        return true;
      }
      return item.domain.some((tag) => event.target.value.includes(tag));
    });
    const edges = originaldata["edges"];
    let nodevalues = nodes
      .map((object) => object.label)
      .slice(1)
      .sort();
    nodevalues.unshift("All");
    setSelectedNodes([...nodevalues]);
    setVisData({ nodes, edges });
    setSelectedValues(event.target.value);
  };

  const updateNodeData = (event) => {
    if (event.target.value === "All") {
      setVisData(originaldata);
    } else {
      const nodes = originaldata["nodes"].filter((item, index) => {
        if (index === 0) {
          return true;
        }
        if (item.label === event.target.value) {
          return item;
        }
      });
      const edges = originaldata["edges"];
      setVisData({ nodes, edges });
    }
    setThirdDropdownValue(event.target.value);
  };

  const updateDatasetNodeData = (event) => {
    if (event.target.value === "All") {
      setVisData(originaldata);
    } else {
      const edges = originaldata["edges"].filter((edge) =>
        edge.referenceKey?.some((key) => key.includes(event.target.value))
      );

      const nodeIds = new Set(edges.flatMap((edge) => [edge.from, edge.to]));

      const nodes = originaldata["nodes"].filter(
        (node, index) => index === 0 || nodeIds.has(node.id)
      );
      setVisData({ nodes, edges });
    }
    setFourthDropdownValue(event.target.value);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const ordered = orderOfProperties.filter((prop) => fdrop.includes(prop));
    setOrderedProperties(ordered);

    if (ordered.length > 0) {
      setFirstDropdownValue(ordered[0]);
      fetchData({ target: { value: ordered[0] } });
    }
  }, [fdrop]);

  const [boxHeight, setBoxHeight] = useState("auto");

  useEffect(() => {
    const contentHeight = document.getElementById("content").offsetHeight;
    setBoxHeight(contentHeight + "px");
  }, [rev]);

  const handleDatasetCheckbox = () => {
    setRememberChoice((prev) => !prev);
  };

  try {
    return (
      <div
        style={{
          backgroundColor: "white",
          width: "100%",
          height: "auto",
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
            {rev.length !== 0
              ? Object.entries(rev).map(
                  ([key, value]) =>
                    value && (
                      <li key={key}>
                        <strong>{key}:</strong>{" "}
                        {key === "Dataset Location" ? (
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Box
                              component="span"
                              sx={{
                                color: "blue",
                                textDecoration: "underline",
                              }}
                            >
                              {value}
                            </Box>
                          </a>
                        ) : (
                          value
                        )}
                      </li>
                    )
                )
              : rev}
          </ul>
          {(props.cmid.cmid.startsWith("SD") ||
            props.cmid.cmid.startsWith("AD")) && (
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
              <Select
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
              </Select>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "black",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "green",
                  },
                  marginLeft: 2,
                  width: 250,
                  fontSize: 12,
                  marginBottom: 2,
                }}
                onClick={datasetButtonClick}
              >
                Download Dataset Relationships
              </Button>
              {loading && <LoadingSpinner />}
              <FormControlLabel
                sx={{ marginLeft: 2, marginBottom: 2 }}
                control={<Checkbox />}
                onChange={handleDatasetCheckbox}
                label="Download connected datasets?"
              />
            </Box>
          )}
          <Button
              variant="outlined"
              onClick={handleLogsDownload}
              sx={{
                marginLeft: "auto",
                marginRight: 2,
                marginBottom: 2,
                fontSize: 12,
                color: "#000",
                borderColor: "#00BFFF",
                background: "linear-gradient(135deg, rgba(0,191,255,0.1), rgba(255,255,255,0.05))",
                backdropFilter: "blur(4px)",
                boxShadow: "0 0 8px rgba(0,191,255,0.5)",
                textTransform: "uppercase",
                fontWeight: 600,
                letterSpacing: 1,
                transition: "0.3s ease-in-out",
                "&:hover": {
                  backgroundColor: "#00BFFF",
                  color: "#000",
                  boxShadow: "0 0 12px rgba(0,191,255,0.8)",
                  borderColor: "#00BFFF",
                },
              }}
            >
              Download Logs
            </Button>
        </Box>
        <Box
          sx={{
            height: "auto",
            position: "relative",
            left: "10px",
            top: boxHeight + 100,
          }}
        >
          {props.cmid.cmid.startsWith("SD") ||
          props.cmid.cmid.startsWith("AD") ? (
            <React.Fragment>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  sx={{ maxHeight: 700 }}
                  value={value}
                  onChange={handleChange}
                  aria-label="basic tabs example"
                >
                  <Tab label="Network Explorer" {...a11yProps(0)} />
                  <Tab label="Map" {...a11yProps(1)} />
                  {categories.length !== 0 ? (
                    <Tab label="Categories" {...a11yProps(2)} />
                  ) : null}
                </Tabs>
              </Box>

              <CustomTabPanel value={value} index={1}>
                <div
                  style={{
                    position: "relative",
                    top: "10",
                    left: "200",
                    width: "95%",
                    height: "60vh",
                  }}
                >
                  {mapt.length !== 0 || datasetpoints.length !== 0 ? (
                    <MapComponent points={datasetpoints} mapt={mapt} sources={sources}/>
                  ) : (
                    <p>No map available for this dataset.</p>
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
              <CustomTabPanel value={value} index={0}>
                <div>
                  <FormControl sx={{ m: 1, width: 300 }}>
                    <InputLabel htmlFor="first-dropdown">
                      Relationship
                    </InputLabel>
                    <Select
                      label="First Dropdown"
                      value={firstDropdownValue}
                      onChange={fetchData}
                    >
                      {orderedProperties.map((property) => (
                        <MenuItem key={property} value={property}>
                          {property}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ m: 1, width: 300 }}>
                    <InputLabel htmlFor="second-dropdown">Domain</InputLabel>
                    <Select
                      multiple
                      value={selectedValues}
                      onChange={updateData}
                      label="Select Multiple Items"
                    >
                      {domains &&
                        domains.map((option) => (
                          <MenuItem value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ m: 1, width: 300 }}>
                    <InputLabel htmlFor="third-dropdown">Nodes</InputLabel>
                    <Select
                      label="Third Dropdown"
                      value={thirdDropdownValue}
                      onChange={updateNodeData}
                    >
                      {selectedNodes.map((option) => (
                        <MenuItem value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <div style={{ width: "100%", height: "500px" }}>
                    {visData && <Neo4jVisualization visData={visData} />}
                  </div>
                </div>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={2}>
                <CategoriesTable categories={categories} />
              </CustomTabPanel>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  sx={{ maxHeight: 700 }}
                  value={value}
                  onChange={handleChange}
                  aria-label="basic tabs example"
                >
                  <Tab label="Network Explorer" {...a11yProps(0)} />
                  <Tab label="Map" {...a11yProps(1)} />
                  <Tab label="Timespan" {...a11yProps(2)} />
                  <Tab label="Datasets" {...a11yProps(3)} />
                  {categories.length !== 0 ? (
                    <Tab label="Categories" {...a11yProps(4)} />
                  ) : null}
                </Tabs>
              </Box>
              <CustomTabPanel value={value} index={3}>
                <ClickTable usert={usert} />
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
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
                    <MapComponent points={points} mapt={mapt} sources={sources}/>
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
              <CustomTabPanel value={value} index={0}>
                <div>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Double click on node to move to that node's info page
                  </Typography>
                  <FormControl sx={{ m: 1, width: 300 }}>
                    <InputLabel htmlFor="first-dropdown">
                      Relationship
                    </InputLabel>
                    <Select
                      label="First Dropdown"
                      value={firstDropdownValue}
                      onChange={fetchData}
                    >
                      {orderedProperties.map((property) => (
                        <MenuItem key={property} value={property}>
                          {property}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ m: 1, width: 300 }}>
                    <InputLabel htmlFor="second-dropdown">Domain</InputLabel>
                    <Select
                      multiple
                      value={selectedValues}
                      onChange={updateData}
                      label="Select Multiple Items"
                    >
                      {domains &&
                        domains.map((option) => (
                          <MenuItem value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ m: 1, width: 300 }}>
                    <InputLabel htmlFor="third-dropdown">Nodes</InputLabel>
                    <Select
                      label="Third Dropdown"
                      value={thirdDropdownValue}
                      onChange={updateNodeData}
                    >
                      {selectedNodes.map((option) => (
                        <MenuItem value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {firstDropdownValue !== "USES" && (
                    <FormControl sx={{ m: 1, width: 300 }}>
                      <InputLabel htmlFor="fourth-dropdown">
                        Dataset Filter
                      </InputLabel>
                      <Select
                        label="Fourth Dropdown"
                        value={fourthDropdownValue}
                        onChange={updateDatasetNodeData}
                      >
                        {selectedDatasets.map((option) => (
                          <MenuItem value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  <div style={{ width: "100%", height: "500px" }}>
                    {visData && <Neo4jVisualization visData={visData} />}
                  </div>
                </div>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={2}>
                {usert ? (<TimespanTable data={usert} />) : (<p> No Timespan available for this category.</p>)}
              </CustomTabPanel>
              <CustomTabPanel value={value} index={4}>
                <CategoriesTable categories={categories} />
              </CustomTabPanel>
            </React.Fragment>
          )}
        </Box>
        <div
          style={{
            width: "100%",
            backgroundColor: "black",
            padding: "20px",
            position: "relative",
          }}
        >
          <Divider
            sx={{ marginLeft: 1, marginRight: 1, backgroundColor: "white" }}
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
          </Box>{" "}
        </div>
      </div>
    );
  } catch (error) {
    alert(error);
  }
}
