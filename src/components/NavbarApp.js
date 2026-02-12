import React, { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
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
        <div className='header' style={{ position: "relative", minHeight: "10vh" }}>
            {/* LEFT SECTION: Main Catmapper Logo */}
            <div className='image'>
                <Link to='/'>
                    <img src={image} style={{ height: "50px", width: "auto" }} alt="Catmapper" />
                </Link>
            </div>

            {/* MIDDLE SECTION: Database Specific Logo */}
            <div className='logo' style={{ flexGrow: 1, textAlign: 'center' }}>
                <Link to={`/${database}`}>
                    <img src={currentLogo} style={{ height: "50px", width: "auto" }} alt="App Logo" />
                </Link>
            </div>

            {/* RIGHT SECTION: Navigation */}
            <ul className={click ? 'nav-menu active' : 'nav-menu'} style={{
                display: "flex",
                listStyle: "none",
                alignItems: "center",
                margin: 0
            }}>
                <li>
                    <Link id='navbar' to={`/${database}`}>Home</Link>
                </li>
                <li>
                    <Link id='navbar' to={`/${database}/explore`}>Explore</Link>
                </li>
                <li>
                    <Link id='navbar' to={`/${database}/translate`}>Translate</Link>
                </li>
                <li >
                    <Link id='navbar' to={`/${database}/merge`}>Merge</Link>
                </li>
                {authLevel > 0 && <li className='dropdown' >
                    <Link id='navbar' > Edit <span className="dropdown-arrow">&#x25BC;</span></Link>
                    <div className='dropdown-content' style={{ whiteSpace: 'nowrap' }} >
                        <Link to={`/${database}/edit`}>Edit</Link>
                        {authLevel > 1 && <Link to={`/${database}/admin`}>Admin</Link>}
                    </div>
                </li>}
                <li className='dropdown'>
                    <a
                        id="navbar"
                        href="https://catmapper.org/help/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Help
                    </a>
                </li>
                {authLevel === 0 && <Link to={`/${database}/login`}><Button variant="outlined">Login</Button></Link>}
                {authLevel > 0 && <Link to={`/${database}/profile`}><Button variant="outlined">Profile</Button></Link>}
                {authLevel > 0 && <Button variant="outlined" onClick={logout}>Logout</Button>}
            </ul>
            <div className='hamburger' onClick={handleClick}>
                {click ? <FaTimes size={20} style={{ color: '#fff' }} /> : <FaBars size={20} style={{ color: '#fff' }} />}
            </div>

        </div>
    )
}

export default NavbarApp
