import React from 'react'
import Navbar from '../components/footer_navbar'
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { Container, Typography, Link, Box,Grid } from '@mui/material';
import lic from "./../assets/license.png"
import lic1 from "./../assets/license1.png"

const theme = createTheme({
    spacing: 4,
  });
  
  const Root = styled(Container)(({ theme }) => ({
    marginTop: theme.spacing(4),
  }));
  
  const Section = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(2),
  }));
  
  const Icon = styled('img')(({ theme }) => ({
    width: 100,
    height: 50,
    marginRight: theme.spacing(1),
  }));
const Terms = () => {
  return (
    <div style={{backgroundColor:"white", height:"800"}}>
      <Navbar />
      <ThemeProvider theme={theme}>
        <Root>
        <Typography variant="h4" component="h1" gutterBottom>
          Disclaimers & Licenses
        </Typography>
        <Section>
          <Typography variant="h5" component="h2" gutterBottom>
            Disclaimers
          </Typography>
          <Typography variant="h6" component="h3" gutterBottom>
            Completeness and scope of CatMapper:
          </Typography>
          <Typography variant="body1" paragraph>
            CatMapper’s database of categories and translations are only as complete as the datasets whose metadata has been input. If you notice categories or datasets that should be included, please contact us (
            <Link href="mailto:dhruschk@asu.edu">dhruschk@asu.edu</Link>) to learn how to add them.
          </Typography>
          <Typography variant="h6" component="h3" gutterBottom>
            Accuracy of CatMapper:
          </Typography>
          <Typography variant="body1" paragraph>
            CatMapper includes claims (sometimes incompatible) made by external datasets about the relationships between categories, such as which countries contain specific territories. In some cases, incompatible claims reflect ongoing debates. In these cases, CatMapper makes no assessment of the relative validity of these claims, thereby permitting users to view the diversity of claims. In other cases, an external dataset may make a verifiably wrong claim about a category (e.g., an ethnic group is located in the middle of an ocean). In those cases, CatMapper continues to store this claim but marks it with a “not credible” note to improve searches and translations. In those cases, our team also reaches out to administrators of the external dataset to attempt to address the issue in the source data. If you notice an error in CatMapper, please contact us (
            <Link href="mailto:dhruschk@asu.edu">dhruschk@asu.edu</Link>).
          </Typography>
        </Section>
        <Section>
          <Typography variant="h5" component="h2" gutterBottom>
            Licenses
          </Typography>
          <Grid direction={"column"} container spacing={2} alignItems="left">
            <Grid item>
              <Icon src={lic} alt="GNU License Icon" />
            </Grid>
            <Grid item xs>
              <Typography variant="body1">
                <strong>CatMapper software</strong> is licensed under a GNU General Public License.
              </Typography>
            </Grid>
          </Grid>
          <br/>
          <Grid direction={"column"} container spacing={2} alignItems="left">
            <Grid item>
              <Icon src={lic1} alt="CC BY Icon" />
            </Grid>
            <Grid item xs>
              <Typography variant="body1">
                <strong>CatMapper database data and metadata</strong> are licensed under a Creative Commons Attribution-Sharealike 4.0 International (CC BY-SA 4.0 Deed).
              </Typography>
            </Grid>
          </Grid>
        </Section>
        </Root>
    </ThemeProvider>
    </div>
  )
}

export default Terms