import Navbar from '../components/arch_navbar'
import Admin from '../components/admin';

 const Archamap_AdminPage = () => {
   return (
    <div style={{backgroundColor:"white",height:"100vh", display: 'flex',
    flexDirection: 'column'}}>
    <Navbar />
    <Admin />
  </div>
   )
 }


export default Archamap_AdminPage;