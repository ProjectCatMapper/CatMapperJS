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
          Effective date: August 17, 2026
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
            With optional analytics consent, we collect limited technical usage information to improve reliability and usability. This includes a random, first-party session identifier and a time-stamped sequence of the full internal URLs you visit, including query strings. We do not add IP addresses, account identifiers, or optional survey comments to this navigation trail.
          </Typography>
          <Typography variant="body1" paragraph>
            We may invite visitors to answer a short survey about why they came to CatMapper. Survey answers are voluntary. Optional written comments are limited to 1,000 characters and are stored separately from analytics data.
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
            Optional analytics are only enabled when consent is granted through the cookie banner. Existing consent is renewed when this analytics purpose changes.
          </Typography>
          <Typography variant="body1" paragraph>
            With analytics consent, CatMapper stores the first-party internal navigation trail described above to understand page-to-page journeys. We also use Google Analytics to understand aggregate traffic, survey response categories, and links followed to other websites. We do not send optional survey comments to Google Analytics, and Google Analytics does not make individual IP addresses available to CatMapper.
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
          <Typography variant="body1" paragraph>
            Optional written survey comments are retained for up to 180 days. First-party navigation trails are retained for up to 30 days. Aggregated survey and analytics results may be retained longer when they no longer identify an individual visitor.
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Your Choices</Typography>
          <Typography variant="body1" paragraph>
            You may request updates or deletion of your account information where applicable. For privacy-related requests, contact us at <Link href="mailto:support@catmapper.org">support@catmapper.org</Link>.
          </Typography>
          <Typography variant="body1" paragraph>
            You can withdraw or change analytics consent at any time using the Cookie settings link in the site footer. Declining analytics prevents CatMapper from collecting an analytics journey or outbound-link trail. Withdrawing consent deletes the first-party navigation trail associated with the current browser session.
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
