import React from "react";
import "./EditEventCard.css";
import CreatorImg from "../images/user.svg";



const EditEventCard = () => {
  return (
    <form className="SponsoredEventCard-form">
      <header className="SponsoredEventCard-Header" />
      <div className="SponsoredEventCard-body">
        <div className="SponsoredEventCard-user">
          <img src={CreatorImg} className="creator-image" alt="Creator" />
          <div className="Naslov">
            <input 
                className="UnosInformacijaDogadjaja"
                type="text" 
                placeholder="Unesi naslov"
                required
            />
            <div className="createdBy"> by @username</div>
          </div>
        </div>
        <div className="Opis">
        <textarea
            className="UnosInformacijaDogadjaja"
            rows="4"
            cols="46"
            placeholder="Unesi opis događaja..."
            minLength="10"
            required/>
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
  );
};

export default EditEventCard;