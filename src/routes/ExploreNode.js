import Navbar from '../components/NavbarApp'
import Tableclick from '../components/TableClick'
import { useParams } from 'react-router-dom'

const ExploreNode = () => {
  return (
    <div style={{
      minHeight: "100vh", display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar />
      <Tableclick cmid={useParams()} />
    </div>
  )
}

export default ExploreNode