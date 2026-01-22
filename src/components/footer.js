import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./footer.css";
// import image from "../assets/white.png";
// import Divider from "@mui/material/Divider";
import LiveMapCarousel from "./carousel";
// import { set } from "react-ga";
// import Link from "@mui/material/Link";
import FAQButton from "./FAQbutton";
import FooterLinks from "./FooterLinks";


function createData(names, nodes, encodings, contains, context) {
  return { names, nodes, encodings, contains, context };
}

function createFoci(Focus, Datasets, Areas, Ethnicities, Languages, Religions) {
  return { Focus, Datasets, Areas, Ethnicities, Languages, Religions };
}

const handleButtonClick = async () => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/allDatasets?database=sociomap`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, "data.xlsx");
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};

const Footer = () => {
  const [rows, setrows] = useState([]);

  const [foci, setfoci] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/progress?database=sociomap`, {
      method: "GET"
    })
      .then(response => response.json())
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
          "LANGUAGES, DIALECTS, and FAMILIES": "LANGUAGE OF",
          "RELIGIONS": "RELIGION OF",
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
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/foci?database=sociomap`, {
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
  }, []);

  return (
    <div className="footer">
      <Box sx={{ flexGrow: 1, marginLeft: 1, marginRight: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Card
              variant="outlined"
              style={{ backgroundColor: "black", border: "1px solid white" }}
            >
              <CardContent>
                <FAQButton title="Description" />
                <Typography variant="body1" color="#fff" component="div">
                  Explore: All users can search for basic contextual
                  information—geographical location, population size,
                  alternative names, and language—on categories of interest
                  (e.g., Aymara ethnicity, Balochi language, Rajshahi district).
                  They can also identify all datasets that contain specific
                  social, demographic, cultural and economic data for categories
                  of interest.
                  <br />
                  <br />
                  Translate: All users can translate categories from new
                  datasets to existing categories in SocioMap and download these
                  translations. Registered users can store and document
                  translations to assist in merging datasets for new analyses
                  and to share with others.Please contact dhruschk@asu.edu if
                  you would like to become a registered user.
                  <br />
                  <br />
                  Merge (in development): Registered users can develop, document
                  and share plans for merging data across diverse external
                  datasets by ethnicity, language, religion, or political
                  district. Once a merge plan is developed and saved, SocioMap
                  will be able to generate code in common formats (R, SPSS,
                  Stata, SAS), that will allow users to merge external datasets
                  they have stored on their own computer for their custom
                  analysis needs.
                  <br />
                  <br />
                  Share (in development): All users can find and download all
                  others users' past translations and merging plans to merge
                  datasets they have stored on their own computer.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6}>
            <Card
              variant="outlined"
              style={{ backgroundColor: "black", border: "1px solid white" }}
            >
              <CardContent>
                <Typography
                  id="sociomapfooter"
                  sx={{ fontSize: 20 }}
                  color="#fff"
                  gutterBottom
                >
                  Dataset Coverage
                </Typography>
                <TableContainer component={Paper}>
                  <Table
                    sx={{ minWidth: 650 }}
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
                              {value}
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

          <Grid item xs={6}>
            <Card
              variant="outlined"
              style={{ backgroundColor: "black", border: "1px solid white" }}
            >
              <CardContent>
                <LiveMapCarousel />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <CardContent>
        <FooterLinks />
      </CardContent>

    </div>
  );
};

export default Footer;
