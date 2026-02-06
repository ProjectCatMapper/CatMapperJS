import Navbar from '../components/NavbarApp'
import Tableclick from '../components/ExploreNode'
import FooterLinks from '../components/FooterLinks'
import { useParams } from 'react-router-dom'

const ExploreNode = () => {
  return (
    <>
      <div style={{
        minHeight: "100vh", display: 'flex',
        flexDirection: 'column'
      }}>
        <Navbar />
        <Tableclick {...useParams()} />
      </div>
      <FooterLinks />
    </>
  )
}

export default ExploreNode