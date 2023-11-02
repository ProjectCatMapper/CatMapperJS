import React from 'react'
import Navbar from '../components/Navbar'
import Tableclick from '../components/tableclick'
import { useParams } from 'react-router-dom'


const Sociomapclick = () => {
  return (
    <div>
      <Navbar />
      <Tableclick socioid ={useParams()}/>
    </div>
  )
}

export default Sociomapclick