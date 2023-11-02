import {useState,useEffect} from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ClickTable from './tableclickview';
import { FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import Neo4jGraph from './neocomp';


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
    const [mapt, setMapt] = useState(['']);
    const [rev,setrev] = useState([])
    const [points, setPoints] = useState({});
    const [label,setlabel] = useState([]);
    const [fdrop,setfdrop] = useState([]);

    const [firstDropdownValue, setFirstDropdownValue] = useState(['']);
    const [secondDropdownValue, setSecondDropdownValue] = useState('');
    

    useEffect(() => {
        fetch("http://localhost:5001/category?value=" + props.socioid.socioid,
            {
                method: "GET"
            })
            .then(response => {
                return response.json()
            })
            .then(data => {
                setUsert(data.current_response)
                setMapt(data.future_response)
                setrev(data.center)
                setPoints(data.poid)
                setlabel(data.label)
                setfdrop(data.relnames)
            })
    }, [])

    const handleFirstDropdownChange = (event) => {
        setFirstDropdownValue(event.target.value);
      };
    
  const handleSecondDropdownChange = (event) => {
        setSecondDropdownValue(event.target.value);
      };

  const handleChange = (event, newValue) => {
      setValue(newValue);
  };

try{
    return (
        <div style={{ backgroundColor: 'white', width: "100%", height: 900, color: "black" }}>
            <Box sx={{ width: '20%', height: "100%", backgroundImage: `linear-gradient(60deg, #29323c 0%, #485563 100%)` }}>
                <h2 style={{ color: "black", position: "absolute", left: "70px", top: "120px" }}>Category Info</h2>
            </Box>
            <Box sx={{ width: '80%', position: "absolute", left: "400px", top: "100px" }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
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
                        {mapt !== "" || points.length !== undefined ?(
                        <MapContainer center={rev}
                            display="none"
                            zoom="5"
                            scrollWheelZoom={true}
                            style={{ height: "80vh" }}>
                        
                            <GeoJSON data={mapt} style={{ color: "red" }} />
                            {(points.length !== undefined)  ? (points.map((point) => (
        <Marker
          key={point.id}
          position={point.coordinates}
        >
          <Popup>{point.id}</Popup>
        </Marker>
      ))):{}}
                            <TileLayer
          url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

          attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
        />
                        </MapContainer>):(<p>No map available</p>)}
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
        <InputLabel htmlFor="second-dropdown">Nodes available</InputLabel>
        <Select
          label="Second Dropdown"
          value={secondDropdownValue}
          onChange={handleSecondDropdownChange}
        >
          <MenuItem value="optionA">Option A</MenuItem>
          <MenuItem value="optionB">Option B</MenuItem>
          <MenuItem value="optionC">Option C</MenuItem>
        </Select>
      </FormControl>
      <div style={{ width: '100%', height: '600px' }}>
      {firstDropdownValue !== "" &&
      <Neo4jGraph p2 = {firstDropdownValue} key={firstDropdownValue} p0 = {label} p1 = {props.socioid.socioid}  />}
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