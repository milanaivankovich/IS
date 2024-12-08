import React, { useEffect, useState } from "react";
import "./EditEventCard.css";
import CreatorImg from "../images/user.svg";
import axios from "axios";
import Select from 'react-select';


//pretraziti lokacije pa ponuditi autofill
const EditEventCard = ({user}) => {

  const [fields, setFields] = useState([]);
  const [options, setOptions] = useState([]);
  
useEffect(() => {
  const searchFields = async () => {
    if (fields.length=== 0){
    await axios.get('http://localhost:8000/api/fields/')
      .then((response) => {
        setFields(response.data);
        setOptions(response.data.map(item => ({
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

  const [selectedOption, setSelectedOption] = useState(null);

  const [eventData, setEventData] = useState({
    'name': '',
    'description':'',
    'location':'',
    'date':''
  });

  const createNew = async () => {
    await axios.put('http://localhost:8000/api/client//edit/', eventData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((response) => {
        console.log("Data updated successfully:", response.data);
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
  };

  return ( 
    <div className='dimmer'>
    <form className="EditEventCard-form" onSubmit={handleSubmit}>
      <header className="EditEventCard-Header" />
      <div className="EditEventCard-body">
        <div className="EditEventCard-user">
          <img src={CreatorImg} className="creator-image" alt="Creator" />
          <div className="edit-event-card-header">
            <input 
                className="UnosInformacijaDogadjaja"
                value={eventData.name}
                type="text" 
                placeholder="Unesi naslov događaja"
                required
                onChange={(e) => setEventData(prevData=>({...prevData, name: e.target.value }))}
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
        options={options}
        onChange={setSelectedOption}
        placeholder="Unesi naziv terena..."
        isClearable
        required
        />

        <label className="EditEventLabel"> Datum i vrijeme: </label>
        <input className="UnosInformacijaDogadjaja"
        id="UnosDatumaDogadjaja-input"
        type="datetime-local" 
        min={new Date().toISOString().slice(0, 16)} 
        required/>
       
        {/*<input 
         className="UnosInformacijaDogadjaja"
         type="text"
         placeholder="Odaberi teren"
         required />*/}

        </div>
        <div className="EventCard-buttons">
          <button 
          className="SpasiIzmjeneDogadjaja-button "
          type="select">
            Spasi izmjene</button>
            
        </div>
      </div>
    </form>
    
  </div>
  );
};

export default EditEventCard;