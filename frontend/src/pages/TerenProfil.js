import React, { useState, useEffect } from "react";
import axios from "axios";
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import './TerenProfil.css';

const TerenProfil = () => {
  const path = window.location.pathname;
  const fieldId = path.split("/")[2]; 

  const [field, setField] = useState(null);

  useEffect(() => {
    const fetchField = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/field/id/${fieldId}/`);
        setField(response.data);
      } catch (error) {
        console.error("Greška pri dohvaćanju terena:", error);
      }
    };

    fetchField();
  }, [fieldId]);

  if (!field) {
    return <p>Učitavanje...</p>;
  }

  return (
    <div>
      <MenuBar variant={["registered"]} search={true} />
      <div className="teren-profil">
        <h1>Pregled terena</h1>
        <div className="profile-content">
          <div className="image-container">
            <img src={`http://127.0.0.1:8000${field.image}`} alt="Teren" />
          </div>
          <div className="info-container">
            <p><strong>Lokacija:</strong> {field.location}</p>
            <p><strong>Tacna lokacija:</strong> {field.precise_location}</p>
            <div>
            <strong>Sportovi: </strong> 
            {field.sports.map(sport => (
            <span key={sport.id} style={{ fontSize: '18px' }}>
            {sport.name}
            </span>
            )).reduce((prev, curr) => [prev, ', ', curr])}
            </div>
            <p><strong>Status:</strong> {field.is_suspended ? 'Suspendovan' : 'Aktivan'}</p>
            <p><strong>Geografska sirina:</strong> {field.latitude}</p>
            <p><strong>Geografska duzina:</strong> {field.longitude}</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TerenProfil;
