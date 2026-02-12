import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './video.css'

import mainvideo from "../assets/world.webm"

const Video = ({ database }) => {
    const [displayData, setDisplayData] = useState([]);
    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/homepagecount/${database}`, {
            method: "GET"
        })
            .then(response => response.json())
            .then(data => {
                setDisplayData(data)
            })
            .catch(err => console.error("Failed to fetch progress", err));
    }, [database]);

    const archamaptext = "ArchaMap organizes categories of material objects used in archaeology, including sites, ceramic types, lithic and projectile point types, and faunal types. Our hope in the future is to extend CatMapper’s capabilities to other classes of complex, dynamic categories."

    const sociomaptext = "SocioMap organizes dynamic and complex category systems commonly used by social scientists and policymakers, including ethnicities, languages, religions, and political districts. Each of these systems includes thousands of categories encoded in diverse, dynamic and incompatible ways across a growing corpus of thousands of datasets. SocioMap helps organize these categories so that users can merge diverse datasets for novel analyses."

    const maintext = database == "archamap" ?
        archamaptext
        : sociomaptext

    const mainHeader = displayData.length > 0 && (
        <div className="header-stats" style={{ display: 'flex', gap: '20px' }}>
            {displayData.map((item) => (
                <div key={item.label}>
                    {/* Rounds down to nearest 1000 and adds the display name */}
                    {Math.floor(item.node_count / 1000) * 1000}+ {item.display}
                </div>
            ))}
        </div>
    );


    return (
        <div className='hero' style={{ marginBottom: "2rem" }}>
            <video autoPlay loop muted playsInline controls={false} id='video'>
                <source src={mainvideo} type='video/mp4' />
            </video>
            <div className='maincontent'>
                <h1 id="mainvideo" className="stacked">{mainHeader}</h1>
                <p id='mainvideo'>{maintext}</p>
                <div>
                    <Link id='mainvideo' to={`/${database}/explore`} className='btn'>Explore</Link>
                    <Link id='mainvideo' to={`/${database}/translate`} className='btn'>Translate</Link>
                </div>
            </div>
        </div>
    )
}

export default Video