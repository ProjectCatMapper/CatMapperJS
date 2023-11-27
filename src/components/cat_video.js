import React from 'react'
import {Link} from 'react-router-dom'
import './cat_video.css'

import cvideo from "../assets/space.mp4"

const video = () => {
  return (
    <div className='hero'>
        <video autoPlay loop muted id='video'>
            <source src={cvideo} type='video/mp4' />
        </video>
    <div className='content'>
       <h1 id='catmapperhome'>Bringing Data Together.</h1>
       <p id='catmapperhome'>CatMapper organizes dynamic and complex category systems commonly used by scientists and policymakers, including ethnicities, languages, religions, political districts, political parties, and technologies. Each of these systems includes thousands of categories encoded in diverse, dynamic and incompatible ways across a growing corpus of thousands of datasets.</p>
    <div>
       <Link to='/home' className='btn' id='catmapperhome'>SocioMap</Link>
      <Link to='/Archamap' className='btn' id='catmapperhome'>Archamap</Link>
    </div>
    </div>
    </div>
  )
}

export default video