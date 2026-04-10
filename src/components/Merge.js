import React, { useEffect, useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLocation, useNavigate } from 'react-router-dom';
import ProposeMerge from "./MergePropose"
import JoinDatasetsMerge from "./MergeJoinDatasets"
import MergeTemplate from "./MergeTemplate"
import FooterLinks from './FooterLinks';
import {
  DEFAULT_MERGE_TAB,
  getMergeTabIndex,
  getResolvedMergeTab,
  MERGE_TABS,
  shouldRedirectMergeTab,
} from '../utils/mergeTabSync';

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
        <Box sx={{ p: 3 }}>{children}</Box>
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

export default function Mergelayout({ database, tab }) {
  const [value, setValue] = useState(getMergeTabIndex(tab));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!database) return;

    const resolvedTab = getResolvedMergeTab(tab);
    const nextValue = getMergeTabIndex(resolvedTab);

    if (value !== nextValue) {
      setValue(nextValue);
    }

    if (shouldRedirectMergeTab(tab)) {
      navigate(
        {
          pathname: `/${database}/merge/${resolvedTab}`,
          search: location.search,
          hash: location.hash,
        },
        { replace: true }
      );
    }
  }, [database, tab, value, navigate, location.search, location.hash]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (database) {
      navigate(`/${database}/merge/${MERGE_TABS[newValue]?.key || DEFAULT_MERGE_TAB}`);
    }
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
