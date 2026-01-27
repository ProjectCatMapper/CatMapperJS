import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
// import image from "../assets/white.png";
// import Link from "@mui/material/Link";
import "./BodyCatMapper.css";
// import Divider from "@mui/material/Divider";
import FAQButton from "./FAQbutton";
import FooterLinks from "./FooterLinks";

const footer = () => {
  return (
    <div className="footer">
      <Box sx={{ flexGrow: 1, marginLeft: 1, marginRight: 1 }}>
        <Grid container spacing={2} direction="column">
          <Grid item xs={6} width={"100%"}>
            <Card
              variant="outlined"
              style={{ backgroundColor: "black", border: "1px solid white" }}
            >
              <CardContent>
                <FAQButton title="Description" />
                <Typography
                  variant="p"
                  color="#fff"
                  component="div"
                  id="catmapperfooter"
                >
                  CatMapper assists users in:
                  <br />
                  <br />
                  (1) exploring key contextual information about categories of
                  interest (e.g., Aymara ethnicity, Balochi language, Rajshahi
                  district).
                  <br />
                  <br />
                  (2) identifying which of thousands of datasets contain
                  information about specific categories.
                  <br />
                  <br />
                  (3) reconciling distinct and incompatible encodings for the
                  same category across diverse datasets to enable novel
                  analyses.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} width={"100%"}>
            <Card
              variant="outlined"
              style={{ backgroundColor: "black", border: "1px solid white" }}
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
