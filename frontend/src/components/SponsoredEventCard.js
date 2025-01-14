import React, { useEffect, useState } from "react";
import "./SponsoredEventCard.css";
import CreatorImg from "../images/user.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faClock,faRunning, faMapMarkerAlt, faFutbol, faUser, faBasketballBall, faTableTennis, faVolleyballBall } from "@fortawesome/free-solid-svg-icons";

const SponsoredEventCard = ({ event }) => {
  const { name, description, date, field, business_subject, sport } = event;
  const [location, setLocation] = useState("");
  const [preciseLocation, setPreciseLocation] = useState("");
  const [name1, setName] = useState("");
  const [sports, setSport] = useState("");
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

export default SponsoredEventCard;