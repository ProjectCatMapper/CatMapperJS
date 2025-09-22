import Arch_navbar from '../components/arch_navbar'
import Arch_Video from '../components/arch_video'
import Footer from '../components/arch_footer'

const Archamap = () => {
  return (
    <div style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}>
      <Arch_navbar />
      <Arch_Video />
      <Footer />
    </div>
  )
}

export default Archamap