import Navbar from '../components/NavbarApp'
import Admin from '../components/Admin';

const AdminPage = () => {
  return (
    <div style={{
      backgroundColor: "white", height: "100vh", display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar />
      <Admin />
    </div>
  )
}


export default AdminPage;