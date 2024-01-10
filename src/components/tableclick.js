import { useState, useEffect,useRef } from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ClickTable from './tableclickview';
import { FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import Neo4jGraph from './neocomp';
import './tableclick.css'


import neo4j, { session } from 'neo4j-driver';
import { select } from 'd3';

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
 
  const [flag, setflag] = useState('');
  const [nodes, setNodes] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [propnode, setpropnode] = useState([]);
  const [proprel, setproprel] = useState([]);
  const [labels, setlabels] = useState([]);
  const [temp, settemp] = useState({});
  const [filldrop, setfilldrop] = useState({});
  const [selectedValues, setSelectedValues] = useState([]);
  const domains = [];
  let name = [];
  let names = ({}); 
  const nodesMap = new Map();
  const newrelationships = [];

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
            })
    }, [])

    const onEachFeature = (feature, layer) => {
      // Bind popup or tooltip here
      {console.log(feature)}
      layer.bindTooltip(`Source: ${feature.source}`, { permanent: false, direction: 'top' });
    };
  

  const handleFirstDropdownChange = async (event) => {
    const value = event.target.value
    const driver = neo4j.driver('bolt://sociomap.rc.asu.edu:7687', neo4j.auth.basic('neo4j', '[REDACTED]'));
    const session = driver.session();

    try {
      const result = await session.run("MATCH (n:" + label + " {CMID:'" + props.socioid.socioid + "'})-[r:" + value + "]-(OtherNodes) RETURN n,r,OtherNodes")

      //  session.run("match (a) where a.CMID = '"+d.CMID+"' return labels(a)")
      result.records.forEach((record) => {
        domains.push(record.get("n").labels[record.get("n").labels.length - 1])
        domains.push(record.get("OtherNodes").labels[record.get("OtherNodes").labels.length - 1])
      });

      setlabels([...new Set(domains)])
      setFirstDropdownValue(value)
      name.push("All")
      names["All"] = ["All"]

      result.records.forEach((record) => {
        const source1 = record.get('n').properties;
        const source = Object.assign({}, source1, { label: record.get('n').labels })
        source.label = source.label[source.label.length - 1]
        const target1 = record.get('OtherNodes').properties;
        const target = Object.assign({}, target1, { label: record.get('OtherNodes').labels })
        target.label = target.label[target.label.length - 1]
        name.push(target.CMName)
        names[target.CMName] = [target.CMName, target.label]

        nodesMap.set(source.CMName, source);
        nodesMap.set(target.CMName, target);

        newrelationships.push({
          source: source.CMName,
          target: target.CMName,
          label: target.label
        });

      });

      const newnodes = Array.from(nodesMap.values());
      setNodes(newnodes);
      setRelationships(newrelationships);
      setpropnode(newnodes);
      setproprel(newrelationships);
      setfilldrop(name)
      settemp(names);
      setflag(value);
    }
    catch (error) {
      console.error('Error running Neo4j query:', error);
    }
    finally {
      session.close();
      driver.close();
    }
  }

  useEffect(() => {
    setSelectedValues(labels)
  }, [firstDropdownValue])

  useEffect(() => {   if (flag !== '') {
    const filteredObject = Object.values(temp).filter((value) => selectedValues.includes(value[1])).map(value=>value[0])
    filteredObject.push("All")
    setfilldrop(filteredObject)
    let filterednodes =  [...nodes]
    let filrelationships =  [...relationships]
    filterednodes = nodes.filter((node) =>selectedValues.includes(node.label))
    filrelationships =  relationships.filter((link) => selectedValues.includes(link.label))
    setpropnode(filterednodes)
    setproprel(filrelationships)
  }}
    , [selectedValues])

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  try {
    return (
      <div style={{ backgroundColor: 'white', width: "100%", height: 1100, color: "black" }}>
        <Box sx={{ width: '100%', height: "25%", backgroundImage: `linear-gradient(60deg, #29323c 0%, #485563 100%)` }}>
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
              {mapt.length !== 0 ? <MapContainer 
                center={[0,0]}
                zoom="5"
                scrollWheelZoom={true}
                style={{ height: "80vh" }}>
                <GeoJSON  data={mapt} style={{ color: "red" }} onEachFeature={onEachFeature} />
                {(points.length !== 0)  ? (points.map((point) => (
        <Marker position={point.cood}>
            {console.log(point.cood)}
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
                  onChange={handleFirstDropdownChange}
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
                  onChange={(event) => setSelectedValues(event.target.value)}
                  label="Select Multiple Items"
                  sx={{ m: 1, width: 300 }}
                >
                  {labels.map((option) => (
                    <MenuItem value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <div style={{ width: '100%', height: '600px' }}>
                {/* {firstDropdownValue !== '' &&<Neo4jGraph p2 = {firstDropdownValue} key={firstDropdownValue} p0 = {label} p1 = {props.socioid.socioid}  />} */}
                {flag === firstDropdownValue && <Neo4jGraph n={propnode} key={firstDropdownValue} r={proprel} l={labels} f={filldrop} id={props.socioid.socioid} />}
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