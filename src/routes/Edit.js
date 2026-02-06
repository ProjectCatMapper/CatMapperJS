import React from 'react'
import Navbar from '../components/NavbarApp'
import Edit from '../components/Edit'
import { useParams } from 'react-router-dom';

const EditPage = () => {
  return (
    <div style={{ backgroundColor: "white" }}>
      <Navbar {...useParams()} />
      <Edit {...useParams()} />
    </div>
  )
}

export default EditPage;