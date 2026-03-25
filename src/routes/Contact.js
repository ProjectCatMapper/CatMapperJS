import React from 'react'
import Navbar from '../components/NavbarHome'
import FooterLinks from '../components/FooterLinks';
import { Container, Typography, Link, Box } from '@mui/material';

const Contact = () => {

  return (
    <>
      <div style={{ backgroundColor: "white" }}>
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
            Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about CatMapper, SocioMap, or ArchaMap or would like to learn about how to become a registered user, please contact <Link href="mailto:support@catmapper.org">support@catmapper.org</Link>.
          </Typography>
          </Box>
        </Container>
      </div>
      <FooterLinks />
    </>
  )
}

export default Contact
