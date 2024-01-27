import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ClickTable from './tableclickview';
import { FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import L from 'leaflet';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from "react-leaflet";
import './tableclick.css'
import Neo4jVisualization from './visnet';

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
  const [value, setValue] = useState(0);
  const [usert, setUsert] = useState([]);
  const [mapt, setMapt] = useState([]);
  const [rev, setrev] = useState([]);
  const [points, setPoints] = useState([]);
  const [label, setlabel] = useState([]);
  const [fdrop, setfdrop] = useState([]);
  const [firstDropdownValue, setFirstDropdownValue] = useState('');
  const [thirdDropdownValue, setThirdDropdownValue] = useState('All');
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [originaldata, setoriginaldata] = useState(null);
  const [visData, setVisData] = useState(null);
  const [domains, setdomains] = useState([]);
  const [sources, setsources] = useState([]);

  const generateTooltipContent = (properties) => {
    return Object.entries(properties).map(([key, value]) => `${key}: ${value}`).join('\n');  };

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
    fetch("https://catmapper.org/api/category?cmid=" + props.socioid.socioid + "&database=SocioMap",
        // fetch("http://127.0.0.1:5001/category?cmid=" + props.socioid.socioid + "&database=SocioMap",
            {
                method: "GET"
            })
            .then(response => {
                return response.json()
            })
            .then(data => {
                setUsert(data.samples)
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
          // const response = await fetch("http://127.0.0.1:5001/network?cmid=" + props.socioid.socioid +"&relation=" + event.target.value + "&value="+ label);
          const response = await fetch("https://catmapper.org/api/networks?cmid=" + props.socioid.socioid + "&database=SocioMap&relation=" + event.target.value + "&response=records");
          const result = await response.json();

          const node = [...Object.entries(result["node"]),...Object.entries(result["relNodes"])].map((node) => ({
            id: node["1"].id,  // Adjust this based on your node structure
            label: node["1"].CMName,  // Adjust this based on your node structure
            domain: node["1"].labels,
            CMID: node["1"].CMID,
            title: generateTooltipContent(node["1"]),
            color: getColorBasedOnValue(node["1"].labels),
          }));

          const nodes = Array.from(new Set(node.map(JSON.stringify))).map(JSON.parse);

          const edges = Object.entries(result["relations"]).map(relationship => ({
            from: relationship["1"].start_node_id,  // Adjust this based on your relationship structure
            to: relationship["1"].end_node_id,  // Adjust this based on your relationship structure
            color : "black",
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
          setVisData({ nodes, edges })
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
    
    console.log(colorMap)
  
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

  try {
    return (
      <div style={{ backgroundColor: 'white', width: "100%", height: 1100, color: "black" }}>
        <Box sx={{ width: '100%', height: "25%", backgroundImage: `linear-gradient(to right, #93a5cf, #e4efe9)` }}>
        {/* {console.log(mapt.coordinates[0][0][0])} */}
          <h2 style={{ color: "black", position: "absolute", left: "45%", top: "100px" }}>Category Info</h2>
          <ul style={{ color: "black", position: "absolute", left: "45%", top: "150px",fontSize: "large" }} >
        {(rev.length !== 0) ?
         Object.entries(rev).map(([key, value]) => value && (
          <li key={key}>
            <strong>{key}:</strong> {value}
          </li>
        )): rev}
      </ul>
        </Box>
        <Box sx={{ width: '100%', height: "auto" , position: "absolute", left: "10px", top: "360px" }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs sx={{ overflowY: "scroll", maxHeight: 700 }} value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="Samples" {...a11yProps(0)} />
              <Tab label="Map" {...a11yProps(1)} />
              <Tab label="Node Network" {...a11yProps(2)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <ClickTable usert={usert} />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <div style={{ position: "absolute", top: "10", left: "200", width: "95%", height: "50vh" }}>
              {mapt.length !== 0 ? 
              <MapContainer 
                center={[0,0]}
                zoom="5"
                scrollWheelZoom={true}
                style={{ height: "80vh" }}
                ref = {mapRef}>
                <SetViewToDataBounds points={points} polygons={mapt} />
                <GeoJSON  data={mapt} style={getFeatureStyle} onEachFeature={onEachFeature} />
                {(points.length !== 0)  ? (points.map((point) => (
        <Marker position={point.cood}>
          <Popup>{point.source}</Popup>
        </Marker>
      ))):points}
                <TileLayer url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                  attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors' />
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
                  {fdrop.map((option) => (
                    <MenuItem value={option}>
                      {option}
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
        </Box>
      </div>

    )
  } catch (error) {
    alert(error)
  }
}; 