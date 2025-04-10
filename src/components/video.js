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
       <h1 id='sociomapvideo'>Ethnicities.Religions.Languages</h1>
       <p id='sociomapvideo'>SocioMap organizes dynamic and complex category systems commonly used by social scientists and policymakers, including ethnicities, languages, religions, and political districts. Each of these systems includes thousands of categories encoded in diverse, dynamic and incompatible ways across a growing corpus of thousands of datasets. SocioMap helps organize these categories so that users can merge diverse datasets for novel analyses.</p>
    <div>
       <Link id='sociomapvideo' to='/sociomap/explore' className='btn'>Explore</Link>
      <Link id='sociomapvideo' to='/sociomap/translate' className='btn'>Translate</Link>
    </div>
    </div>
    </div>
  )
}

export default video