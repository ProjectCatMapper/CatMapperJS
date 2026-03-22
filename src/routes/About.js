import React from 'react';
import Navbar from '../components/NavbarHome';
import { Container, Typography, Box } from '@mui/material';

const aboutParagraphs = [
  'We come from different fields, studying questions ranging from "how do ethnic disparities around the world contribute to health inequalities?" to "how do societies adapt and change in responses to shifting environments?".',
  'Despite differences in field and topic, we found that we all faced a common problem. Bringing together datasets often meant spending hours, days, or weeks reconciling entities such as ethnic groups, regions, archaeological sites, religions, languages, or artifact types. When we shared our frustrations with other colleagues doing comparative research, we learned we were not alone.',
  'We built CatMapper (short for "category mapper") to streamline the process of bringing data together across complex categories commonly used in the social sciences. CatMapper does this with a unique system for mapping categories across datasets. It includes functions to help researchers discover where data exists for specific categories (e.g. the Yoruba ethnicity) (Exploring), to find the best way to match these categories across datasets (Proposing Translations and Proposing Merges), and to store and share the matches they have made to share with others (Storing Merges).',
  "In our own research, CatMapper's tools have dramatically reduced the time it takes to reconcile categories and increased the transparency of these matches for more open science. Our team and the broader research community have already linked thousands of datasets and categories for others to use, and each new contribution strengthens CatMapper's capacity to support future integration efforts. If you are struggling with reconciling complex categories for your own research, we'd love to hear from you to discuss how CatMapper might make data integration easier for you too! CatMapper was built by researchers for researchers, and we are eager to explore how it can make data integration easier in your work.",
];

const About = () => {
  return (
    <div style={{ backgroundColor: 'white' }}>
      <Navbar />
      <Container maxWidth="md">
        <Box py={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            About CatMapper
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 3 }}>
            Our Dream - Easier Data Integration
          </Typography>

          {aboutParagraphs.map((paragraph, idx) => (
            <Typography key={idx} variant="body1" paragraph>
              {paragraph}
            </Typography>
          ))}

          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            CatMapper&apos;s workflow centers on four connected functions:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mt: 0 }}>
            <li>
              <Typography variant="body1">
                Explore: find category context and quickly identify where categories appear across datasets.
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                Translate: map raw category labels to CatMapper IDs and generate reusable crosswalks.
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                Merge: build and document reusable merge plans so external datasets can be joined consistently.
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                Edit: upload translations for permanent documentation.
              </Typography>
            </li>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default About;
