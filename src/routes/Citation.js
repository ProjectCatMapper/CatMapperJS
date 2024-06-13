import React from 'react'
import Navbar from '../components/footer_navbar'
import { Container, Typography, Link, Box } from '@mui/material';

const Citation = () => {
  return (
    <div style={{backgroundColor:"white"}}>
      <Navbar />
      <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="left"
        minHeight="80vh"
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Citation
        </Typography>
        <Typography variant="body1" paragraph>
          If you use CatMapper to assist in a research project, please cite the following manuscript.
        </Typography>
        <Typography variant="body1" paragraph>
        <b>Hruschka, Daniel J., Robert Bischoff, Matt Peeples, Sharon Hsiao, and Mohamed Sarwat</b>
          <br />
          <b>2022 CatMapper: A User-Friendly Tool for Integrating Data across Complex Categories. SocArXiv Papers.</b>
          <br />
          <Link href="https://osf.io/preprints/socarxiv/n6rty/" target="_blank" rel="noopener noreferrer">
            <b>https://osf.io/preprints/socarxiv/n6rty/</b>
          </Link>
        </Typography>
        <Typography variant="body1" paragraph>
          CatMapper assists users in finding and merging data from external datasets.
          <br />
          For each external dataset, CatMapper includes citations, links and other metadata on a unique dataset info page.
          <br />
          Please view these links and citations for information on how to cite these external datasets if you use them for a specific published analysis.
        </Typography>
      </Box>
    </Container>
    </div>
  )
}

export default Citation