import {useEffect,useState} from 'react'
import {Link} from 'react-router-dom'
import './arch_video.css'

import cvideo from "../assets/new.mp4"

const Video = () => {

  const [displayData, setDisplayData] = useState([]);
  
    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/homepagecount?database=ArchaMap`, {
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
        <video autoPlay loop muted id='video'>
            <source src={cvideo} type='video/mp4' />
        </video>
    <div className='archacontent'>
      {displayData.length > 0 &&
      (<h1 id="sociomapvideo" className="stacked">
        <div>{Math.floor(displayData[0].node_count / 1000) * 1000}+ Sites</div>
        <div>{Math.floor(displayData[3].node_count / 1000) * 1000}+ Artifact Types</div>
        <div>{Math.floor(displayData[1].node_count / 1000) * 1000}+ Periods</div>
        <div>{Math.floor(displayData[2].node_count / 1000) * 1000}+ Cultures</div>
      </h1>)}
       <p id='sociomapvideo'>ArchaMap organizes categories of material objects used in archaeology, including sites, ceramic types, lithic and projectile point types, and faunal types. Our hope in the future is to extend CatMapper’s capabilities to other classes of complex, dynamic categories.</p>
    <div>
       <Link id='sociomapvideo' to='/archamap/explore' className='btn'>Explore</Link>
      <Link id='sociomapvideo' to='/archamap/translate' className='btn'>Translate</Link>
    </div>
    </div>
    </div>
  )
}

export default Video