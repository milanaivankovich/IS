import React, { useState } from "react";
import axios from "axios";  
import "./FieldsCard.css";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faClock,faRunning, faMapMarkerAlt, faFutbol, faUser, faBasketballBall, faTableTennis, faVolleyballBall } from "@fortawesome/free-solid-svg-icons";

const FieldsCard = ({ field, userId, userType }) => {
  const [isFavourite, setIsFavourite] = useState(true);


  const handleFavouriteFields = async () => {
    try {
      const action = isFavourite ? "remove" : "add";  
      const url = userType === "Client" 
        ? `http://127.0.0.1:8000/api/client/update-favorite-fields/${userId}/` 
        : `http://127.0.0.1:8000/api/business-subject/update-favorite-fields/${userId}/`;

      const response = await axios.post(
        url,
        {
          field_id: field.id, 
          action: action,    
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,  
          },
        }
      );

      if (response.status === 200) {
        setIsFavourite(!isFavourite);  
      }
    } catch (error) {
      console.error("Error updating favorite fields:", error);
      alert("Došlo je do greške prilikom ažuriranja omiljenih terena.");
    }
  };

  const preview = () => {
    window.location.href = `/teren-profil/${field.id}`;
  };

  const sportIcons = {
    fudbal: faFutbol,
    kosarka: faBasketballBall,
    tenis: faTableTennis,
    odbojka: faVolleyballBall,
  };

  return (
    <div className="field-card-okvir">
      <header className="field-card-header">
        <img src={`http://localhost:8000${field.image}`} alt="Teren" className="field-card-image" />
      </header>
      <div className="field-card-body">
        <div className="fav-field-card-heading">
          <div className="naslov">
            <strong>{field.location}</strong>
          </div>
          <div className="fav-field-button">
            {isFavourite ? (
              <FaHeart onClick={handleFavouriteFields} />
            ) : (
              <FaRegHeart onClick={handleFavouriteFields} />
            )}
          </div>
        </div>
        <div className="Opis">
          <p><FontAwesomeIcon icon={faMapMarkerAlt} />{" "}{field.precise_location}</p>
          <p>
            {Array.isArray(field.sports) && field.sports.length > 0 ? (
              field.sports.map(sport => (
                <span key={sport.id}><FontAwesomeIcon icon={sportIcons[sport.name?.toLowerCase()] || faFutbol} />{" "}{sport.name}</span>
              )).reduce((prev, curr) => [prev, ', ', curr])
            ) : (
              <span>Nedefinisano</span>
            )}
          </p>
        </div>
        <div className="EventCard-buttons">
          <button className="EventCard-button" onClick={preview}>Pregled</button>
        </div>
      </div>
    </div>
  );
};

export default FieldsCard;
