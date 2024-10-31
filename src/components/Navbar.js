import React,{useState} from 'react'
import { Link } from 'react-router-dom'
import {FaBars,FaTimes} from 'react-icons/fa'
import './NavbarStyles.css'
import image from '../assets/white.png'
import image1 from '../assets/slogo.png'
import Button from '@mui/material/Button';
import { useAuth } from './AuthContext';

const Navbar = () => {
    const[click, setClick] = useState(false)
    const handleClick = () => setClick(!click)
    const { authLevel, logout } = useAuth();

  return (
    <div className ='header' style={{position:"relative"}}>
        <div className='image' style={{margin: 0, paddingTop: 10, border: 0,}}>
        <Link to ='/'><img src = {image} width={100} height={70}></img></Link>
        </div>
        <div className='image1' style={{margin: 0, paddingTop: 10,paddingLeft:300, border: 0,}}>
        <Link to ='/sociomap'><img src = {image1} width={150} height={70}></img></Link>
        </div>
        <ul className={click ? 'nav-menu active' : 'nav-menu'} style={{color:"white"}}>
            <li >
                <Link id='sociomapnavbar' to='/sociomap'>Home</Link>
            </li>
            <li >
                <Link id='sociomapnavbar' to='/sociomap/explore'>Explore</Link>
            </li>
            <li className='dropdown' >
            <Link id='sociomapnavbar' > Translate <span className="dropdown-arrow">&#x25BC;</span></Link>
            <div className='dropdown-content' style={{ whiteSpace: 'nowrap' }} >
                <Link to='/sociomap/translate'>Propose Translation</Link>
                {authLevel > 0 &&<Link to='/sociomap/uploadtranslate'>Upload Translation</Link>}
                </div>
            </li>
            <li >
                <Link id='sociomapnavbar'  to='/sociomap/merge'>Merge</Link>
            </li>
            {/* {authLevel > 0 && <Link id='sociomapnavbar' to="/advanced" style={{marginLeft:20}}>Advanced</Link>} */}

            {authLevel > 1 && <Link id='sociomapnavbar'  to="/admin" style={{marginLeft:20}}>Admin</Link>}
            <li className='dropdown'>
            {/* <Link id='sociomapnavbar'>Help <span className="dropdown-arrow">&#x25BC;</span></Link>
        <div className='dropdown-content'>
            <Link to='/sociomap/help/api-guide'>API Guide</Link>
            <Link to='/sociomap/help/user-guide'>User Guide</Link>
        </div> */}
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
            {authLevel > 0 && <Button variant="outlined" onClick={logout}>Logout</Button>}
        </ul>
        <div className='hamburger' onClick={handleClick}>
            {click ? (<FaTimes size={20} style={{color: '#fff'}} />) : (<FaBars size={20} style={{color: '#fff'}} />)}
        </div>
        
    </div>
  )
}

export default Navbar