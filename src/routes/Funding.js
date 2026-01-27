import Navbar from '../components/NavbarHome'
import { Container, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './../components/Funding.css'

const theme = createTheme({
  typography: {
    fontFamily: 'Source Sans Pro, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol',
  },
});


const Funding = () => {
  return (
    <div style={{ backgroundColor: "white" }}>
      <Navbar />
      <ThemeProvider theme={theme}>
        <Container maxWidth="md" style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Paper elevation={1} style={{ padding: '2em', textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Funding
            </Typography>
            <Typography style={{ textAlign: 'left' }}>
              Development of CatMapper has been supported by:
            </Typography>
            <br />
            <ul className="custom-list">
              <li>ASU’s Institute for Social Science Research seed grant</li>
              <li>School for Human Evolution and Social Change interdisciplinary research grant</li>
              <li>National Science Foundation (BCS-2051369 & BCS-2318505) through the Human Networks and Data Science and Cultural Anthropology programs.</li>
              <li>Arizona State University’s Center for Archaeology and Society</li>
            </ul>
          </Paper>
        </Container>
      </ThemeProvider>
    </div>
  )
}

export default Funding