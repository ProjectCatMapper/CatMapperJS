import React from 'react';
import Navbar from '../components/NavbarHome';
import FooterLinks from '../components/FooterLinks';
import { Container, Typography, Link, Box } from '@mui/material';

const Privacy = () => {
  return (
    <>
      <div style={{ backgroundColor: 'white' }}>
        <Navbar />
        <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Privacy Policy
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          Effective date: February 14, 2026
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Overview</Typography>
          <Typography variant="body1" paragraph>
            CatMapper is committed to protecting your privacy. This policy explains what information we collect, how we use it, and what choices you have.
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Information We Collect</Typography>
          <Typography variant="body1" paragraph>
            We collect information you provide directly, such as account details for registered users and metadata you submit through CatMapper tools.
          </Typography>
          <Typography variant="body1" paragraph>
            We also collect limited technical usage information (for example, page views and basic browser/session data) to improve reliability and usability.
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>How We Use Information</Typography>
          <Typography variant="body1" paragraph>
            We use collected data to operate CatMapper features, authenticate users, secure the platform, troubleshoot issues, and improve product quality.
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Cookies and Local Storage</Typography>
          <Typography variant="body1" paragraph>
            CatMapper uses cookies and browser storage for core application functions, including authentication state and user preferences.
          </Typography>
          <Typography variant="body1" paragraph>
            Optional analytics are only enabled when consent is granted through the cookie banner.
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Data Sharing</Typography>
          <Typography variant="body1" paragraph>
            We do not sell personal data. Information may be shared only when necessary to operate the service, comply with legal obligations, or protect CatMapper and its users.
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Data Security and Retention</Typography>
          <Typography variant="body1" paragraph>
            We use reasonable administrative and technical safeguards to protect data. Data is retained only as long as needed for operational, research, legal, and security purposes.
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Your Choices</Typography>
          <Typography variant="body1" paragraph>
            You may request updates or deletion of your account information where applicable. For privacy-related requests, contact us at <Link href="mailto:support@catmapper.org">support@catmapper.org</Link>.
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Contact</Typography>
          <Typography variant="body1" paragraph>
            Questions about this Privacy Policy can be sent to <Link href="mailto:support@catmapper.org">support@catmapper.org</Link>.
          </Typography>
        </Box>
        </Container>
      </div>
      <FooterLinks />
    </>
  );
};

export default Privacy;
