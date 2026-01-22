import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import './NavbarStyles.css'
import image from '../assets/white.png'

const Navbar = () => {
    const [click, setClick] = useState(false)
    const handleClick = () => setClick(!click)

    return (
        <div className='header' style={{ position: "relative" }}>
            <div className='image' style={{ margin: 0, paddingTop: 20, border: 0, }}>
                <Link to='/'><img src={image} width={100} height={70}></img></Link>
            </div>
            <ul className={click ? 'nav-menu active' : 'nav-menu'} style={{ color: "white" }}>
                <li >
                    <Link id='sociomapnavbar' to='/'>Home</Link>
                </li>
                <li >
                    <Link id='sociomapnavbar' to='/people'>People</Link>
                </li>
                <li >
                    <Link id='sociomapnavbar' to='/news'>News</Link>
                </li>
                <li >
                    <Link id='sociomapnavbar' to='/funding'>Funding</Link>
                </li>
                <li >
                    <Link id='sociomapnavbar' to='/terms'>Terms</Link>
                </li>
                <li >
                    <Link id='sociomapnavbar' to='/citation'>Citation</Link>
                </li>
                <li >
                    <Link id='sociomapnavbar' to='/contact'>Contact</Link>
                </li>
                <li >
                    <Link id='sociomapnavbar' to='/download'>Download</Link>
                </li>

            </ul>
            <div className='hamburger' onClick={handleClick}>
                {click ? (<FaTimes size={20} style={{ color: '#fff' }} />) : (<FaBars size={20} style={{ color: '#fff' }} />)}
            </div>

        </div>
    )
}

export default Navbar