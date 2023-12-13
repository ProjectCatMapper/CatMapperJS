import React from 'react'
import {Link} from 'react-router-dom'
import './video.css'

import cvideo from "../assets/new.mp4"

const video = () => {
  return (
    <div className='hero'>
        <video autoPlay loop muted id='video'>
            <source src={cvideo} type='video/mp4' />
        </video>
    <div className='content'>
       <h1>Ceramics.Periods.Districts</h1>
       <p>ArchaMap organizes categories of material objects used in archaeology, including sites, ceramic types, lithic and projectile point types, and faunal types. Our hope in the future is to extend CatMapper’s capabilities to other classes of complex, dynamic categories.</p>
    <div>
       <Link to='/explore' className='btn'>Explore</Link>
      <Link to='/merge' className='btn'>Merge</Link>
    </div>
    </div>
    </div>
  )
}

export default video