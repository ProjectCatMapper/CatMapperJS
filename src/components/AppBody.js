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
      <strong>ArchaMap</strong> brings <strong>CatMapper&apos;s</strong> harmonization workflow to archaeology, organizing complex typologies such as ceramic wares, lithic traditions, faunal categories, sites, and time periods. It supports translation and merge workflows that make fragmented regional datasets interoperable at scale. By preserving auditable category mappings, <strong>ArchaMap</strong> enables clearer synthesis of material culture evidence across space and time.
    </>,
    <>
      Read our <Link className="cm-about-link" to="/about">about</Link> page to learn more.
    </>
  ],
  sociomap: [
    <>
      Tired of losing weeks to the tedious task of harmonizing complex categories across diverse datasets? Born from the shared frustrations of researchers across the social sciences, <strong>CatMapper</strong> is a community-driven tool designed to solve the headache of <strong>data integration</strong>. By providing an intuitive system to explore, match, and publicly share category translations—from ethnic groups to archaeological sites—<strong>CatMapper</strong> dramatically reduces reconciliation time while boosting <strong>open science transparency</strong>. Join a growing network of scholars who have already linked thousands of datasets, and discover how <strong>CatMapper</strong> can eliminate the friction of data cleaning so you can focus on your comparative research.
    </>,
    <>
      <strong>SocioMap</strong> helps researchers reconcile inconsistent sociopolitical categories across datasets, including ethnicities, languages, religions, and administrative units. It provides a shared system to search category context, compare naming conventions, and connect records across major global data sources. By documenting and sharing translation decisions, <strong>SocioMap</strong> enables faster, more transparent, and reproducible comparative research.
    </>,
    <>
      Read our <Link className="cm-about-link" to="/about">about</Link> page to learn more.
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
  const progressHeaders = rows.length > 0 ? Object.keys(rows[0]) : [];
  const coverageHeaders = foci.length > 0 ? Object.keys(foci[0]) : [];

  const formatProgressHeader = (header) =>
    String(header || "")
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());

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
                  <TableContainer component={Paper} className="dataset-coverage-container">
                    <Table
                      sx={{ width: "100%", minWidth: 0, tableLayout: "fixed" }}
                      size="small"
                      aria-label="dataset coverage table"
                    >
                      <TableHead>
                        <TableRow>
                          {coverageHeaders.map((key, index) => (
                            <TableCell
                              key={key}
                              align="left"
                              sx={{
                                px: { xs: 0.5, sm: 0.75 },
                                py: 0.5,
                                fontSize: { xs: "0.66rem", sm: "0.74rem" },
                                lineHeight: 1.15,
                                whiteSpace: "normal",
                                overflowWrap: "anywhere",
                                width: index === 0 ? "24%" : `${76 / Math.max(coverageHeaders.length - 1, 1)}%`,
                              }}
                            >
                              {formatProgressHeader(key)}
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
                              <TableCell
                                key={key}
                                align="left"
                                sx={{
                                  px: { xs: 0.5, sm: 0.75 },
                                  py: 0.5,
                                  fontSize: { xs: "0.72rem", sm: "0.78rem" },
                                  lineHeight: 1.2,
                                  whiteSpace: "normal",
                                  overflowWrap: "anywhere",
                                }}
                              >
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

                <TableContainer component={Paper} className="dataset-progress-container">
                  <Table
                    sx={{ width: "100%", minWidth: 0, tableLayout: "fixed", backgroundColor: "#f5f5f5" }}
                    size="small"
                    aria-label="dataset progress table"
                  >
                    <TableHead>
                      <TableRow>
                        {progressHeaders.map((header, index) => (
                            <TableCell
                              key={header}
                              sx={{
                                color: "black",
                                fontWeight: "bold",
                                px: { xs: 0.5, sm: 0.75 },
                                py: 0.5,
                                fontSize: { xs: "0.66rem", sm: "0.74rem" },
                                lineHeight: 1.15,
                                whiteSpace: "normal",
                                overflowWrap: "anywhere",
                                width: index === 0 ? "28%" : `${72 / Math.max(progressHeaders.length - 1, 1)}%`,
                              }}
                            >
                              {formatProgressHeader(header)}
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
                              <TableCell
                                key={`${index}-${header}`}
                                sx={{
                                  color: "black",
                                  px: { xs: 0.5, sm: 0.75 },
                                  py: 0.5,
                                  fontSize: { xs: "0.72rem", sm: "0.78rem" },
                                  lineHeight: 1.2,
                                  whiteSpace: "normal",
                                  overflowWrap: "anywhere",
                                }}
                              >
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
