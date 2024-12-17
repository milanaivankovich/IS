import React, { useEffect, useState } from "react";
import "./EditEventCard.css";
import CreatorImg from "../images/user.svg";
import axios from "axios";
import Select from 'react-select';

const EditEventCard = ({ user, pk, eventId }) => {
  const [fields, setFields] = useState([]);
  const [optionsLocation, setOptionsLocation] = useState([]);
  const [optionsSport, setOptionsSport] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [eventData, setEventData] = useState({
    id: -1,
    name: "",
    description: "",
    date: "",
    business_subject: pk,
    field: null,  
    sport: null,  
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Dodajemo stanje za praćenje slanja

  // Učitaj terene (fields) i postavi opcije za lokacije
  useEffect(() => {
    const searchFields = async () => {
      if (fields.length === 0) {
        await axios.get('http://localhost:8000/api/fields/')
          .then((response) => {
            setFields(response.data);
            setOptionsLocation(response.data.map(item => ({
              value: item.id,  // ID terena
              label: `${item.location} (${item.sports.map(sport => sport.name).join(', ')})`,  // Prikazivanje svih sportova
              sport: item.sports.map(sport => ({
                sportID: sport.id,
                sportName: sport.name, })),
            })));
          })
          .catch((error) => {
            console.error("Error loading fields:", error);
            window.location.replace("/userprofile1");
            alert("Došlo je do greške prilikom pretrage lokacija...");
          });
      }
    };

    searchFields();
  }, [fields]);

  // Kada se odabere lokacija, postavi dostupne sportove za odabrani teren
  useEffect(() => {
    if (selectedLocation) {
      const selectedField = fields.find(field => field.id === selectedLocation.value);
      if (selectedField) {
        setOptionsSport(selectedField.sports.map(sport => ({
          value: sport.id,  // ID sporta
          label: sport.name,  // Ime sporta
        })));
      }
    }
  }, [selectedLocation, fields]);
  console.log("Selected sport:", selectedSport);

  const createOrUpdateEvent = async (updatedEventData) => {
    // Provjeri postoji li eventData i njegov ID prije nego što pošaljemo zahtjev
    if (!updatedEventData || !updatedEventData.id) {
      alert("Događaj nije pravilno postavljen.");
      return;
    }

    const url = updatedEventData.id === -1
      ? 'http://localhost:8000/api/advertisement/'
      : `http://localhost:8000/api/advertisement/${updatedEventData.id}/`;

    if (!updatedEventData.name || !updatedEventData.description || !updatedEventData.date || !updatedEventData.business_subject || !updatedEventData.field || !updatedEventData.sport) {
      alert("Sva obavezna polja moraju biti popunjena!");
      return;
    }

    try {
      const response = await axios({
        method: updatedEventData.id === -1 ? 'post' : 'put',
        url: url,
        data: updatedEventData,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert("Događaj je uspješno sačuvan!");
      window.location.reload();
    } catch (error) {
      console.error("Greška pri spremanju događaja:", error.response?.data || error.message);
      alert("Došlo je do greške prilikom spremanja događaja.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ako je već u procesu slanja, nemoj ponovo poslati
    if (isSubmitting) {
      return;
    }

    // Postavi isSubmitting na true
    setIsSubmitting(true);

    if (!selectedLocation || !selectedSport) {
      alert("Morate odabrati lokaciju terena i sport.");
      setIsSubmitting(false); // Postavi isSubmitting na false ako je došlo do greške
      return;
    }

    // Postavi ID sporta i ID lokacije u eventData
    const updatedEventData = {
      ...eventData,
      field: selectedLocation.value,  // ID odabrane lokacije
      sport: selectedSport.value,  // ID odabranog sporta
    };

    console.log("updatedEventData prije slanja:", updatedEventData);
    // Pozivamo createOrUpdateEvent nakon što su svi podaci potvrđeni
    await createOrUpdateEvent(updatedEventData);

    // Postavi isSubmitting na false nakon što se operacija završi
    setIsSubmitting(false);
  };

  return (
    <div className='dimmer'>
      <form className="EditEventCard-form" onSubmit={handleSubmit}>
        <header className="EditEventCard-Header" />
        <div className="EditEventCard-body">
          <div className="EditEventCard-user">
            <img src={user.profile_picture !== null ? user.profile_picture : CreatorImg} className="creator-image" alt="Creator" />
            <div className="edit-event-card-header">
              <input
                className="UnosInformacijaDogadjaja"
                value={eventData.name}
                type="text"
                placeholder="Unesi naslov događaja"
                onChange={(e) => setEventData(prevData => ({ ...prevData, name: e.target.value }))}
                required
              />
              <div className="createdBy"> by {user.nameSportOrganization}</div>
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
              onChange={(e) => setEventData(prevData => ({ ...prevData, description: e.target.value }))}
            />
  
            <label className="EditEventLabel"> Lokacija: </label>
            <Select
              className='editeventcard-selectlocation'
              options={optionsLocation}
              styles={{
                control: (styles) => ({
                  ...styles,
                  borderColor: 'gray',
                  boxShadow: 'none',
                  '&:hover': { borderColor: 'gray' },
                }),
                option: (styles, { isFocused, isSelected }) => ({
                  ...styles,
                  backgroundColor: 'white',
                  color: isSelected ? '#F15A24' : 'gray',
                }),
              }}
              onChange={setSelectedLocation}
              placeholder="Odaberi lokaciju terena..."
              isClearable
              required
            />
  
            <label className="EditEventLabel"> Sport: </label>
            <Select
              className='editeventcard-selectlocation' //vezano samo za css
              options={optionsSport}
              styles={{
                control: (styles) => ({
                  ...styles,
                  borderColor: 'gray',
                  boxShadow: 'none',
                  '&:hover': { borderColor: 'gray' },
                }),
                option: (styles, { isFocused, isSelected }) => ({
                  ...styles,
                  backgroundColor: 'white',
                  color: isSelected ? '#F15A24' : 'gray',
                }),
              }}
              onChange={setSelectedSport}
              placeholder="Odaberi sport..."
              isClearable
              required
            />
  
            <label className="EditEventLabel"> Datum i vrijeme: </label>
            <input
              className="UnosInformacijaDogadjaja"
              id="UnosDatumaDogadjaja-input"
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setEventData(prevData => ({ ...prevData, date: e.target.value }))}
              required
            />
          </div>
  
          <div className="EventCard-buttons">
            <button
              className="SpasiIzmjeneDogadjaja-button"
              type="submit"
            >
              Spasi izmjene
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditEventCard;
