import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/catmapperWhite_small.webp'
import backgroundImage from '../assets/earth.webp'
import './HomeCatMapper.css'

const CatHome = () => {
  return (
    <div className="cat_hero" style={{ backgroundImage: `url(${backgroundImage})`, marginBottom: "2rem" }}>
      <div className="overlay">
        <div className="headertransparent">
          <Link to="/" className='logo'><img src={logo} width={100} height={70} alt="CatMapper logo" /></Link>
        </div>

        <div className="content">
          <h1 id='catmapperhome'>Bringing Data Together</h1>
          <p id='catmapperhome'>
            CatMapper's mission is to empower researchers to connect and integrate complex data across diverse classification systems, transforming fragmented datasets into connected knowledge that accelerates scientific discovery, collaboration, and reproducible research.
          </p>
          <div>
            <Link to='/sociomap' className='btn' id='catmapperhome'>SocioMap</Link>
            <Link to='/archamap' className='btn' id='catmapperhome'>Archamap</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CatHome
