import React from 'react'
import Navbar from '../components/Navbar'
import Mergelayout from "../components/merge"

 const Merge = () => {
   return (
     <div style={{backgroundColor:"white",minHeight: "100vh", display: "flex", flexDirection: "column"}}>
         <Navbar />
         <Mergelayout />
     </div>
   )
 }

export default Merge;