import React from 'react'
import Navbar from '../components/NavbarApp'
import UploadTranslat from '../components/BulkEdit'

const BulkEdit = () => {
  return (
    <div style={{ backgroundColor: "white" }}>
      <Navbar />
      <UploadTranslat />
    </div>
  )
}

export default BulkEdit;