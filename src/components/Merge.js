import { React, useState } from 'react';
import { Box, Tabs, Tab, Button, Typography, TextField } from '@mui/material';
import image from '../assets/catmapperWhite.png'
import { Link } from 'react-router-dom'
import Divider from '@mui/material/Divider';
import Propose_Merge from "./MergePropose"
import JoinDatasets_Merge from "./MergeJoinDatasets"
import Download_Merge from "./MergeDownload"

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
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

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function Mergelayout({ database }) {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ backgroundColor: 'black', opacity: 1 }}>
      <Box
        sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}
      >
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          sx={{ borderRight: 1, borderColor: 'divider', minWidth: 250 }}
        >
          <Tab label="Propose merge" {...a11yProps(0)} sx={{ alignItems: 'flex-end', justifyContent: 'center', textAlign: 'right' }} />
          <Tab label="Join Datasets" {...a11yProps(1)} sx={{ alignItems: 'flex-end', justifyContent: 'center', textAlign: 'right' }} />
          <Tab label="Download merge template" {...a11yProps(2)} sx={{ alignItems: 'flex-end', justifyContent: 'center', textAlign: 'right' }} />
        </Tabs>
        <TabPanel value={value} index={0}>
          <Propose_Merge database={database} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <JoinDatasets_Merge database={database} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Download_Merge database={database} />
        </TabPanel>
      </Box>
      <Divider sx={{ marginTop: 3, marginBottom: 7, marginLeft: 1, marginRight: 1, backgroundColor: 'white' }} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, mb: 0 }}>
        <img src={image} alt="CatMapper Logo" style={{ height: 80 }} />
        <Box>
          <Link id="catmapperfooter" to="/people" underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>People</Link>
          <Link to="/news" id="catmapperfooter" underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>News</Link>
          <Link to="/funding" id="catmapperfooter" underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Funding</Link>
          <Link to="/citation" id="catmapperfooter" underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Citation</Link>
          <Link to="/terms" id="catmapperfooter" underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Terms</Link>
          <Link to="/contact" id="catmapperfooter" underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Contact</Link>
          <Link to="/download" id="catmapperfooter" underline="none" style={{ color: "white", textDecoration: "none", margin: "0 8px" }}> Download</Link>
        </Box>
      </Box>
    </Box>
  );
}
