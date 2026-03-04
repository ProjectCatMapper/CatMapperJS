import Navbar from '../components/NavbarApp'
import Admin from '../components/Admin';
import { useParams } from 'react-router-dom';

const AdminPage = () => {
  return (
    <div style={{
      backgroundColor: "white", height: "100vh", display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar {...useParams()} />
      <Admin {...useParams()} />
    </div>
  )
}


export default AdminPage;
