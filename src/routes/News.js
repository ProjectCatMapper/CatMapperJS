import React from 'react'
import Navbar from '../components/footer_navbar'
import { Container, Typography, Box, Paper, Divider, Grid } from '@mui/material';

const updates = [
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
      date: 'March 28, 2023',
      content: 'CatMapper’s first three merging templates here and coming soon.'
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
    <div style={{backgroundColor:"white"}}>
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