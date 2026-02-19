import React from 'react'
import Navbar from '../components/NavbarApp'
import LoginPage from '../components/LoginPage'
import FooterLinks from '../components/FooterLinks'
import { useParams } from 'react-router-dom'

const Logins = () => {
  return (
    <>
      <div style={{ backgroundColor: "white", minHeight: "50vh" }}>
        <Navbar {...useParams()} />
        <LoginPage {...useParams()} />
      </div>
      <FooterLinks />
    </>
  )
}

export default Logins
