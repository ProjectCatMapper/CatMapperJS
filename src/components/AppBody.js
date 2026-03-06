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
import { Link } from 'react-router-dom';
import './AppBody.css'
import FAQButton from "./FAQbutton";
import FooterLinks from "./FooterLinks";
import DownloadDatasetButton from './DownloadDatasetListButton';
import LiveMapCarousel from "./Carousel";

const descriptions = {
  archamap: [
    <>
      Tired of losing weeks to the tedious task of harmonizing complex categories across diverse datasets? Born from the shared frustrations of researchers across the social sciences, <strong>CatMapper</strong> is a community-driven tool designed to solve the headache of <strong>data integration</strong>. By providing an intuitive system to explore, match, and publicly share category translations—from ethnic groups to archaeological sites—<strong>CatMapper</strong> dramatically reduces reconciliation time while boosting <strong>open science transparency</strong>. Join a growing network of scholars who have already linked thousands of datasets, and discover how <strong>CatMapper</strong> can eliminate the friction of data cleaning so you can focus on your comparative research.
    </>,
    <>
      <strong>ArchaMap</strong> extends the core data-integration architecture of the <strong>CatMapper</strong> project directly into the realm of archaeology, providing specialized tools to synthesize massive, fragmented records of material culture and human history. Recognizing the persistent challenges of comparative regional research, <strong>ArchaMap</strong> organizes the localized, highly specific typologies frequently used by archaeologists—such as complex ceramic wares, lithic technologies, faunal categories, sites, and chronological time periods. <strong>ArchaMap&apos;s translate and merge tools</strong> allows researchers to standardize and merge disparate archaeological databases. This makes it vastly easier to track material culture networks, investigate broad patterns of social interaction, and map artifact data across expansive geographic regions. Whether standardizing newly excavated data or managing complex legacy databases, <strong>ArchaMap</strong> ensures that the myriad ways archaeologists classify the past can be accurately harmonized. This shared infrastructure empowers researchers to securely document their category translations, paving the way for large-scale, open-science analyses of ancient social networks, material exchange, migration, equality, and more.
    </>,
    <>
      Read our <Link to="/about" style={{ color: 'inherit', textDecoration: 'underline' }}>about</Link> page to learn more.
    </>
  ],
  sociomap: [
    <>
      Tired of losing weeks to the tedious task of harmonizing complex categories across diverse datasets? Born from the shared frustrations of researchers across the social sciences, <strong>CatMapper</strong> is a community-driven tool designed to solve the headache of <strong>data integration</strong>. By providing an intuitive system to explore, match, and publicly share category translations—from ethnic groups to archaeological sites—<strong>CatMapper</strong> dramatically reduces reconciliation time while boosting <strong>open science transparency</strong>. Join a growing network of scholars who have already linked thousands of datasets, and discover how <strong>CatMapper</strong> can eliminate the friction of data cleaning so you can focus on your comparative research.
    </>,
    <>
      <strong>SocioMap</strong> is designed to tackle the thorny problem of <strong>data harmonization</strong> across the social sciences by organizing and reconciling thousands of complex, dynamic sociopolitical categories—such as ethnicities, languages, religions, administrative subdistricts, and political parties. Because disparate global datasets frequently use conflicting labels or definitions for the same demographic group, <strong>SocioMap</strong> provides a centralized, standardized interface to untangle these naming conventions. Users can search for essential contextual information on each category, including geographical bounds, population sizes, alternative names, and linguistic affiliations. Beyond serving as a specialized reference directory, <strong>SocioMap</strong> connects researchers directly to major international microdata sources (such as DHS, MICS, Afrobarometer, and the World Values Survey) that contain corresponding social, demographic, cultural, and economic variables. <strong>SocioMap</strong> also facilitate the translation and merging of these heterogeneous datasets. By allowing users to seamlessly bridge category systems and publicly share their translation decisions, <strong>SocioMap</strong> enables transparent, reproducible analyses of pressing global issues at unprecedented precision.
    </>,
    <>
      Read our <Link to="/about" style={{ color: 'inherit', textDecoration: 'underline' }}>about</Link> page to learn more.
    </>
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
