import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import image from '../assets/white.png'
import './cat_navbar.css'
import LoginButton from './LoginButton'
import LogoutButton from './LogoutButton'

const Navbar = () => {
  const [click, setClick] = useState(false)
  const handleClick = () => setClick(!click)

  return (
    <div className='header'>
      <div className='image' style={{ margin: 0, paddingTop: 20, border: 0, }}>
        <Link to='/'><img src={image} width={100} height={70}></img></Link>
      </div>
      <ul className={click ? 'nav-menu active' : 'nav-menu'}>
        <li>
          <LoginButton></LoginButton>
        </li>
      </ul>

      <div className='hamburger' onClick={handleClick}>
        {click ? (<FaTimes size={20} style={{ color: '#fff' }} />) : (<FaBars size={20} style={{ color: '#fff' }} />)}
      </div>

    </div>
  )
}

export default Navbar