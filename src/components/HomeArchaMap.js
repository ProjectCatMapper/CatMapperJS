import React from 'react'
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './Footer.css'
// import image from '../assets/white.png'
// import Divider from '@mui/material/Divider';
// import Link from "@mui/material/Link";
import FAQButton from "./FAQbutton";
import FooterLinks from "./FooterLinks";

function createData(names, nodes, encodings, contains, context) {
  return { names, nodes, encodings, contains, context };
}

// function createFoci(Focus, Datasets, Areas, Ethnicities, Languages, Religions) {
//   return { Focus, Datasets, Areas, Ethnicities, Languages, Religions  };
// }

const handleButtonClick = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/allDatasets?database=archamap`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    saveAs(blob, 'data.xlsx');
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
};


const FooterArchaMap = () => {

  const [rows, setrows] = useState([]);

  // const [foci,setfoci] = useState([])

  // useEffect(() => {
  //   fetch(`${process.env.REACT_APP_API_URL}/foci?database=archamap`,
  //       // fetch("http://127.0.0.1:5001/foci?database=archamap",
  //           {
  //               method: "GET"
  //           })
  //           .then(response => {
  //               return response.json()
  //           })
  //           .then(data => {setfoci([
  //             createFoci(data[0].Focus,data[0].Datasets,data[0].AREAS,data[0].ETHNICITIES,data[0]["LANGUAGES, DIALECTS, and FAMILIES"],data[0].RELIGIONS),
  //             createFoci(data[1].Focus,data[1].Datasets,data[1].AREAS,data[1].ETHNICITIES,data[1]["LANGUAGES, DIALECTS, and FAMILIES"],data[1].RELIGIONS),
  //             createFoci(data[2].Focus,data[2].Datasets,data[2].AREAS,data[2].ETHNICITIES,data[2]["LANGUAGES, DIALECTS, and FAMILIES"],data[2].RELIGIONS),
  //             createFoci(data[3].Focus,data[3].Datasets,data[3].AREAS,data[3].ETHNICITIES,data[3]["LANGUAGES, DIALECTS, and FAMILIES"],data[3].RELIGIONS),
  //             createFoci(data[4].Focus,data[4].Datasets,data[4].AREAS,data[4].ETHNICITIES,data[4]["LANGUAGES, DIALECTS, and FAMILIES"],data[4].RELIGIONS),
  //           ]);
  //           })
  //   },[])

  useEffect(() => {

    fetch(`${process.env.REACT_APP_API_URL}/progress?database=archamap`,
      // fetch("http://127.0.0.1:5001/progress?database=archamap",
      {
        method: "GET"
      })
      .then(response => {
        return response.json()
      })
      .then(data => {
        const nodeMap = {};
        const encodingMap = {};
        const relationMap = {};

        data.nodes.forEach(n => { nodeMap[n.label] = n.current; });
        data.encodings.forEach(e => { encodingMap[e.label] = e.current; });
        data.relations.forEach(r => { relationMap[r.label] = r.current; });

        // Define explicit relation mapping
        const nodeToRelationMap = {
          "AREAS": "AREA OF",
          "PERIODS": "PERIOD OF",
          "CULTURES": "CULTURE OF",
          // Add more mappings if new types gain relations
        };

        const rows = [];

        // Add DATASETS row if present
        if (nodeMap["DATASETS"] !== undefined) {
          rows.push(createData("Datasets", nodeMap["DATASETS"], "", "", ""));
        }

        let totalNodes = 0;

        Object.entries(nodeMap).forEach(([label, count]) => {
          if (label === "DATASETS") return;

          const encoding = encodingMap[label] || 0;
          const encodingPerNode = count > 0 ? (encoding / count).toFixed(2) : "0.00";
          const relationLabel = nodeToRelationMap[label];
          const relation = relationLabel ? (relationMap[relationLabel] || "") : "";

          rows.push(
            createData(label, count, encodingPerNode, "x", relation)
          );

          totalNodes += count;
        });

        const totalContains = relationMap["CONTAINS"] || 0;

        const totalRelationSum = Object.entries(nodeToRelationMap).reduce((sum, [, relationLabel]) => {
          return sum + (relationMap[relationLabel] || 0);
        }, 0);

        rows.push(
          createData(
            "Total",
            totalNodes,
            totalNodes > 0 ? (totalContains / totalNodes).toFixed(2) : "0.00",
            totalContains,
            totalRelationSum
          )
        );

        setrows(rows);
      })
      .catch(err => console.error("Failed to fetch progress", err));
  }, [])

  return (
    <div className='footer'>

      <Box sx={{ flexGrow: 1, marginLeft: 1, marginRight: 1, }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Card variant="outlined" style={{ backgroundColor: 'black', border: '1px solid white', }}>
              <CardContent>
                <FAQButton title="Description" />
                <Typography variant="p" color="#fff" component="div">

                  ArchaMap is an open-source tool designed to aid in the integration of multiple complex data sets with different sources, data ontologies, and resolutions. ArchaMap is designed to save time, increase consistency, and document complex data merging processes among multiple sources. This application stores and suggests past translations to build an ever-expanding list of associations to aid in connecting categorical data across different sources. ArchaMap uses previously uploaded categories to build a database of potential category names and includes contextual information to help users find the appropriate match.
                </Typography>
              </CardContent>
            </Card >
          </Grid>

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
                  id="sociomapfooter"
                  sx={{ fontSize: 20 }}
                  color="#fff"
                  gutterBottom
                >
                  Dataset Progress &nbsp;
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: "blue",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "green",
                      },
                      fontSize: "0.6rem",
                      px: 1,
                      py: 0.5,
                    }}
                    onClick={handleButtonClick}
                  >
                    Download datasets list
                  </Button>
                  &nbsp; DATASETS: {rows[0]?.nodes ?? "Loading..."}
                </Typography>

                <TableContainer component={Paper}>
                  <Table
                    sx={{ minWidth: 650, backgroundColor: "#f5f5f5" }}
                    size="small"
                    aria-label="dataset progress table"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Nodes</TableCell>
                        <TableCell>Datasets per node</TableCell>
                        <TableCell>Context ties</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.slice(1).map((row) => (
                        <TableRow key={row.names}>
                          <TableCell component="th" scope="row">
                            {row.names}
                          </TableCell>
                          <TableCell>{row.nodes}</TableCell>
                          <TableCell>{row.encodings}</TableCell>
                          <TableCell>{row.context}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      </Box>
      <CardContent>
        <FooterLinks />
      </CardContent>

    </div>
  )
}

export default FooterArchaMap