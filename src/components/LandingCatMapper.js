import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import logo from '../assets/catmapperWhite.webp'
import backgroundImage from '../assets/earth.webp'
import './HomeCatMapper.css'

const CatHome = () => {
  const [click, setClick] = useState(false)
  const handleClick = () => setClick(!click)

  return (
    <div className="cat_hero" style={{ backgroundImage: `url(${backgroundImage})`, marginBottom: "2rem" }}>
      <div className="overlay">
        <div className="headertransparent">
          <Link to="/" className='logo'><img src={logo} width={100} height={70} alt="Logo" /></Link>
          <div className="hamburger" onClick={handleClick}>
            {click ? (<FaTimes size={20} style={{ color: '#fff' }} />) : (<FaBars size={20} style={{ color: '#fff' }} />)}
          </div>
        </div>

        <div className="content">
          <h1 id='catmapperhome'>Bringing Data Together.</h1>
          <p id='catmapperhome'>
            CatMapper organizes dynamic and complex category systems commonly used by scientists and policymakers, including ethnicities, languages, religions, political districts, political parties, and technologies. Each of these systems includes thousands of categories encoded in diverse, dynamic and incompatible ways across a growing corpus of thousands of datasets.
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
