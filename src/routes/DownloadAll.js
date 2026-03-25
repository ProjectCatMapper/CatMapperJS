import React, { useEffect, useState } from 'react';
import Navbar from '../components/NavbarHome';
import FooterLinks from '../components/FooterLinks';
import {
  Tabs,
  Tab,
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Link,
  CircularProgress,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './../components/Funding.css';

const theme = createTheme({
  typography: {
    fontFamily:
      'Source Sans Pro, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol',
  },
});

const DownloadAll = () => {
  const [urls, setUrls] = useState({ ArchaMap: [], SocioMap: [] });
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0); // ✅ added tab index state

  const handleChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const fetchData = async (db) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/CSVURLs/${db}?mostRecent=False`);
    const data = await response.json();

    const files = Array.isArray(data.urls)
      ? data.urls.map(([url, size]) => ({ url, size }))
      : [];

    return files.sort((a, b) => {
      const dateA = new Date(a.url.match(/\d{4}-\d{2}-\d{2}/)?.[0] || 0);
      const dateB = new Date(b.url.match(/\d{4}-\d{2}-\d{2}/)?.[0] || 0);
      return dateB - dateA;
    });
  };
  useEffect(() => {
    const loadData = async () => {
      const [archamap, sociomap] = await Promise.all([
        fetchData('ArchaMap'),
        fetchData('SocioMap'),
      ]);
      setUrls({ ArchaMap: archamap, SocioMap: sociomap });
      setLoading(false);
    };
    loadData();
  }, []);

  const renderList = (items) =>
    items.length === 0 ? (
      <Typography variant="body2">No files available.</Typography>
    ) : (
      <List>
        {items.map(({ url, size }) => {
          const filename = url.split('/').pop();
          return (
            <ListItem key={url}>
              <ListItemText
                primary={
                  <Link href={url} target="_blank" rel="noopener noreferrer">
                    {filename}
                  </Link>
                }
                secondary={`${size.toFixed(2)} MB`}
              />
            </ListItem>
          );
        })}
      </List>
    );


  return (
    <>
      <div style={{ backgroundColor: 'white' }}>
        <Navbar />
        <ThemeProvider theme={theme}>
          <Container
            maxWidth="md"
            style={{
              minHeight: '80vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Paper elevation={1} style={{ padding: '2em', width: '100%' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Download Datasets
              </Typography>

              <Typography variant="body1" paragraph>
                This page contains all weekly backups of the key elements of the database:
              </Typography>

              <Typography variant="body1" component="div">
                <ol style={{ paddingLeft: '1.25rem' }}>
                  <li>
                    Metadata for each dataset which has categories linked to CatMapper (datasetNodes_{"{date}"}.csv)
                  </li>
                  <li>
                    Metadata for each category stored in CatMapper (categoryNodes_{"{date}"}.csv)
                  </li>
                  <li>
                    USES ties containing metadata about how datasets refer to each category (USESties_{"{date}"}.csv)
                  </li>
                  <li>
                    Metadata for deleted nodes (deletedNodes_{"{date}"}.csv)
                  </li>
                  <li>
                    Metadata for domains and properties which includes database schema (metadata_{"{date}"}.csv)
                  </li>
                </ol>
              </Typography>

              <Typography variant="body1" paragraph>
                If you are interested in using an API to access this information, please visit{' '}
                <Link href="https://catmapper.org/help/api-guide" target="_blank" rel="noopener">
                  this link
                </Link>.
              </Typography>

              <Typography variant="body1" paragraph>
                For custom downloads (e.g., metadata for all ETHNICITY categories), the search page provides a <strong><em>download search results</em></strong> button.
              </Typography>

              {/* Tabs */}
              <Box sx={{ mt: 4 }}>
                <Tabs value={tabIndex} onChange={handleChange} aria-label="Download Tabs">
                  <Tab label="ArchaMap" />
                  <Tab label="SocioMap" />
                </Tabs>

                <Box sx={{ mt: 2 }}>
                  {tabIndex === 0 && (
                    <>
                      <Typography variant="h5" component="h2" gutterBottom>
                        ArchaMap
                      </Typography>
                      {loading ? <CircularProgress /> : renderList(urls.ArchaMap)}
                    </>
                  )}
                  {tabIndex === 1 && (
                    <>
                      <Typography variant="h5" component="h2" gutterBottom>
                        SocioMap
                      </Typography>
                      {loading ? <CircularProgress /> : renderList(urls.SocioMap)}
                    </>
                  )}
                </Box>
              </Box>
            </Paper>
          </Container>
        </ThemeProvider>
      </div>
      <FooterLinks />
    </>
  );
};

export default DownloadAll;
