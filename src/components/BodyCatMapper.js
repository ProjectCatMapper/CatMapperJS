import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
// import image from "../assets/white.webp";
// import Link from "@mui/material/Link";
import "./BodyCatMapper.css";
// import Divider from "@mui/material/Divider";
import FAQButton from "./FAQbutton";
import FooterLinks from "./FooterLinks";

const footer = () => {
  return (
    <div className="footer">
      <Box sx={{ flexGrow: 1, marginLeft: { xs: 0, sm: 1 }, marginRight: { xs: 0, sm: 1 } }}>
        <Grid container spacing={2} direction="column">
          <Grid item xs={12} width={"100%"}>
            <Card
              variant="outlined"
              className="catmapper-footer-card"
            >
              <CardContent>
                <FAQButton title="Description" />
                <Typography
                  variant="p"
                  color="#fff"
                  component="div"
                  id="catmapperfooter"
                >
                  Tired of losing weeks to the tedious task of harmonizing complex categories across diverse datasets? Born from the shared frustrations of researchers across the social sciences, CatMapper is a community-driven tool designed to solve the headache of data integration. By providing an intuitive system to explore, match, and publicly share category translations—from ethnic groups to archaeological sites—CatMapper dramatically reduces reconciliation time while boosting open science transparency. Join a growing network of scholars who have already linked thousands of datasets, and discover how CatMapper can eliminate the friction of data cleaning so you can focus on your comparative research.
                  <br />
                  <br />
                  Read our <Link to="/about" style={{ color: 'inherit', textDecoration: 'underline' }}>about</Link> page to learn more.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} width={"100%"}>
            <Card
              variant="outlined"
              className="catmapper-footer-card"
            >
              <CardContent>
                <Typography
                  sx={{ fontSize: 20 }}
                  color="#fff"
                  gutterBottom
                ></Typography>
                <Typography
                  variant="p"
                  color="#fff"
                  component="div"
                  id="catmapperfooter"
                >
                  CatMapper currently houses two apps - SocioMap and ArchaMap:
                  <br />
                  <br />
                  <b>SocioMap</b> organizes the thousands of sociopolitical
                  categories e.g., ethnicities, languages, religions, districts,
                  and political parties-frequently used by social scientists and
                  policymakers. Users can search for basic contextual
                  information on each category-geographical location, population
                  size, alternative names, and language as well as the datasets
                  containing specific social, demographic, cultural and economic
                  data for each category. In the future, SocioMap will also
                  provide tools for facilitating and sharing merges of diverse
                  and heterogenous external datasets by these category systems
                  to enable novel analyses.
                  <br />
                  <br />
                  <b>Archa Map</b> will organize artifact types e.g., ceramics,
                  lithics-frequently used by archaeologists in analyses of
                  material culture. ArchaMap will share SocioMap's
                  functionalities for merging data from multiple sources by
                  diverse category systems.
                  <br />
                  <br />
                  Read our <Link to="/about" style={{ color: 'inherit', textDecoration: 'underline' }}>about</Link> page to learn more.
                </Typography>
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

export default footer;
