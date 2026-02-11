import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import './NavbarHome.css'
import catmapperLogo from '../assets/catmapperWhite.webp'
import sociomapLogo from '../assets/sociomapLogo.webp'
import Button from '@mui/material/Button';
import { useAuth } from './AuthContext';

const Navbar = () => {
    const [click, setClick] = useState(false)
    const handleClick = () => setClick(!click)
    const { authLevel, logout } = useAuth();

    return (
        <div className='header' style={{ position: "relative", minHeight: "10vh" }}>
            <div className='catmapperLogo' style={{ margin: 0, paddingTop: 10, border: 0, }}>
                <Link to='/'><img src={catmapperLogo} width="100vw" height="70vh"></img></Link>
            </div>
            <div className='sociomapLogo' style={{ margin: 0, paddingTop: 10, paddingLeft: 300, border: 0, }}>
                <Link to='/sociomap'><img src={sociomapLogo} width="150vw" height="70vh"></img></Link>
            </div>
            <ul className={click ? 'nav-menu active' : 'nav-menu'} style={{ color: "white" }}>
                <li >
                    <Link id='sociomapnavbar' to='/sociomap'>Home</Link>
                </li>
                <li >
                    <Link id='sociomapnavbar' to='/sociomap/explore'>Explore</Link>
                </li>
                <li >
                    <Link id='sociomapnavbar' to='/sociomap/translate'>Translate</Link>
                </li>
                <li >
                    <Link id='sociomapnavbar' to='/sociomap/merge'>Merge</Link>
                </li>
                {authLevel > 0 && <li className='dropdown' >
                    <Link id='sociomapnavbar' > Edit <span className="dropdown-arrow">&#x25BC;</span></Link>
                    <div className='dropdown-content' style={{ whiteSpace: 'nowrap' }} >
                        <Link to='/sociomap/uploadtranslate'>Bulk Edit</Link>
                        {authLevel > 1 && <Link to='/sociomap/admin'>Admin</Link>}
                    </div>
                </li>}
                <li className='dropdown'>

                    <a
                        id="sociomapnavbar"
                        href="https://catmapper.org/help/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Help
                    </a>
                </li>
                {authLevel === 0 && <Link to="/login"><Button variant="outlined">Login</Button></Link>}
                {authLevel > 0 && <Button variant="outlined" onClick={logout} >Logout</Button>}
            </ul>
            <div className='hamburger' onClick={handleClick}>
                {click ? (<FaTimes size={20} style={{ color: '#fff' }} />) : (<FaBars size={20} style={{ color: '#fff' }} />)}
            </div>

        </div>
    )
}

export default Navbar