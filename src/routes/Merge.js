import Navbar from '../components/NavbarApp'
import Mergelayout from "../components/Merge"
import { useParams } from 'react-router-dom'

function MergePage() {
  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar {...useParams()} />
      <Mergelayout {...useParams()} />
    </div>
  )
}

export default MergePage;