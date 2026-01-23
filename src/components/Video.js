import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './video.css'

import cvideo from "../assets/world.mp4"

const Video = () => {
    const location = useLocation();
    const [displayData, setDisplayData] = useState([]);
    const database = location.pathname.includes("archamap")
        ? "archamap"
        : location.pathname.includes("sociomap")
            ? "sociomap"
            : "catmapper";
    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/homepagecount?database=${database}`, {
            method: "GET"
        })
            .then(response => response.json())
            .then(data => {
                setDisplayData(data)
            })
            .catch(err => console.error("Failed to fetch progress", err));
    }, []);

    const archamaptext = "ArchaMap organizes categories of material objects used in archaeology, including sites, ceramic types, lithic and projectile point types, and faunal types. Our hope in the future is to extend CatMapper’s capabilities to other classes of complex, dynamic categories."

    const sociomap = "SocioMap organizes dynamic and complex category systems commonly used by social scientists and policymakers, including ethnicities, languages, religions, and political districts. Each of these systems includes thousands of categories encoded in diverse, dynamic and incompatible ways across a growing corpus of thousands of datasets. SocioMap helps organize these categories so that users can merge diverse datasets for novel analyses."

    const catmapper = "atMapper organizes dynamic and complex category systems commonly used by scientists and policymakers, including ethnicities, languages, religions, political districts, political parties, and technologies. Each of these systems includes thousands of categories encoded in diverse, dynamic and incompatible ways across a growing corpus of thousands of datasets."

    const catmapperHeader = "Bringing Data Together."

    const maintext = archamaptext

    // const archamapHeader = {
    //     displayData.length > 0 &&
    //         (
    //             <div>{Math.floor(displayData[0].node_count / 1000) * 1000}+ Sites</div>
    //             <div>{Math.floor(displayData[3].node_count / 1000) * 1000}+ Artifact Types</div>
    //             <div>{Math.floor(displayData[1].node_count / 1000) * 1000}+ Periods</div>
    //             <div>{Math.floor(displayData[2].node_count / 1000) * 1000}+ Cultures</div>

    // }

    const mainHeader = catmapperHeader


    return (
        <div className='hero' style={{ marginBottom: "2rem" }}>
            <video autoPlay loop muted playsInline controls={false} id='video'>
                <source src={cvideo} type='video/mp4' />
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