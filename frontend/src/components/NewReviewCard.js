import React, { useEffect, useState } from "react";
import "./NewReviewCard.css";
import CreatorImg from "../images/user.svg";
import axios from "axios";
import Select from 'react-select';

const NewReviewCard = ({ user, pk }) => {
  const [idField, setIdField] = useState(-1);
  const [rating, setRating] = useState(null);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [clientPicture, setClientPicture] = useState(null);
  const [isBusinessSubject, setIsBusinessSubject] = useState(false);
  const [id, setID]=useState({
      "id": -1,
      "type": ''
    });

  useEffect(() => {
      const fetchIDType = async () => {
        try {
          const response = await axios.get('http://localhost:8000/api/get-user-type-and-id/', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
  
          if (response.data.type === 'BusinessSubject') {
            setIsBusinessSubject(true); 
            alert("Recenzije mogu ostavljati samo klijenti...");
            window.location.reload();
          } else {
            setID(response.data);
          }
        } catch (error) {
          console.error("Error getting ID: ", error);
          alert("Došlo je do greške prilikom autorizacije.");
        }
      };
  
      fetchIDType();
  }, []);


  useEffect(() => {
    const fetchName = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://127.0.0.1:8000/api/client/${pk}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if(!isBusinessSubject){
          setName(data.username);
        }
      } catch (error) {
        console.error("Error fetching name:", error);
      }
    };

    if (pk) {
      fetchName();
    }
  }, [pk]);

  useEffect(() => {
    const fetchClientPicture = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://127.0.0.1:8000/api/client/${pk}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if(!isBusinessSubject){
          setClientPicture(`http://127.0.0.1:8000/` + data.profile_picture);
        }
      } catch (error) {
        console.error("Error fetching picture:", error);
      }
    };

    if (pk) {
      fetchClientPicture();
    }
  }, [pk]);

  useEffect(() => {
    const fetchIdFromUrl = () => {
      const path = window.location.pathname; // Dohvaćanje trenutne putanje
      const match = path.match(/\/teren-profil\/(\d+)$/); // Traženje broja nakon '/teren-profil/'
      if (match && match[1]) {
        setIdField(parseInt(match[1], 10)); // Postavljanje ID-a ako je pronađen
      } else {
        console.error("Nije moguće pronaći ID u URL-u.");
      }
    };

    fetchIdFromUrl();
  }, []);


  useEffect(() => {
    if (id !== -1) {
      setEventData((prevData) => ({
        ...prevData,
        field: idField, // Postavljamo ID u field kada ID bude postavljen
      }));
    }
  }, [idField]); // Ovisimo o promjeni id-a

  const [eventData, setEventData] = useState({
    "id": -1,
    "rating": "",
    "description": "",
    "date": null,
    "client": pk,
    "field": idField,
  });

  const createNew = async () => {
    const updatedEventData = {
      ...eventData,
      rating: rating,
      description: description,
      date: new Date().toISOString(), // Pretvaranje datuma u ISO format
    };
  
    console.log("Sending event data:", updatedEventData); 
  
    await axios
      .post("http://localhost:8000/api/review/", updatedEventData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        alert("Recenzija je uspješno kreirana");
        console.log("Data updated successfully:", response.data);
        window.location.reload();
      })
      .catch((error) => {
        console.error("There was an error updating the data:", error);
        alert("Došlo je do greške prilikom ažuriranja...");
      });
  };
  

  const ratingOptions = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" },
  ];

  const colourOptions = {
    control: (styles) => ({
      ...styles,
      borderColor: "gray",
      boxShadow: "none",
      "&:hover": {
        borderColor: "gray",
      },
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isFocused ? "#f0f0f0" : "white",
      color: isSelected ? "#F15A24" : "gray",
      "&:active": {
        backgroundColor: "#dcdcdc",
      },
    }),
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createNew();
  };

  const handleRatingChange = (selectedOption) => {
    setRating(selectedOption ? selectedOption.value : null); // Ažurirajte rating
    setEventData((prevData) => ({
      ...prevData,
      rating: selectedOption ? selectedOption.value : null, // Dodajte rating u eventData
    }));
  };

  return (
    <div className="dimmer-review">
      <form className="EditEventCard-form-review" onSubmit={handleSubmit}>
        <header className="EditEventCard-Header-review" />
        <div className="EditEventCard-body-review">
          <div className="EditEventCard-user-review">
            <img
              src={clientPicture !== null ? clientPicture : CreatorImg}
              className="creator-image-review"
              alt="Creator"
            />
            <div className="edit-event-card-header-review">
              <div className="createdBy-new-review">
                Recenzija by @{name}
              </div>
            </div>
          </div>
          <div className="Opis-reviews">
            <label className="EditEventLabel"> Komentar: </label>
            <textarea
              className="UnosInformacijaDogadjaja"
              rows="4"
              cols="46"
              placeholder="Upiši komentar..."
              minLength="10"
              value={description}
              required
              onChange={(e) => {
                setDescription(e.target.value); 
                setEventData((prevData) => ({
                  ...prevData,
                  description: e.target.value, 
                }));
              }}
            />
            <label className="EditEventLabel"> Ocjena: </label>
            <Select
              className="editeventcard-selectlocation"
              styles={colourOptions}
              options={ratingOptions}
              value={rating ? { value: rating, label: rating.toString() } : null}
              onChange={handleRatingChange} 
              placeholder="Ocijeni teren..."
              isClearable
              required
            />
          </div>
          <div className="EventCard-buttons-review">
            <button className="SpasiIzmjeneDogadjaja-button" type="submit">
              Spasi izmjene
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewReviewCard;
