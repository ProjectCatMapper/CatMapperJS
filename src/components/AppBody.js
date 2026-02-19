import React from 'react'
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import './AppBody.css'
import FAQButton from "./FAQbutton";
import FooterLinks from "./FooterLinks";
import DownloadDatasetButton from './DownloadDatasetListButton';
import LiveMapCarousel from "./Carousel";

const descriptions = {
  archamap: ["ArchaMap is an open-source tool designed to aid in the integration of multiple complex data sets with different sources, data ontologies, and resolutions. ArchaMap is designed to save time, increase consistency, and document complex data merging processes among multiple sources. ",
    "This application stores and suggests past translations to build an ever-expanding list of associations to aid in connecting categorical data across different sources. ArchaMap uses previously uploaded categories to build a database of potential category names and includes contextual information to help users find the appropriate match."],
  sociomap: [
    "Explore: All users can search for basic contextual information—geographical location, population size, alternative names, and language—on categories of interest (e.g., Aymara ethnicity, Balochi language, Rajshahi district). They can also identify all datasets that contain specific social, demographic, cultural and economic data for categories of interest.",
    "Translate: All users can translate categories from new datasets to existing categories in SocioMap and download these translations. Registered users can store and document translations to assist in merging datasets for new analyses and to share with others. Please contact dhruschk@asu.edu if you would like to become a registered user.",
    "Merge (in development): Registered users can develop, document and share plans for merging data across diverse external datasets by ethnicity, language, religion, or political district. Once a merge plan is developed and saved, SocioMap will be able to generate code in common formats (R, SPSS, Stata, SAS), that will allow users to merge external datasets they have stored on their own computer for their custom analysis needs.",
    "Share (in development): All users can find and download all others users' past translations and merging plans to merge datasets they have stored on their own computer."
  ]
}

function createFoci(Focus, Datasets, Areas, Ethnicities, Languages, Religions) {
  return { Focus, Datasets, Areas, Ethnicities, Languages, Religions };
}

const AppBody = ({ database }) => {
  const paragraphs = descriptions[database] || ["Description not available."];
  const [rows, setrows] = useState([]);
  const [foci, setfoci] = useState([]);

  useEffect(() => {

    fetch(`${process.env.REACT_APP_API_URL}/progress/${database}`,
      {
        method: "GET"
      })
      .then(response => {
        return response.json()
      })
      .then(data => {
        setrows(data);
      })
      .catch(err => console.error("Failed to fetch progress", err));

  }, [database])

  useEffect(() => {
    if (database !== "sociomap") return;
    fetch(`${process.env.REACT_APP_API_URL}/foci?database=${database}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        const fociRows = data.map((item) =>
          createFoci(
            item.Focus || "",
            item.Datasets || 0,
            item.AREAS || 0,
            item.ETHNICITIES || 0,
            item["LANGUAGES, DIALECTS, and FAMILIES"] || 0,
            item.RELIGIONS || 0
          )
        );
        setfoci(fociRows);
      })
      .catch((err) => console.error("Failed to fetch foci:", err));
  }, [database]);

  const [datasetCount, setDatasetCount] = useState(null);

  useEffect(() => {

    fetch(`${process.env.REACT_APP_API_URL}/metadata/domaincount/${database}/DATASET`, {
      method: "GET"
    })
      .then(response => response.json())
      .then(data => setDatasetCount(data))
      .catch(err => console.error("Failed to fetch dataset count:", err));

  }, [database]);

  return (
    <div className='body'>

      <Box sx={{ flexGrow: 1, marginLeft: { xs: 0, sm: 1 }, marginRight: { xs: 0, sm: 1 } }}>
        <Grid container spacing={{ xs: 1, sm: 2 }}>

          {/* Description */}
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" className="appbody-card">
              <CardContent>
                <FAQButton title="Description" />
                <Box sx={{ mt: 2 }}>
                  {paragraphs.map((text, index) => {
                    return (
                      <Typography
                        key={index}
                        variant="body2"
                        sx={{
                          color: "#fff !important;",
                          mb: 2,
                          lineHeight: 1.6
                        }}
                      >
                        {text}
                      </Typography>
                    );
                  })}
                </Box>
              </CardContent>
            </Card >
          </Grid>

          {/* Foci Table */}
          {database === "sociomap" && (
            <Grid item xs={12} sm={6}>
              <Card
                variant="outlined"
                className="appbody-card"
              >
                <CardContent>
                  <Typography
                    id="focitable"
                    sx={{ fontSize: 20 }}
                    color="#fff !important;"
                    gutterBottom
                  >
                    Dataset Coverage
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table
                      sx={{ minWidth: { xs: 0, sm: 400 } }}
                      size="small"
                      aria-label="dataset coverage table"
                    >
                      <TableHead>
                        <TableRow>
                          {/* Dynamically generate table headers from first row keys */}
                          {foci.length > 0 &&
                            Object.keys(foci[0]).map((key) => (
                              <TableCell key={key} align="justify">
                                {key}
                              </TableCell>
                            ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {foci.map((row, rowIndex) => (
                          <TableRow
                            key={rowIndex}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            {Object.entries(row).map(([key, value]) => (
                              <TableCell key={key} align="left">
                                {value === 0 ? "" : value &&
                                  typeof value === 'number'
                                  ? value.toLocaleString()
                                  : value}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Progress Table */}
          <Grid item xs={12} md={6}>
            <Card
              variant="outlined"
              sx={{
                backgroundColor: "black",
                border: "1px solid white",
              }}
            >
              <CardContent>
                <Typography
                  id="appbody"
                  sx={{ fontSize: 20 }}
                  color="#fff !important;"
                  gutterBottom
                >
                  Dataset Progress &nbsp;
                  <DownloadDatasetButton databaseName={database} fileName="dataset_list.xlsx" />
                  &nbsp; DATASETS: {datasetCount ?? "Loading..."}
                </Typography>

                <TableContainer component={Paper}>
                  <Table
                    sx={{ minWidth: { xs: 0, sm: 400 }, backgroundColor: "#f5f5f5" }}
                    size="small"
                    aria-label="dataset progress table"
                  >
                    <TableHead>
                      <TableRow>
                        {rows.length > 0 &&
                          Object.keys(rows[0]).map((header) => (
                            <TableCell key={header} sx={{ color: 'black', fontWeight: 'bold' }}>
                              {/* Optional: Capitalize the first letter for display */}
                              {header.charAt(0).toUpperCase() + header.slice(1)}
                            </TableCell>
                          ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, index) => {
                        const headers = Object.keys(row);

                        return (
                          <TableRow key={index}>
                            {headers.map((header) => (
                              <TableCell key={`${index}-${header}`} sx={{ color: 'black' }}>
                                {/* Check if value is a number to apply formatting, else return as is */}
                                {row[header] === 0 ? "" : row[header] &&
                                  typeof row[header] === 'number'
                                  ? row[header].toLocaleString()
                                  : row[header]}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Maps */}
          {database === "sociomap" && (
            <Grid item xs={12} sm={6}>
              <Card
                variant="outlined"
                className="appbody-card"
              >
                <CardContent>
                  <LiveMapCarousel />
                </CardContent>
              </Card>
            </Grid>
          )}

        </Grid>
      </Box>

      {/* Footer */}
      <CardContent>
        <FooterLinks />
      </CardContent>

    </div>
  )
}

export default AppBody
