import React, { useEffect, useState } from "react";
import "./SponsoredEventCardForBusinessSubject.css";
import CreatorImg from "../images/user.svg";
import { BsThreeDotsVertical } from "react-icons/bs";

const SponsoredEventCardForBusinessSubject = ({ event}) => {
  const { id, name, date, field, business_subject, sport } = event;
  const [location, setLocation] = useState("");
  const [name1, setName] = useState("");
  const [sports, setSport] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

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
      

  const toggleMenu = () => setMenuVisible(!menuVisible);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".event-card-menu")) {
        setMenuVisible(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);  

    // Funkcija za brisanje oglasa
    const deleteEvent = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/advertisement/delete/${id}/`, {
          method: "DELETE",
        });
  
        if (response.ok) {
          alert("Događaj je uspješno obrisan!");
          window.location.reload();
        } else {
          console.error("Failed to delete event");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    };

  return (
    <div className="SponsoredEventCard-Okvir-bs">
      <header className="SponsoredEventCard-Header" />
      <div className="SponsoredEventCard-body">
        <div className="SponsoredEventCard-user">
          <img src={CreatorImg} className="creator-image" alt="Creator" />
          <div className="Naslov">
            {name}
            <div className="createdBy"> by @{name1}</div>
          </div>
          <div className="event-card-menu">
            <BsThreeDotsVertical className="menu-icon" onClick={toggleMenu} />
            {menuVisible && (
              <div className="dropdown-menu">
              <button onClick={() => console.log(`Edit event ${id}`)}>Uredi</button>
              <button onClick={deleteEvent}>Obriši</button> 
            </div>
            )}
          </div>
        </div>
        <div className="Opis">
          <p><strong>Lokacija:</strong> {location}</p>
          <p><strong>Datum:</strong> {dateOnly}</p>
          <p><strong>Vrijeme:</strong> {timeOnly}</p>
          <p><strong>Sport:</strong> {sports}</p>
        </div>
      </div>
    </div>
  );
};

export default SponsoredEventCardForBusinessSubject;
