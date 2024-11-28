import React, { useEffect, useState } from "react";
import "./SponsoredEventCard.css";
import CreatorImg from "../images/user.svg";

const SponsoredEventCard = ({ event }) => {
  const { description, date, field, business_subject } = event;
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [type_of_sport, setSport] = useState("");

      // Dohvaćanje lokacije na temelju field ID-a
      useEffect(() => {
        const fetchLocation = async () => {
          try {
            const response = await fetch(`http://127.0.0.1:8000/api/advertisement/field/${field}/`);
            const data = await response.json();
            setLocation(data.location); 
          } catch (error) {
            console.error("Error fetching location:", error);
          }
        };
    
        if (field) {
          fetchLocation();
        }
      }, [field]); 

      // Dohvaćanje imena na temelju business_subject ID-a
      useEffect(() => {
        const fetchName = async () => {
          try {
            const response = await fetch(`http://127.0.0.1:8000/api/advertisement/businesssubject/${business_subject}/`);
            const data = await response.json();
            setName(data.business_name); 
          } catch (error) {
            console.error("Error fetching location:", error);
          }
        };
    
        if (business_subject) {
          fetchName();
        }
      }, [business_subject]);


      // Dohvaćanje sporta na temelju field ID-a
      useEffect(() => {
        const fetchSport = async () => {
          try {
            const response = await fetch(`http://127.0.0.1:8000/api/advertisement/sport/${field}/`);
            const data = await response.json();
            setSport(data.type_of_sport); 
          } catch (error) {
            console.error("Error fetching type_of_sport:", error);
          }
        };
    
        if (field) {
          fetchSport();
        }
      }, [field]); 
      

  return (
    <div className="SponsoredEventCard-Okvir">
      <header className="SponsoredEventCard-Header" />
      <div className="SponsoredEventCard-body">
        <div className="SponsoredEventCard-user">
          <img src={CreatorImg} className="creator-image" alt="Creator" />
          <div className="Naslov">
            {description}
            <div className="createdBy"> by @{name}</div>
          </div>
        </div>
        <div className="Opis">
          <p><strong>Datum:</strong> {date}</p>
          <p><strong>Lokacija:</strong> {location}</p>
          <p><strong>Sport:</strong> {type_of_sport}</p>
        </div>
        <div className="EventCard-buttons">
          <button className="EventCard-button">Pregled</button>
        </div>
      </div>
    </div>
  );
};

export default SponsoredEventCard;
