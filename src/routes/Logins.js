import React from 'react'
import Navbar from '../components/NavbarApp'
import LoginPage from '../components/LoginPage'
import { useParams } from 'react-router-dom'

const Logins = () => {
  return (
    <div style={{ backgroundColor: "white", height: "50vh" }}>
      <Navbar {...useParams()} />
      <LoginPage {...useParams()} />
    </div>
  )
}

export default Logins