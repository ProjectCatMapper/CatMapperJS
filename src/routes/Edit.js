import React from 'react'
import Navbar from '../components/NavbarApp'
import Edit from '../components/Edit'
import FooterLinks from '../components/FooterLinks'
import { useParams } from 'react-router-dom';

const EditPage = () => {
  return (
    <>
      <div style={{ backgroundColor: "white" }}>
        <Navbar {...useParams()} />
        <Edit {...useParams()} />
      </div>
      <FooterLinks />
    </>
  )
}

export default EditPage;
