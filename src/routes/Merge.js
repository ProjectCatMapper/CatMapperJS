import Navbar from '../components/NavbarApp'
import Mergelayout from "../components/Merge"

const Archamap_Merge = () => {
  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <Mergelayout />
    </div>
  )
}

export default Archamap_Merge;