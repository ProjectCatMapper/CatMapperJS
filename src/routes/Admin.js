import Navbar from '../components/NavbarApp'
import Admin from '../components/Admin';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Box, Button } from '@mui/material';

const AdminPage = () => {
  return (
    <div style={{
      backgroundColor: "white", height: "100vh", display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar {...useParams()} />
      <Box sx={{ px: 2, pt: 2 }}>
        <Button component={Link} to="/admin/metadata" variant="outlined">
          Open Metadata Manager
        </Button>
      </Box>
      <Admin {...useParams()} />
    </div>
  )
}


export default AdminPage;
