import React, { useState } from "react";
import "./EditEventCard.css";
import CreatorImg from "../images/user.svg";
import axios from "axios";



const EditEventCard = (user, isVisible) => {

  const [eventData, setEventData] = useState({
    'name': '',
    'description':''
  });

  const createNew = async () => {
    await axios.put('http://localhost:8000/api/client//edit/', eventData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((response) => {
        console.log("Data updated successfully:", response.data);
      })
      .catch((error) => {
        console.error("There was an error updating the data:", error);
        alert("Doslo je do greške prilikom ažuriranja...");
      });
  };

  return ( 
    <div className='dimmer'>
    <form className="EditEventCard-form">
      <header className="EditEventCard-Header" />
      <div className="EditEventCard-body">
        <div className="EditEventCard-user">
          <img src={CreatorImg} className="creator-image" alt="Creator" />
          <div className="edit-event-card-header">
            <input 
                className="UnosInformacijaDogadjaja"
                value={eventData.name}
                type="text" 
                placeholder="Unesi naslov događaja"
                required
                onChange={(e) => setEventData(prevData=>({...prevData, name: e.target.value }))}
            />
            <div className="createdBy"> by @{user.username}</div>
          </div>
        </div>
        <div className="Opis">
        <textarea
            className="UnosInformacijaDogadjaja"
            rows="4"
            cols="46"
            placeholder="Unesi opis događaja..."
            minLength="10"
            value={eventData.description}
            required
            onChange={(e) => setEventData(prevData=>({...prevData, description: e.target.value }))}
            />
        <label className="EditEventLabel"> Datum: </label>
        <input className="UnosInformacijaDogadjaja"
        id="UnosDatumaDogadjaja-input"
        type="date" 
        required/>
        <label className="EditEventLabel"> Lokacija: </label>
        <input 
         className="UnosInformacijaDogadjaja"
         type="text"
         placeholder="Odaberi teren"
         required />
        </div>
        <div className="EventCard-buttons">
          <button 
          className="SpasiIzmjeneDogadjaja-button "
          type="select">
            Spasi izmjene</button>
            
        </div>
      </div>
    </form>
    
  </div>
  );
};

export default EditEventCard;