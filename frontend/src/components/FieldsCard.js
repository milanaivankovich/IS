import React, { useEffect, useState } from "react";
import "./FieldsCard.css";
import axios from "axios";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";

const SponsoredEventCard = ({ event }) => {

  const api = "http://localhost:8000/";
  const [information, setInformation] = useState({
    "id": -1,
    "location": "",
    "precise_location": "",
    "latitude": 0,
    "longitude": 0,
    "sports": [],
    "is_suspended": false,
    "image": null,
  });
  const [idField, setIdField] = useState({
    "id": 1
  });


  useEffect(() => {

    const fetchFieldData = async () => {
      await await axios.get(`${api}api/field/id/${idField.id}/`).then(response => {
        setInformation(response.data);
      })
        .catch(error => {
          console.error('Error fetching data: ', error);
        });
    };

    if (idField.id !== -1)
      fetchFieldData();
  }, [idField]);



  const [isFavourite, setIsFavourite] = useState(true);
  const handleFavouriteFields = () => {
    //todo send request
    setIsFavourite(!isFavourite);
  }

  const preview = () => {
    window.location.href = `/teren-profil/${idField.id}`;
  }

  return (
    <div className="field-card-okvir">
      <header className="field-card-header">
        <img src={`${api}${information.image} `} alt="Teren" className="field-card-image" />
      </header>
      <div className="field-card-body">
        <div className="fav-field-card-heading">
          <div className="Naslov">
            {information.location}
          </div>
          <div className='fav-field-button'>

            {isFavourite ? <FaHeart onClick={handleFavouriteFields} />
              : <FaRegHeart onClick={handleFavouriteFields} />}
          </div>
        </div>
        <div className="Opis">
          <p><strong>Lokacija:</strong> {information.precise_location}</p>
          <p><strong>
            Sportovi: </strong>
            {Array.isArray(information.sports) && information.sports.length > 0 ? (
              information.sports.map(sport => (
                <span key={sport.id}>
                  {sport.name}
                </span>
              )).reduce((prev, curr) => [prev, ', ', curr])
            ) : (
              <span>Nedefinisano</span>)}
          </p>
        </div>
        <div className="EventCard-buttons">
          <button className="EventCard-button"
            onClick={preview}>Pregled</button>
        </div>
      </div>
    </div >
  );
};

export default SponsoredEventCard;
