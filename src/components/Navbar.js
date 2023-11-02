import React,{useState} from 'react'
import { Link, NavLink } from 'react-router-dom'
import {FaBars,FaTimes} from 'react-icons/fa'
import './NavbarStyles.css'
import image from '../assets/white.png'
import image1 from '../assets/slogo.png'
import LoginButton from './LoginButton'

const Navbar = () => {
    const[click, setClick] = useState(false)
    const handleClick = () => setClick(!click)

  return (
    <div className ='header' style={{position:"relative"}}>
        <div className='image' style={{margin: 0, paddingTop: 20, border: 0,}}>
        <Link to ='/'><img src = {image} width={100} height={70}></img></Link>
        </div>
        <div className='image1' style={{margin: 0, paddingTop: 20,paddingLeft:300, border: 0,}}>
        <Link to ='/Home'><img src = {image1} width={150} height={70}></img></Link>
        </div>
        <ul className={click ? 'nav-menu active' : 'nav-menu'}>
            <li>
                <Link to='/Home'>Home</Link>
            </li>
            <li>
                <Link to='/explore'>Explore</Link>
            </li>
            <li>
                <Link to='/translate'>Translate</Link>
            </li>
            <li>
                <Link style={{marginRight:10}} to='/merge'>Merge</Link>
            </li>
            <li>
            <LoginButton></LoginButton>
            </li>
        </ul>
        
        <div className='hamburger' onClick={handleClick}>
            {click ? (<FaTimes size={20} style={{color: '#fff'}} />) : (<FaBars size={20} style={{color: '#fff'}} />)}
        </div>
        
    </div>
  )
}

export default Navbar