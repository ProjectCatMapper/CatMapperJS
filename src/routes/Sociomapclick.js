import Navbar from '../components/Navbar'
import Tableclick from '../components/test_tableclick'
import { useParams } from 'react-router-dom'

const Sociomapclick = () => {
  return (
    <div style={{minHeight: "100vh",display: 'flex',
    flexDirection: 'column'}}>
      <Navbar />
      <Tableclick cmid ={useParams()}/>
    </div>
  )
}

export default Sociomapclick