import Navbar from '../components/Navbar'
import Video from '../components/video'
import Footer from '../components/footer'

const Home = () => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
    }}>
      <Navbar />
      <Video />
      <Footer />
    </div>
  )
}

export default Home