import React, { useEffect, useState } from "react";
import "./EditEventCard.css";
import CreatorImg from "../images/user.svg";
import axios from "axios";
import Select from 'react-select';


//pretraziti lokacije pa ponuditi autofill
const EditEventCard = ({user, pk}) => {

  const [fields, setFields] = useState([]);
  const [optionsLocation, setOptionsLocation] = useState([]);
  const [optionsSport, setOptionsSport] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);

useEffect(() => {
  const searchFields = async () => {
    if (fields.length=== 0){
    await axios.get('http://localhost:8000/api/fields/')
      .then((response) => {
        setFields(response.data);
        setOptionsLocation(response.data.map(item => ({
          value: item.id,
          label: item.location+' ('+ item.sports.map(sport=>sport.name).join(', ')+')',
        })));
        console.log("Data updated successfully:", response.data);
      })
      .catch((error) => {
        console.error("There was an error searching the data:", error);
        window.location.replace("/userprofile");
        alert("Doslo je do greške prilikom pretrage lokacije...");
      });
    }
    };

    searchFields();
},[]);
/*
useEffect(() => {
  const searchSports =
    fields.find((field)=>field.id===parseInt(selectedLocation.id))?.(sports.name);
    setOptionsSport(searchSports.map((item)=>{value: 1,
      name

    })));
  },[selectedLocation]);
  */

  const [eventData, setEventData] = useState({
        "id": 10,
        "titel": "",
        "description": "",
        "date": "0000-00-00",
        "NumberOfParticipants": -1,
        "client": pk.pk,
        "field": -1,
        "sport": -1
  });

  const createNew = async () => {
    setEventData(prevData=>({...prevData, field: selectedLocation.value }));
    await axios.post('http://localhost:8000/api/activities/add/', eventData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((response) => {
        alert("Događaj je uspješno kreiran");
        console.log("Data updated successfully:", response.data);
        window.location.reload();
      })
      .catch((error) => {
        console.error("There was an error updating the data:", error);
        alert("Doslo je do greške prilikom ažuriranja...");
      });
  };
  
  const colourOptions = {
    control: (styles) => ({
      ...styles,
      borderColor: 'gray', // Border color for the dropdown
      boxShadow: 'none',
      '&:hover': { borderColor: 'gray' }, // Border color on hover
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: 'white',
      color: isSelected ? '#F15A24':'gray', // Text color
    }),
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      createNew();
  };

  return ( 
    <div className='dimmer'>
    <form className="EditEventCard-form" onSubmit={handleSubmit}>
      <header className="EditEventCard-Header" />
      <div className="EditEventCard-body">
        <div className="EditEventCard-user">
          <img src={user.profile_picture!==null ? user.profile_picture : CreatorImg} className="creator-image" alt="Creator" />
          <div className="edit-event-card-header">
            <input 
                className="UnosInformacijaDogadjaja"
                value={eventData.name}
                type="text" 
                placeholder="Unesi naslov događaja"
                required
                onChange={(e) => setEventData(prevData=>({...prevData, titel: e.target.value }))}
            />
            <div className="createdBy"> by @{user.username}</div>
          </div>
        </div>

        <div className="Opis">

        <textarea
        className="UnosInformacijaDogadjaja"
            rows="4"
            cols="46"
            placeholder="Unesi opis događaja..."
            minLength="10"
            value={eventData.description}
            required
        onChange={(e) => setEventData(prevData=>({...prevData, description: e.target.value }))}
        />

        <label className="EditEventLabel"> Lokacija: </label>
        <Select className='editeventcard-selectlocation'
        styles={colourOptions}
        options={optionsLocation}
        onChange={setSelectedLocation}
        placeholder="Odaberi lokaciju terena..."
        isClearable
        required
        />

        <label className="EditEventLabel"> Sport: </label>
        <Select className='editeventcard-selectlocation'
        styles={colourOptions}
        options={optionsSport}
        onChange={setSelectedSport}
        placeholder="Odaberi sport..."
        isClearable
        required
        />

        <label className="EditEventLabel"> Datum i vrijeme: </label>
        <input className="UnosInformacijaDogadjaja"
        id="UnosDatumaDogadjaja-input"
        type="datetime-local" 
        min={new Date().toISOString().slice(0, 16)}
        onChange={(e) => setEventData(prevData=>({...prevData, date: e.target.value }))}
        required/>
       
        <label className="EditEventLabel"> Broj osoba: </label>
        <input 
         className="UnosInformacijaDogadjaja"
         type="number"
         placeholder="Unesi broj osoba..."
         min={0}
         onChange={(e) => setEventData(prevData=>({...prevData, NumberOfParticipants: e.target.value }))}
         required />

        </div>
        <div className="EventCard-buttons">
          <button 
          className="SpasiIzmjeneDogadjaja-button "
          type="submit">
            Spasi izmjene</button>
            
        </div>
      </div>
    </form>
    
  </div>
  );
};

export default EditEventCard;