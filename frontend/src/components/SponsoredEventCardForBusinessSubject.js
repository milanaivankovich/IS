import React, { useEffect, useState } from "react";
import "./SponsoredEventCard.css";
import CreatorImg from "../images/user.svg";
import { BsThreeDotsVertical } from "react-icons/bs";
import NewAdvertisementCard from "./NewAdvertisementCard";
import { IoIosCloseCircle } from "react-icons/io";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faClock,faRunning, faMapMarkerAlt, faFutbol, faUser, faBasketballBall, faTableTennis, faVolleyballBall, faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";

const SponsoredEventCardForBusinessSubject = ({ user, event, currentUser }) => {
  const { id, name, description, date, field, business_subject, sport } = event;
  const [location, setLocation] = useState("");
  const [preciseLocation, setPreciseLocation] = useState("");
  const [name1, setName] = useState("");
  const [sports, setSport] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [picture, setPicture] = useState("");
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
    if (user.nameSportOrganization === (currentUser.nameSportOrganization || currentUser.username)) {
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
    } else {
      alert("Nemate dozvolu za brisanje.");
      window.location.reload();
    }
  };

  const showEvent = () => {
    if (user.nameSportOrganization === (currentUser.nameSportOrganization || currentUser.username)) {
      setIsEditVisible(true);
    } else {
      alert("Nemate dozvolu za uređivanje.");
      window.location.reload();
    }
  };

  const handleLocationClick = (fieldId) => {
    window.location.href = `/teren-profil/${fieldId}`;
  };

  //Dohvacanje slike business-subjecta
  useEffect(() => {
    const fetchPicture = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/business-subject/${business_subject}/`);
        const data = await response.json();
        setPicture(data.profile_picture ? `http://127.0.0.1:8000` + data.profile_picture : CreatorImg);
      } catch (error) {
        console.error("Error fetching picture:", error);
      }
    };

    if (business_subject) {
      fetchPicture();
    }
  }, [business_subject]);

  const sportIcons = {
    fudbal: faFutbol,
    kosarka: faBasketballBall,
    tenis: faTableTennis,
    odbojka: faVolleyballBall,
  };

  return (
    <div className="SponsoredEventCard-Okvir">
      <header className="SponsoredEventCard-Header" />
      <div className="SponsoredEventCard-body">
        <div className="SponsoredEventCard-user">
          <img src={picture !== null ? picture : CreatorImg} className="creator-image" alt="Creator" />
          <div className="Naslov">
            {name}
            <div className="createdBy">
              <FontAwesomeIcon icon={faUser} /> by @{name1}
            </div>
          </div>
          <div className="event-card-menu">
            <BsThreeDotsVertical className="menu-icon" onClick={toggleMenu} />
            {menuVisible && (
              <div className="dropdown-menu">
                <button onClick={showEvent}><FontAwesomeIcon icon={faEdit} />{" "}Uredi</button>
                <button onClick={deleteEvent}><FontAwesomeIcon icon={faTrash} />{" "}Obriši</button>
              </div>
            )}
          </div>
        </div>
        <div className="Opis">
          <p>
            <FontAwesomeIcon icon={faRunning} />{" "}{description}
          </p>
           <p>
            <FontAwesomeIcon icon={sportIcons[sports?.toLowerCase()] || faFutbol} />{" "}
            {sports || "Učitavanje..."}
          </p>
        </div>
        {isEditVisible && (
          <div>
            <NewAdvertisementCard user={user} pk={business_subject} eventId={id} className="new-event-card" />
            <IoIosCloseCircle
              className="close-icon-new-advertisement"
              onClick={() => setIsEditVisible(false)}
            />
          </div>
        )}
        <div className="SponsoredEventCard-footer">
              <div className="SponsoredEventCard-footer-left">
                <p>
                  <FontAwesomeIcon icon={faCalendarAlt} /> {dateOnly}
                </p>
                <p>
                  <FontAwesomeIcon icon={faClock} />  {timeOnly}
                </p>
              </div>
              <div className="SponsoredEventCard-footer-right">
                <p>
                  <FontAwesomeIcon icon={faMapMarkerAlt} /> {" "}
                  {location ? (
                    <span
                      className="clickable-location"
                      onClick={() => handleLocationClick(field)}
                    >
                      {location} - {preciseLocation}
                    </span>
                  ) : (
                    "Učitavanje..."
                  )}
                </p>
              </div>
            </div>
        
      </div>
    </div>
  );
};

export default SponsoredEventCardForBusinessSubject;