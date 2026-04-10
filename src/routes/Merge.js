import Navbar from '../components/NavbarApp'
import Mergelayout from "../components/Merge"
import { useParams } from 'react-router-dom'

function MergePage() {
  const params = useParams();

  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar {...params} />
      <Mergelayout {...params} />
    </div>
  )
}

export default MergePage;
