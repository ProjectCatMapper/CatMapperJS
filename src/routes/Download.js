import React, { useEffect, useState } from 'react';
import Navbar from '../components/footer_navbar';
import {
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
import './../components/funding.css';

const theme = createTheme({
  typography: {
    fontFamily:
      'Source Sans Pro, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol',
  },
});

const Download = () => {
  const [urls, setUrls] = useState({ ArchaMap: [], SocioMap: [] });
  const [loading, setLoading] = useState(true);

const fetchData = async (db) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/CSVURLs/${db}`);
  const data = await response.json();

  const urls = data.urls || [];

  return urls.sort((a, b) => {
    const dateA = new Date(a.match(/\d{4}-\d{2}-\d{2}/)?.[0] || 0);
    const dateB = new Date(b.match(/\d{4}-\d{2}-\d{2}/)?.[0] || 0);
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
        {items.map((url) => {
          const filename = url.split('/').pop();
          return (
            <ListItem key={url}>
              <ListItemText
                primary={
                  <Link href={url} target="_blank" rel="noopener noreferrer">
                    {filename}
                  </Link>
                }
              />
            </ListItem>
          );
        })}
      </List>
    );

  return (
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
          }}
        >
          <Paper elevation={1} style={{ padding: '2em', width: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Download Datasets
            </Typography>
            <Typography variant="body1" paragraph>
              The following datasets are available for download.
            </Typography>

            <Typography variant="h5" component="h2" gutterBottom>
              ArchaMap
            </Typography>
            {loading ? <CircularProgress /> : renderList(urls.ArchaMap)}

            <Typography variant="h5" component="h2" gutterBottom style={{ marginTop: '1.5em' }}>
              SocioMap
            </Typography>
            {loading ? <CircularProgress /> : renderList(urls.SocioMap)}
          </Paper>
        </Container>
      </ThemeProvider>
    </div>
  );
};

export default Download;
