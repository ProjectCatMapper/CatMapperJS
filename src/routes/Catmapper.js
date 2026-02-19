import CatHome from '../components/LandingCatMapper'
import CatFooter from '../components/BodyCatMapper'

const Catmapper = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <div style={{ flex: 1 }}>
        <CatHome />
      </div>
      <CatFooter />
    </div>
  )
}

export default Catmapper
