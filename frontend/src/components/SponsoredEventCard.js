import React from "react";
import "./SponsoredEventCard.css";
import CreatorImg from "../images/user.svg";

const SponsoredEventCard = ({ event }) => {
  const { description, date, field, creator } = event;

  return (
    <div className="SponsoredEventCard-Okvir">
      <header className="SponsoredEventCard-Header" />
      <div className="SponsoredEventCard-body">
        <div className="SponsoredEventCard-user">
          <img src={CreatorImg} className="creator-image" alt="Creator" />
          <div className="Naslov">
            {description}
            <div className="createdBy"> by @{creator}</div>
          </div>
        </div>
        <div className="Opis">
          <p><strong>Datum:</strong> {date}</p>
          <p><strong>Lokacija:</strong> {field}</p>
        </div>
        <div className="EventCard-buttons">
          <button className="EventCard-button">Pregled</button>
        </div>
      </div>
    </div>
  );
};

export default SponsoredEventCard;
