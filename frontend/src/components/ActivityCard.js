import React, { useEffect, useState } from "react";
import "./ActivityCard.css"; // Dodajte stilove


const ActivityCard = ({ activity }) => {
  const { description, date, field,titel } = activity;
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [sports, setSport] = useState("");

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

      

      // Dohvaćanje sporta na temelju field ID-a
      useEffect(() => {
        const fetchSport = async () => {
          try {
            const response = await fetch(`http://127.0.0.1:8000/api/advertisement/sports/${field}/`);
            const data = await response.json();
            setSport(data.sports); 
          } catch (error) {
            console.error("Error fetching type_of_sport:", error);
          }
        };
    
        if (field) {
          fetchSport();
        }
      }, [field]); 
      
  return (
    <div className="activity-card">
      <h3>{activity.titel}</h3>
      <p><strong>Opis:</strong> {activity.description}</p>
      <p><strong>Sportovi:</strong> {sports.length > 0 ? sports.join(", ") : "Nema sportova"}</p>
      <p><strong>Datum:</strong> {activity.date}</p>
      <p><strong>Broj učesnika:</strong> {activity.NumberOfParticipants}</p>
      <p><strong>Lokacija:</strong> {location}</p>

    </div>
  );
};

export default ActivityCard;
