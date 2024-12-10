import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TerenProfil.css';
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";

const TerenProfil = () => {
    const [id, setID]=useState({
        "pk": -1,
      });

    return (
        <body>
            <MenuBar variant={[id!==-1 ? "registered" : "unregistered"]} search={true}  />
            
        </body> 
    );
};

export default TerenProfil;