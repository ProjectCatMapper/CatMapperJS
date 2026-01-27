import React from 'react'
import Navbar from '../components/NavbarApp'
import BulkEdit from '../components/BulkEdit'

const BulkEditPage = () => {
  return (
    <div style={{ backgroundColor: "white" }}>
      <Navbar />
      <BulkEdit />
    </div>
  )
}

export default BulkEditPage;