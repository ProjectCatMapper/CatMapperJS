import React from 'react'
import Navbar from '../components/NavbarApp'
import Sociomap4 from '../components/Map4';

const Map4 = () => {
  return (
    <div>
      <Navbar database="sociomap" />
      <Sociomap4 />
    </div>
  )
}

export default Map4
