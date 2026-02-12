import { React, useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import ProposeMerge from "./MergePropose"
import JoinDatasetsMerge from "./MergeJoinDatasets"
import MergeTemplate from "./MergeTemplate"
import FooterLinks from './FooterLinks';

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
          <ProposeMerge database={database} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <JoinDatasetsMerge database={database} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <MergeTemplate database={database} />
        </TabPanel>
      </Box>
      <FooterLinks />
    </Box>
  );
}
