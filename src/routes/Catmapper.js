import CatHome from '../components/cat_home'
import Cat_footer from '../components/cat_footer'

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