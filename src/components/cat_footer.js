import React from 'react'
// import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
// import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import image from '../assets/white.png'
import { Link } from 'react-router-dom'
import './cat_footer.css'
import Divider from '@mui/material/Divider';

// const NPaper = styled(Paper)(({ theme }) => ({
//     backgroundColor: '#000',
//     padding: theme.spacing(2),
//     ...theme.typography.body2,
//     textAlign: 'justify',
//     color: '#fff',
//   }));
  
const footer = () => {
    return (
      <div className='footer'>
        <Box sx={{ flexGrow: 1 ,marginLeft:1,marginRight:1, }}>
      <Grid container spacing={2} direction="column">
        <Grid item xs={6} width={"100%"}>
        <Card variant="outlined" style={{backgroundColor: 'black',border: '1px solid white',}}>
        <CardContent>
      <Typography sx={{ fontSize: 30 }} color="#fff" gutterBottom id='catmapperfooter'>
        Description
      </Typography>
      <Typography variant="p" color="#fff" component="div" id='catmapperfooter'>
      CatMapper assists users in: 
      <br/><br/>
      (1) exploring key contextual information about categories of interest (e.g., Aymara ethnicity, Balochi language, Rajshahi district).
      <br/><br/>
      (2) identifying which of thousands of datasets contain information about specific categories.
      <br/><br/>
      (3) reconciling distinct and incompatible encodings for the same category across diverse datasets to enable novel analyses.
      </Typography>
    </CardContent>
    </Card >
        </Grid>
        <Grid item xs={6} width={"100%"}>
        <Card variant="outlined" style={{backgroundColor: 'black',border: '1px solid white',}}>
        <CardContent>
      <Typography sx={{ fontSize: 20 }} color="#fff" gutterBottom>
      </Typography>
      <Typography variant="p" color="#fff" component="div" id='catmapperfooter'>
      CatMapper currently houses two apps - SocioMap and ArchaMap:
      <br/><br/>
<b>SocioMap</b> organizes the thousands of sociopolitical categories e.g., ethnicities, languages, religions, districts, and political parties-frequently used by social scientists and policymakers. Users can search for basic contextual information on each category-geographical location, population size, alternative names, and language as well as the datasets containing specific social, demographic, cultural and economic data for each category. In the future, SocioMap will also provide tools for facilitating and sharing merges of diverse and heterogenous external datasets by these category systems to enable novel analyses.
<br/><br/>
<b>Archa Map</b> will organize artifact types e.g., ceramics, lithics-frequently used by archaeologists in analyses of material culture. ArchaMap will share SocioMap's functionalities for merging data from multiple sources by diverse category systems.   
      </Typography>
    </CardContent>
    </Card >          
        </Grid>
      </Grid>
    </Box>
    <Divider sx={{ marginTop: 3, marginBottom: 7, marginLeft:1,marginRight:1, backgroundColor: 'white' }} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, mb:0 }}>
        <img src={image} alt="CatMapper Logo" style={{ height: 80 }} />
        <Box>
          <Link  id="catmapperfooter" to="/people"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>People</Link>
          <Link to="/news" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>News</Link>
          <Link to="/funding" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Funding</Link>
          <Link to="/citation" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Citation</Link>
          <Link to="/terms" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Terms</Link>
          <Link to="/contact" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Contact</Link>
        </Box>
      </Box>


    {/* <Stack direction="column" spacing={2} position={'relative'} paddingLeft={100} top={-620} style={{maxHeight: 600, overflow: 'auto'}}>
        <h1 id='catmapperfooter'>News Feed</h1>
        <NPaper variant="outlined" square={false} style={{backgroundColor: 'black',border: '1px solid white',}}><h3 id='catmapperfooter'>August 15,2023</h3><br/><br/><p id='catmapperfooter'>The NSF HNDS-I program has awarded a 2-year grant to improve and disseminate CatMapper.</p></NPaper>
        <NPaper variant="outlined" square={false} style={{backgroundColor: 'black',border: '1px solid white',}}><h3 id='catmapperfooter'>March 28,2023 : CatMapper's first three merging templates here and coming soon. </h3><br/><br/><p id='catmapperfooter'>1) a draft of the Bahrami-Rad et al. 2021 merging template is uploaded and we are reconciling with the original merged dataset,<br/> 2) Peeples et al. 2023 merging template is now available in ArchaMap under DatasetID 947,<br/> 3) Hruschka et al. 2015 merging template will be available by April 21. If you are interested in a tutorial on how to download and use a merging template, please contact dhruschk@asu.edu</p></NPaper>
        <NPaper variant="outlined" square={false} style={{backgroundColor: 'black',border: '1px solid white',}}><h3 id='catmapperfooter'>June 3rd,2023</h3><br/><br/><p id='catmapperfooter'>Four administrative district ontologies from Gennaioli et al. 2013 and 2014 added to SocioMap.</p></NPaper>
        <NPaper variant="outlined" square={false} style={{backgroundColor: 'black',border: '1px solid white',}}><h3 id='catmapperfooter'>April 5th,2023</h3><br/><br/><p id='catmapperfooter'>ArchaMap presentation given at the Computer Applications and Quantitative Methods in Archaeology conference in Amsterdam.</p></NPaper>
        <NPaper variant="outlined" square={false} style={{backgroundColor: 'black',border: '1px solid white',}}><h3 id='catmapperfooter'>March 30th & 31st,2023</h3><br/><br/><p id='catmapperfooter'>ArchaMap poster and presentation given at the Society for American Archaeology conference in Portland, Oregon.</p></NPaper>
        <NPaper variant="outlined" square={false} style={{backgroundColor: 'black',border: '1px solid white',}}><h3 id='catmapperfooter'>March 7,2023</h3><br/><br/><p id='catmapperfooter'>eHRAF World Culture categories added to SocioMap.</p></NPaper>
        <NPaper variant="outlined" square={false} style={{backgroundColor: 'black',border: '1px solid white',}}><h3 id='catmapperfooter'>February 24,2023</h3><br/><br/><p id='catmapperfooter'>Dan Hruschka gave talk on SocioMap at the Society for Cross-Cultural Research annual meeting.</p></NPaper>
        <NPaper variant="outlined" square={false} style={{backgroundColor: 'black',border: '1px solid white',}}><h3 id='catmapperfooter'>February 23,2023</h3><br/><br/><p id='catmapperfooter'>Our first workshop on using SocioMap! Thank you to all those who attended.</p></NPaper>
        <NPaper variant="outlined" square={false} style={{backgroundColor: 'black',border: '1px solid white',}}><h3 id='catmapperfooter'>February 20,2023</h3><br/><br/><p id='catmapperfooter'>Berezkin Folklore ethnicity categories added to SocioMap.</p></NPaper>
        <NPaper variant="outlined" square={false} style={{backgroundColor: 'black',border: '1px solid white',}}><h3 id='catmapperfooter'>February 19,2023</h3><br/><br/><p id='catmapperfooter'>All Minorities at Risk Sampling Frame ethnicity categories added to SocioMap.</p></NPaper>
        <NPaper variant="outlined" square={false} style={{backgroundColor: 'black',border: '1px solid white',}}><h3 id='catmapperfooter'>January 1,2023</h3><br/><br/><p id='catmapperfooter'>IPUMS DHS ethnicity categories added to SocioMap.</p></NPaper>
        <NPaper variant="outlined" square={false} style={{backgroundColor: 'black',border: '1px solid white',}}><h3 id='catmapperfooter'>December 31,2022</h3><br/><br/><p id='catmapperfooter'>India's 2015 National Family Health Survey caste and ethnicity categories added toSocioMap.</p></NPaper>
      <NPaper variant="outlined" square={false} style={{backgroundColor: 'black',border: '1px solid white',}}><h3 id='catmapperfooter'>December 24,2022</h3><br/><br/><p id='catmapperfooter'>Ethnicity and country categories from the Ethnic Power Relations 2021 dataset added to SocioMap.</p></NPaper>
      <NPaper variant="outlined" square={false} style={{backgroundColor: 'black',border: '1px solid white',}}><h3 id='catmapperfooter'>December 22,2022</h3><br/><br/><p id='catmapperfooter'>Language categories from the New Update Guthrie List added to SocioMap.</p></NPaper>
    </Stack> */}
     

    </div>
          )
}

export default footer