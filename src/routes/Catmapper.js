import CatHome from '../components/LandingCatMapper'
import Cat_footer from '../components/BodyCatMapper'

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
      <Cat_footer />
    </div>
  )
}

export default Catmapper