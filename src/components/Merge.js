import { React, useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ backgroundColor: 'black', opacity: 1 }}>
      <Box
        sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}
      >
        <Tabs
          orientation={isMobile ? "horizontal" : "vertical"}
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Merge tabs"
          sx={{
            borderRight: isMobile ? 0 : 1,
            borderBottom: isMobile ? 1 : 0,
            borderColor: 'divider',
            minWidth: isMobile ? '100%' : 250
          }}
        >
          <Tab label="Propose merge" {...a11yProps(0)} sx={{ alignItems: isMobile ? 'center' : 'flex-end', justifyContent: 'center', textAlign: isMobile ? 'center' : 'right' }} />
          <Tab label="Join Datasets" {...a11yProps(1)} sx={{ alignItems: isMobile ? 'center' : 'flex-end', justifyContent: 'center', textAlign: isMobile ? 'center' : 'right' }} />
          <Tab label="Download merge template" {...a11yProps(2)} sx={{ alignItems: isMobile ? 'center' : 'flex-end', justifyContent: 'center', textAlign: isMobile ? 'center' : 'right' }} />
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
