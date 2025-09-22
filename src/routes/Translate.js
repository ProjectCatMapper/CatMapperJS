import React from 'react'
import Navbar from '../components/Navbar'
import Sociotranslate from '../components/sociotranslate'

 const Translate = () => {
   return (
     <div style={{backgroundColor:"white",display: 'flex',
    flexDirection: 'column', height:"100vh"}}>
         <Navbar />
         <Sociotranslate />
     </div>
   )
 }

export default Translate;