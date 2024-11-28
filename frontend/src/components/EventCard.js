import React from "react";
import "./EventCard.css";

const EventCard = () => {
  return (
    <div className="Okvir">
      <header className="EventCard-Header">
        <div className="Naslov">Naslov</div>
        <div className="Opis">
          lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem
          ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum
          lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem
          ipsum lorem ipsum lorem ipsum lorem ipsum
        </div>
      </header>
      <div className="EventCard-buttons">
        <button className="EventCard-button">Pregled</button>
      </div>
    </div>
  );
};

export default EventCard;
