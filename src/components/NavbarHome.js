import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import './NavCommon.css';
import './NavbarHome.css'
import catmapperWhiteSmall from '../assets/catmapperWhite_small.webp';

const Navbar = () => {
    const [click, setClick] = useState(false)
    const handleClick = () => setClick(!click)

    return (
        <div className='cm-nav cm-nav--home'>
            <div className='cm-nav-image'>
                <Link to='/'><img src={catmapperWhiteSmall} width={100} height={70} alt="CatMapper logo"></img></Link>
            </div>
            <ul className={click ? 'cm-nav-menu active' : 'cm-nav-menu'}>
                <li >
                    <Link className='cm-nav-link' to='/'>Home</Link>
                </li>
                <li >
                    <Link className='cm-nav-link' to='/people'>People</Link>
                </li>
                <li >
                    <Link className='cm-nav-link' to='/news'>News</Link>
                </li>
                <li >
                    <Link className='cm-nav-link' to='/funding'>Funding</Link>
                </li>
                <li >
                    <Link className='cm-nav-link' to='/terms'>Terms</Link>
                </li>
                <li >
                    <Link className='cm-nav-link' to='/privacy'>Privacy</Link>
                </li>
                <li >
                    <Link className='cm-nav-link' to='/citation'>Citation</Link>
                </li>
                <li >
                    <Link className='cm-nav-link' to='/contact'>Contact</Link>
                </li>
                <li >
                    <Link className='cm-nav-link' to='/download'>Download</Link>
                </li>

            </ul>
            <div className='cm-nav-hamburger' onClick={handleClick}>
                {click ? (<FaTimes size={20} className='cm-nav-icon' />) : (<FaBars size={20} className='cm-nav-icon' />)}
            </div>

        </div>
    )
}

export default Navbar
