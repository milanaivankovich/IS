import React, { useEffect, useState } from "react";
import "./SponsoredEventCard.css";
import CreatorImg from "../images/user.svg";

const SponsoredEventCard = ({ event }) => {
  const { name, description, date, field, business_subject, sport } = event;
  const [location, setLocation] = useState("");
  const[preciseLocation, setPreciseLocation] = useState("");
  const [name1, setName] = useState("");
  const [sports, setSport] = useState("");

  const formattedDate = new Date(date);

formattedDate.setHours(formattedDate.getHours() - 1);
const dateOnly = formattedDate.toLocaleDateString("en-GB"); // Format: DD/MM/YYYY
const timeOnly = formattedDate.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' }); // Format: HH:MMFormat: HH:MM

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

      //Dohvaćanje precizne lokacije na temelju field ID-a
      useEffect(() => {
        const fetchPreciseLocation = async () => {
          try {
            const response = await fetch(`http://127.0.0.1:8000/api/advertisement/field/${field}/`);
            const data = await response.json();
            setPreciseLocation(data.precise_location); 
          } catch (error) {
            console.error("Error fetching precise location:", error);
          }
        };
    
        if (field) {
          fetchPreciseLocation();
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


      // Dohvaćanje sporta na temelju njegovog ID-a
      useEffect(() => {
        const fetchSport = async () => {
          try {
            const response = await fetch(`http://127.0.0.1:8000/api/sport/${sport}/`);
            const data = await response.json();
            setSport(data.sports); 
          } catch (error) {
            console.error("Error fetching type_of_sport:", error);
          }
        };
    
        if (sport) {
          fetchSport();
        }
      }, [sport]); 
       const handleLocationClick = (fieldId) => {
        window.location.href = `/teren-profil/${fieldId}`;
      };

  return (
    <div className="SponsoredEventCard-Okvir">
      <header className="SponsoredEventCard-Header" />
      <div className="SponsoredEventCard-body">
        <div className="SponsoredEventCard-user">
          <img src={CreatorImg} className="creator-image" alt="Creator" />
          <div className="Naslov">
            {name}
            <div className="createdBy"> by @{name1}</div>
          </div>
        </div>
        <div className="Opis">
          <p><strong>Opis:</strong> {description}</p>
          <p><strong>Sport:</strong> {sports}</p>
          <p><strong>Datum:</strong> {dateOnly}</p>
          <p><strong>Vrijeme:</strong> {timeOnly}</p>
          <p>
           <strong>Lokacija:</strong>{" "}
             {location ? (
            <span
               className="clickable-location"
              onClick={() => handleLocationClick(field)}
            >
           {location}- {preciseLocation}
            </span>
   ) : (
    "Učitavanje..."
  )}
          </p>
        </div>
        <div className="EventCard-buttons">
          <button className="EventCard-button">Pregled</button>
        </div>
      </div>
    </div>
  );
};

export default SponsoredEventCard;