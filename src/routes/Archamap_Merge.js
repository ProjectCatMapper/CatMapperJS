import React from 'react'
import Navbar from '../components/arch_navbar'
import Mergelayout from "../components/merge"

 const Archamap_Merge = () => {
   return (
     <div style={{backgroundColor:"white",minHeight: "100vh", display: "flex", flexDirection: "column"}}>
         <Navbar />
         <Mergelayout />
     </div>
   )
 }

export default Archamap_Merge;