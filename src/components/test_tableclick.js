import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ClickTable from './tableclickview';
import { FormControl, Select, MenuItem, InputLabel, recomposeColor } from '@mui/material';
import L from 'leaflet';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap,CircleMarker } from "react-leaflet";
import { useLocation } from 'react-router-dom';
import './tableclick.css'
import Neo4jVisualization from './visnet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import 'leaflet/dist/leaflet.css';
import '@changey/react-leaflet-markercluster/dist/styles.min.css';
import CategoriesTable from './categories_table';
import { Info } from '@mui/icons-material';

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
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function Tableclick(props) {
  const [value, setValue] = useState(Number(props.cmid.tabval) || 0);
  const [usert, setUsert] = useState([]);
  const [mapt, setMapt] = useState([]);
  const [rev, setrev] = useState([]);
  const [categories, setCategories] = useState([]);
  const [points, setPoints] = useState([]);
  const [label, setlabel] = useState([]);
  const [fdrop, setfdrop] = useState(["CONTAINS"]);
  const [firstDropdownValue, setFirstDropdownValue] = useState('');
  const [thirdDropdownValue, setThirdDropdownValue] = useState('All');
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [originaldata, setoriginaldata] = useState(null);
  const [visData, setVisData] = useState(null);
  const [domains, setdomains] = useState([]);
  const [sources, setsources] = useState([]);
  const orderOfProperties = ['CONTAINS', 'DISTRICT_OF', 'LANGUAGE_OF', 'LANGUOID_OF', 'RELIGION_OF', 'USES'];

  let database = "SocioMap"

  if (useLocation().pathname.includes("archamap")) {
    database = "ArchaMap"
  } 

  const generateTooltipContent = (properties) => {
    return Object.entries(properties).map(([key, value]) => `${key}: ${value}\n`);};

  const getColorBasedOnValue = (value) => {
    value  =  Array.from(new Set(value.flat())).filter((value) => value !== "CATEGORY")
    value  =  Array.from(new Set(value.flat())).filter((value) => value !== "DISTRICT")
    value = value.slice(-1)[0]
    if (value == "ADM0"){
      return "#4f8c9d"
    }
    if (value == "ADM1"){
      return "#5ce8ef"
    }
    if (value == "ADM2"){
      return "#0a4f4e"
    }
    if (value == "ADM3"){
      return "#6fef70"
    }if (value == "ADMD"){
      return "#15974d"
    }
    if (value == "ADME"){
      return "#c0e15c"
    }
    if (value == "ADML"){
      return "#738c4e"
    }
    if (value == "ADMX"){
      return "#96ccfe"
    }
    if (value == "DATASET"){
      return "#6b62a5"
    }
    if (value == "DIALECT"){
      return "#d16dbe"
    }
    if (value == "FAMILY"){
      return "#f3c5fa"
    }
    if (value == "LANGUAGE"){
      return "#941483"
    }
    if (value == "LANGUOID"){
      return "#f642d0"
    }
    if (value == "ETHNICITY"){
      return "#6439e5"
    }
    if (value == "RELIGION"){
      return "#e1c471"
    }
    };
  
  const mapRef = useRef();

  function SetViewToDataBounds({ points, polygons }) {
    const map = useMap();
  
    useEffect(() => {

      // Initialize an empty bounds object
      let bounds = new L.LatLngBounds();
  
      // Add polygons to the bounds if they exist
      if (polygons) {
        const polygonBounds = L.geoJSON(polygons).getBounds();
        bounds.extend(polygonBounds);
      }
      // Add points to the bounds if they exist
      if ( points && points?.length > 0) {
        points.forEach(point => {
          if (point.cood && point.cood.length === 2) {
            bounds.extend(L.latLng(point.cood));
          }
        });
      }
  
      // If bounds are valid, fit the map to these bounds
      if (bounds.isValid()) {
        map.fitBounds(bounds);
      }
    }, [points, polygons, map]);
  
    return null;
  }
  
  useEffect(() => {
    fetch("https://catmapper.org/api/category?cmid=" + props.cmid.cmid + "&database="+ database,
        // fetch("http://127.0.0.1:5001/category?cmid=" + props.cmid.cmid + "&database="+ database,
            {
                method: "GET"
            })
            .then(response => {
                return response.json()
            })
            .then(data => {
                setUsert(data.samples)
                setCategories(data.categories)
                setMapt(data.polygons)
                setrev(data.info)
                setPoints(data.points)
                setlabel(data.label)
                setfdrop(data.relnames)
                setsources(data.polysource)
            })
    },[])

    const fetchData = async (event) => {
        try {
          // const response = await fetch("http://127.0.0.1:5001/network?cmid=" + props.cmid.cmid +"&relation=" + event.target.value + "&value="+ label);
          // const response = await fetch("http://127.0.0.1:5001/networks?cmid=" + props.cmid.cmid + "&database=" +database+ "&relation=" + event.target.value + "&response=records");
          const response = await fetch("https://catmapper.org/api/networks?cmid=" + props.cmid.cmid + "&database=" +database+ "&relation=" + event.target.value + "&response=records");
          const result = await response.json();

          const node = [...Object.entries(result["node"]),...Object.entries(result["relNodes"])].map((node) => ({
            id: node["1"].id,  // Adjust this based on your node structure
            label: node["1"].CMName,  // Adjust this based on your node structure
            domain: node["1"].labels,
            CMID: node["1"].CMID,
            tooltipcon: generateTooltipContent(node["1"]),
            color: getColorBasedOnValue(node["1"].labels),
          }));

          const nodes = Array.from(new Set(node.map(JSON.stringify))).map(JSON.parse);

          const edges = Object.entries(result["relations"]).map(relationship => ({

            from: relationship["1"].start_node_id,
            to: relationship["1"].end_node_id,
            color : "black",
            eventDate: relationship["1"].eventDate,
            eventType: relationship["1"].eventType,
            refkey: relationship["1"].referenceKey,
          }));

          let domains = nodes.map((object) => object.domain).slice(1)
          domains  =  Array.from(new Set(domains.flat())).filter((value) => value !== "CATEGORY")
          domains  =  Array.from(new Set(domains.flat())).filter((value) => value !== "DISTRICT")
          setSelectedValues(domains)
          setdomains(domains)

          let nodevalues = nodes.map((object) => object.label).slice(1)
          nodevalues.unshift("All")
          setSelectedNodes([...nodevalues])
          
          setFirstDropdownValue(event.target.value)
          setoriginaldata({nodes,edges})
          setVisData({ nodes, edges, })
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

    const updateData = (event) => {
      const nodes = originaldata["nodes"].filter((item,index) => {  if (index === 0) {return true;} return item.domain.some((tag) => event.target.value.includes(tag));});
      const edges = originaldata['edges']
      setVisData({nodes, edges})
      setSelectedValues(event.target.value)
    };

    const updateNodeData = (event) => {
      if (event.target.value === "All")
      {
        setVisData(originaldata)
      }
      else{
      const nodes = originaldata["nodes"].filter((item,index) => {  if (index === 0) {return true;} if (item.label === event.target.value){return item}});
      const edges = originaldata['edges']
      setVisData({nodes, edges})
      }
      setThirdDropdownValue(event.target.value)
    };

    const onEachFeature = (feature, layer) => {
      // Bind popup or tooltip here
      layer.bindTooltip(`Source: ${feature.source}`, { permanent: false, direction: 'top' });
    };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getFeatureStyle = (feature) => {
    const category = feature.geometry.source;

    const colorMap = {};

    sources.forEach((value, index) => {
      const color = `#${(index * 100 + 255).toString(16).substring(0, 6)}`;
      colorMap[value] = color;
    });
    
  
    return {
      fillColor: colorMap[category] || 'gray',
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '0',
      fillOpacity: 0.3,
    };
  };

  useEffect(() => {fetchData({target: { value: fdrop[0]}})},[fdrop])

  const [boxHeight, setBoxHeight] = useState('auto');

  useEffect(() => {
    const contentHeight = document.getElementById('content').offsetHeight;
    setBoxHeight(contentHeight + 'px');
  }, [rev]);

  // const boxHeight = 100 + (Object.keys(rev).length * 14)

  try {
    return (
      <div style={{ backgroundColor: 'white', width: "100%", height: 1100, color: "black" }}>
        {/* <Box sx={{display:'flex',flexDirection:'column', width: '100%', backgroundImage: `linear-gradient(to right, #93a5cf, #e4efe9)`, backgroundSize:'cover' ,height: boxHeight}}>
        {console.log(mapt.coordinates[0][0][0])}
          <h2 style={{ color: "black", position: "absolute", left: "1%", top: "100px" }}>Category Info</h2>
        <ul style={{ color: "black", position: "absolute", left: "1%", top: "150px",fontSize: "large" }} >
        {(rev.length !== 0) ?
         Object.entries(rev).map(([key, value]) => value && (
          <li key={key}>
            <strong>{key}:</strong> {value}
          </li>
        )): rev}
      </ul>
        </Box> */}
        {console.log(usert)}
        <Box sx={{ display: 'grid', gridTemplateRows: '40px auto 20px', width: '100%', backgroundImage: `linear-gradient(to right, #93a5cf, #e4efe9)`, backgroundSize: 'cover' }}>
  <h2 style={{ color: "black", gridColumn: "1", gridRow: "1" }}>Category Info</h2>
  <ul id='content' style={{ color: "black", gridColumn: "1", gridRow: "2", fontSize: "large" }}>
    {(rev.length !== 0) ?
      Object.entries(rev).map(([key, value]) => value && (
        <li key={key}>
          <strong>{key}:</strong> {value}
        </li>
      )) : rev}
  </ul>
</Box>
        <Box sx={{ width: '100%', height: "auto" , position: "absolute", left: "10px", top: boxHeight + 100 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs sx={{ overflowY: "scroll", maxHeight: 700 }} value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="Samples" {...a11yProps(0)} />
              <Tab label="Map" {...a11yProps(1)} />
              <Tab label="Network Explorer" {...a11yProps(2)} />
              {categories.length !== 0 ? <Tab label="Categories" {...a11yProps(3)} /> : null}
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <ClickTable usert={usert} />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <div style={{ position: "absolute", top: "10", left: "200", width: "95%", height: "auto" }}>
              {mapt.length !== 0 || points.length!==0 ? 
              <MapContainer 
                center={[0,0]}
                zoom="5"
                scrollWheelZoom={true}
                style={{ height: 600 }}
                ref = {mapRef}>
                <SetViewToDataBounds points={points} polygons={mapt} />
                <GeoJSON  data={mapt} style={getFeatureStyle} onEachFeature={onEachFeature} />
                <TileLayer url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                  attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors' />
                  {points.length !== 0 ? (
            <MarkerClusterGroup>
              {points.map((point, index) => (
                <CircleMarker
                center={point.cood}
                radius={10} 
                color="red" 
                fillColor="red" 
                fillOpacity={0.5} 
              >
                <Popup>{point.source}</Popup>
              </CircleMarker>
                
              ))}
            </MarkerClusterGroup>
          ) : points}

              </MapContainer> : <p>No map</p>}
            </div>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            <div>
              <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel htmlFor="first-dropdown">Relationship</InputLabel>
                <Select
                  label="First Dropdown"
                  value={firstDropdownValue}
                  onChange={fetchData}
                >
                  {orderOfProperties.map((property) => (
        fdrop.includes(property) && (
          <MenuItem key={property} value={property}>
            {property}
          </MenuItem>
        )
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
                  {domains && domains.map((option) => (
                    <MenuItem value={option}>
                      {option}
                    </MenuItem>
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
                    <MenuItem value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <div style={{ width: '100%', height: '600px' }}>
              {visData && <Neo4jVisualization visData={visData}  />}
              </div>
            </div>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={3}>
          <CategoriesTable categories={categories} />
          </CustomTabPanel>
        </Box>
      </div>

    )
  } catch (error) {
    alert(error)
  }
}; 