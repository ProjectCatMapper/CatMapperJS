import React from 'react'
import Navbar from '../components/NavbarApp'
import Register from '../components/RegisterPage'
import FooterLinks from '../components/FooterLinks'
import { useParams } from 'react-router-dom'

const RegisterPage = () => {
  return (
    <>
      <div style={{ backgroundColor: "white" }}>
        <Navbar {...useParams()} />
        <Register {...useParams()} />
      </div>
      <FooterLinks />
    </>
  )
}

export default RegisterPage
