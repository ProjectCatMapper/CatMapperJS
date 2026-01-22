import Navbar from '../components/NavbarHome'
import { Container, Typography, Box, Paper, Divider, Grid } from '@mui/material';

const updates = [
  {
    date: 'June 6, 2025',
    content: 'First version of CatMapper database dump publicly available (<https://catmapper.org/download>).'
  },
  {
    date: 'May, 2025',
    content: 'Workshop and presentation at Computational Archaeology Association annual meeting.'
  },
  {
    date: 'April, 2025',
    content: 'Workshop at Population Association of America annual meeting.'
  },
  {
    date: 'March 31, 2025',
    content: '1258 ethnic categories from Lomax and Arensberg’s 1977 subsistence paper linked to SocioMap.'
  },
  {
    date: 'March 20, 2025',
    content: '1073 ethnic categories from the Global Jukebox.'
  },
  {
    date: 'March 15, 2025',
    content: '2802 ethnic categories from the Library of congress authority records linked to SocioMap.'
  },
  {
    date: 'March 6, 2025',
    content: '2896 languoids from ECAI Digital Language Atlas of the Pacific Area linked to SocioMap.'
  },
  {
    date: 'March 3, 2025',
    content: 'Library of Congress Demographic Group Terms for ethnicities, nationalities and religions linked with SocioMap.'
  },
  {
    date: 'January 20, 2025',
    content: 'Library of Congress Classification (2024) for ethnicities (6500 unique ids and 3893 unique categories) linked to SocioMap.'
  },
  {
    date: 'January 15, 2025',
    content: 'Database of Religious History entries (up to Jan 1, 2025) linked to SocioMap.'
  },
  {
    date: 'January 15, 2025',
    content: 'Library of Congress MARC language categories added to SocioMap.'
  },
  {
    date: 'December 17, 2024',
    content: 'Administrative divisions from level-0 (i.e., countries/nations) through level-2 (e.g., U.S. counties) from Getty Thesaurus of Geographic Names linked to SocioMap.'
  },
  {
    date: 'November 12, 2024',
    content: 'All ethnicities, districts, and languages from Afrobarometer versions 1-9 have been linked and harmonized in SocioMap.'
  },
  {
    date: 'October 15, 2024',
    content: 'Library of Congress MARC Code list of geographic areas linked to SocioMap.'
  },
  {
    date: 'October 15, 2024',
    content: 'Library of Congress MARC Code List for Countries linked to SocioMap.'
  },
  {
    date: 'July 28, 2024',
    content: 'Reconciled Ukraine’s 2020 administrative re-organization with GADM and Geonames divisions (136 Raion, 1469 Hromada).'
  },
  {
    date: 'July 16, 2024',
    content: 'Ethnicities from Fearon linked to SocioMap.'
  },
  {
    date: 'June 21, 2024',
    content: 'Ethnicites in Politically Relevant Ethnic Groups linked to SocioMap.'
  },
  {
    date: 'June 19, 2024',
    content: 'Ethnicities from Atlas of Pre-Colonial Societies linked to SocioMap (2431 new links).'
  },
  {
    date: 'June 2, 2024',
    content: 'Countries from ISO 3166-1 alpha-2 and alpha-3 linked to SocioMap.'
  },
  {
    date: 'May 23, 2024',
    content: 'Ethnicities from GEnes and LAnguages Together databases linked to SocioMap.'
  },
  {
    date: 'April 25, 2024',
    content: 'Languages from kinbank linked to SocioMap.'
  },
  {
    date: 'April, 2024',
    content: 'Workshops hosted on SocioMap and ArchaMap at the European Human Behavior and Evolution Association and the Society for American Archaeology.'
  },
  {
    date: 'February, 2024',
    content: 'First CatMapper advisory board meeting hosted (Tempe, AZ and virtual).'
  },
  {
    date: 'January, 2024',
    content: 'First ArchaMap data synthesis workshop hosted, Tempe, AZ.'
  },
  {
    date: 'December 15, 2023',
    content: 'State-level lists of scheduled castes and tribes and social disadvantages classes from South India added to SocioMap (Andhra Pradesh, Goa, Karnataka, Kerala, Tamil Nadu, and Telangana).'
  },
  {
    date: 'December 7, 2023',
    content: 'Current ISO 639-3 standard for languages linked to SocioMap.'
  },
  {
    date: 'November 10, 2023',
    content: 'AIATSIS ontology of over 1000 Australian groups linked to SocioMap.'
  },
  {
    date: 'November 1, 2023',
    content: 'Geonames and GADM 3.6 level 2 administrative districts reconciled.'
  },
  {
    date: 'October 1, 2023',
    content: 'People of India ontology, including 2794 categories for castes, tribes, and communities, linked to SocioMap.'
  },
  {
    date: 'August 15, 2023',
    content: 'The NSF HNDS-I program has awarded a 2-year grant to improve and disseminate CatMapper.'
  },
  {
    date: 'March 28, 2023 : CatMapper’s first three merging templates here and coming soon.',
    content: '1.a draft of the Bahrami-Rad et al. 2021 merging template is uploaded and we are reconciling with the original merged dataset, 2) Peeples et al. 2023 merging template is now available in ArchaMap under DatasetID 947, 3) Hruschka et al. 2015 merging template will be available by April 21. If you are interested in a tutorial on how to download and use a merging template, please contact dhruschk@asu.edu'
  },
  {
    date: 'June 3rd, 2023',
    content: 'Four administrative district ontologies from Gennaioli et al. 2013 and 2014 added to SocioMap.'
  },
  {
    date: 'April 5th, 2023',
    content: 'ArchaMap presentation given at the Computer Applications and Quantitative Methods in Archaeology conference in Amsterdam.'
  },
  {
    date: 'March 30th and 31st, 2023',
    content: 'ArchaMap poster and presentation given at the Society for American Archaeology conference in Portland, Oregon.'
  },
  {
    date: 'March 7, 2023',
    content: 'eHRAF World Culture categories added to SocioMap. '
  },
  {
    date: 'Feb 24, 2023',
    content: 'Dan Hruschka gave talk on SocioMap at the Society for Cross-Cultural Research annual meeting.'
  },
  {
    date: 'Feb. 23, 2023',
    content: 'Our first workshop on using SocioMap! Thank you to all those who attended.'
  },
  {
    date: 'February 20, 2023',
    content: 'Berezkin Folklore ethnicity categories added to SocioMap.'
  },
  {
    date: 'February 19, 2023',
    content: 'All Minorities at Risk Sampling Frame ethnicity categories added to SocioMap.'
  },
  {
    date: 'January 1, 2023',
    content: 'IPUMS DHS ethnicity categories added to SocioMap.'
  },
  {
    date: 'December 31, 2022',
    content: 'India\'s 2015 National Family Health Survey caste and ethnicity categories added to SocioMap.'
  },
  {
    date: 'December 24, 2022',
    content: 'Ethnicity and country categories from the Ethnic Power Relations 2021 dataset added to SocioMap.'
  },
  {
    date: 'December 22, 2022',
    content: 'Language categories from the New Update Guthrie List added to SocioMap.'
  },
];


const News = () => {
  return (
    <div style={{ backgroundColor: "white" }}>
      <Navbar />
      <Container maxWidth="md" >
        <Typography variant="h4" component="h1" gutterBottom>
          News and updates
        </Typography>
        <Paper elevation={3} style={{ padding: '16px' }}>
          {updates.map((update, index) => (
            <Box key={index} mb={2}>
              <Typography variant="h6"><b>{update.date}</b></Typography>
              <Typography variant="body1">{update.content}</Typography>
              {index < updates.length - 1 && <Divider style={{ margin: '16px 0' }} />}
            </Box>
          ))}
        </Paper>
      </Container>
    </div>
  )
}

export default News