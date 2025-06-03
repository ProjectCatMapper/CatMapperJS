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
       <h1 id='sociomapvideo'>Ceramics.Periods.Sites</h1>
       <p id='sociomapvideo'>ArchaMap organizes categories of material objects used in archaeology, including sites, ceramic types, lithic and projectile point types, and faunal types. Our hope in the future is to extend CatMapper’s capabilities to other classes of complex, dynamic categories.</p>
    <div>
       <Link id='sociomapvideo' to='/archamap/explore' className='btn'>Explore</Link>
      <Link id='sociomapvideo' to='/archamap/translate' className='btn'>Translate</Link>
    </div>
    </div>
    </div>
  )
}

export default video