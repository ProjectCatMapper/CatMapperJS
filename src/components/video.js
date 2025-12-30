import {useEffect,useState} from 'react'
import {Link} from 'react-router-dom'
import './video.css'

import cvideo from "../assets/new.mp4"

const Video = () => {
  const [displayData, setDisplayData] = useState([]);

  useEffect(() => {
      fetch(`${process.env.REACT_APP_API_URL}/homepagecount?database=SocioMap`, {
        method: "GET"
      })
        .then(response => response.json())
        .then(data => {
          setDisplayData(data)
        })
      .catch(err => console.error("Failed to fetch progress", err));
  }, []);

  return (
    <div className='hero' style={{marginBottom:"2rem"}}>
        <video autoPlay loop muted playsInline controls={false} id='video'>
            <source src={cvideo} type='video/mp4' />
        </video>
    <div className='sociocontent'>
      {displayData.length > 0 &&
      (<h1 id="sociomapvideo" className="stacked">
        <div>{Math.floor(displayData[0].node_count / 1000) * 1000}+ Ethnicities</div>
        <div>{Math.floor(displayData[1].node_count / 1000) * 1000}+ Religions</div>
        <div>{Math.floor(displayData[2].node_count / 1000) * 1000}+ Languages</div>
        <div>{Math.floor(displayData[3].node_count / 1000) * 1000}+ Districts</div>
      </h1>)}
       <p id='sociomapvideo'>SocioMap organizes dynamic and complex category systems commonly used by social scientists and policymakers, including ethnicities, languages, religions, and political districts. Each of these systems includes thousands of categories encoded in diverse, dynamic and incompatible ways across a growing corpus of thousands of datasets. SocioMap helps organize these categories so that users can merge diverse datasets for novel analyses.</p>
    <div>
       <Link id='sociomapvideo' to='/sociomap/explore' className='btn'>Explore</Link>
      <Link id='sociomapvideo' to='/sociomap/translate' className='btn'>Translate</Link>
    </div>
    </div>
    </div>
  )
}

export default Video