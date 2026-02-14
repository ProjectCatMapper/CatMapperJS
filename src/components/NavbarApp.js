import React, { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import './NavCommon.css';
import './NavbarApp.css'
import image from '../assets/catmapperWhite_small.webp'
import Button from '@mui/material/Button';
import { useAuth } from './AuthContext';
import { APP_LOGOS } from './Logos';
import { Link } from 'react-router-dom';

const NavbarApp = ({ database }) => {
    const currentLogo = APP_LOGOS[database] || APP_LOGOS[database];
    const [click, setClick] = useState(false)
    const handleClick = () => setClick(!click)
    const { authLevel, logout } = useAuth();

    return (
        <div className='cm-nav cm-nav--app'>
            {/* LEFT SECTION: Main Catmapper Logo */}
            <div className='cm-nav-image'>
                <Link to='/'>
                    <img src={image} alt="Catmapper" />
                </Link>
            </div>

            {/* MIDDLE SECTION: Database Specific Logo */}
            <div className='cm-nav-logo cm-nav-app-logo'>
                <Link to={`/${database}`}>
                    <img src={currentLogo} alt="App Logo" />
                </Link>
            </div>

            {/* RIGHT SECTION: Navigation */}
            <div className='cm-nav-right'>
                <ul className={click ? 'cm-nav-menu active' : 'cm-nav-menu'}>
                    <li>
                        <Link className='cm-nav-link' to={`/${database}`}>Home</Link>
                    </li>
                    <li>
                        <Link className='cm-nav-link' to={`/${database}/explore`}>Explore</Link>
                    </li>
                    <li>
                        <Link className='cm-nav-link' to={`/${database}/translate`}>Translate</Link>
                    </li>
                    <li >
                        <Link className='cm-nav-link' to={`/${database}/merge`}>Merge</Link>
                    </li>
                    {authLevel > 0 && <li className='cm-nav-dropdown' >
                        <span className='cm-nav-link'> Edit <span className="cm-nav-dropdown-arrow">&#x25BC;</span></span>
                        <div className='cm-nav-dropdown-content'>
                            <Link to={`/${database}/edit`}>Edit</Link>
                            {authLevel > 1 && <Link to={`/${database}/admin`}>Admin</Link>}
                        </div>
                    </li>}
                    <li className='cm-nav-dropdown'>
                        <a
                            className='cm-nav-link'
                            href="https://catmapper.org/help/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Help
                        </a>
                    </li>
                    {authLevel === 0 && <Link className='cm-nav-auth-btn' to={`/${database}/login`}><Button variant="outlined">Login</Button></Link>}
                    {authLevel > 0 && <Link className='cm-nav-auth-btn' to={`/${database}/profile`}><Button variant="outlined">Profile</Button></Link>}
                    {authLevel > 0 && <Button className='cm-nav-auth-btn' variant="outlined" onClick={logout}>Logout</Button>}
                </ul>
                <div className='cm-nav-hamburger' onClick={handleClick}>
                    {click ? <FaTimes size={20} className='cm-nav-icon' /> : <FaBars size={20} className='cm-nav-icon' />}
                </div>
            </div>

        </div>
    )
}

export default NavbarApp
