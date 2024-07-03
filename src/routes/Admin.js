import React from 'react'
import Navbar from '../components/Navbar'
import "../components/admin.css"

 const AdminPage = () => {
   return (
     <div  style={{backgroundColor:"white", height:700}}>
         <Navbar />
         <div class="admin">
         <div class="perspective-text">
      <div class="perspective-line">
        <p class="admintext"></p>
        <p class="admintext">You made it</p>
      </div>
      <div class="perspective-line">
        <p class="admintext">You made it</p>
        <p class="admintext">to the</p>
      </div>
      <div class="perspective-line">
        <p class="admintext">to the</p>
        <p class="admintext">BIG</p>
      </div>
      <div class="perspective-line">
        <p class="admintext">BIG</p>
        <p class="admintext">Leagues</p>
      </div>
      <div class="perspective-line">
        <p class="admintext">Leagues</p>
        <p> class="admintext"</p>
      </div>
    </div>
    </div>
     </div>
   )
 }


export default AdminPage;