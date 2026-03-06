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
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
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
                  Read our <Link className="cm-about-link" to="/about">about</Link> page to learn more.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
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
                  CatMapper currently houses two apps:
                  <br />
                  <br />
                  <b>SocioMap</b> helps researchers reconcile inconsistent sociopolitical categories across datasets, including ethnicities, languages, religions, and administrative units. It provides a shared system to search category context, compare naming conventions, and connect records across major global data sources. By documenting and sharing translation decisions, SocioMap enables faster, more transparent, and reproducible comparative research.
                  <br />
                  <br />
                  <b>ArchaMap</b> brings CatMapper&apos;s harmonization workflow to archaeology, organizing complex typologies such as ceramic wares, lithic traditions, faunal categories, sites, and time periods. It supports translation and merge workflows that make fragmented regional datasets interoperable at scale. By preserving auditable category mappings, ArchaMap enables clearer synthesis of material culture evidence across space and time.
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
