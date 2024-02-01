import React from 'react'
import ArchNavbar from '../components/arch_navbar'
import Tableclick from '../components/test_tableclick'
import { useParams } from 'react-router-dom'


const ArchaMapclick = () => {
  return (
    <div>
      <ArchNavbar />
      <Tableclick cmid ={useParams()}/>
    </div>
  )
}

export default ArchaMapclick