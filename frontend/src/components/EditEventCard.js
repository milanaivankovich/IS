import React, { useEffect, useState } from "react";
import "./EditEventCard.css";
import CreatorImg from "../images/user.svg";
import axios from "axios";
import Select from 'react-select';
import { IoIosCloseCircle } from "react-icons/io";

const EditEventCard = ({ user, pk, event, closeFunction }) => {

  const [fields, setFields] = useState([]);
  const [optionsLocation, setOptionsLocation] = useState([]);
  const [optionsSport, setOptionsSport] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);

  const [eventData, setEventData] = useState({
    "id": event ? event.id : -1,
    "username": user.username,
    "titel": event ? event.titel : "",
    "description": event ? event.description : "",
    "date": "",
    "NumberOfParticipants": event ? event.NumberOfParticipants : "",
    "duration_hours": event ? event.duration_hours : "",
    "client": pk,
    "field": -1,
    "sport": -1
  });

  //update

  useEffect(() => {
    if (event.field) {
      const selectedField = optionsLocation.find(
        (option) => option.value === event.field
      );
      if (selectedField) {
        searchSports(selectedField);
        setSelectedLocation(selectedField);
      }
    }
  }, [event, optionsLocation]);

  useEffect(() => {
    if (event.sport) {
      const selectedSport = optionsSport.find(
        (option) => option.value === event.sport
      );
      if (selectedSport) {
        setSelectedSport(selectedSport);
      }
    }
  }, [event, optionsSport]);

  useEffect(() => {
    if (event.date) {
      const formattedDate = new Date(event.date).toISOString().slice(0, 16);
      setEventData((prevData) => ({
        ...prevData,
        date: formattedDate.toString(),
      }));
    }
  }, [event]);

  //
  useEffect(() => {
    const searchFields = async () => {
      if (fields.length === 0) {
        await axios.get('http://localhost:8000/api/fields/')
          .then((response) => {
            setFields(response.data);
            setOptionsLocation(response.data.map(item => ({
              value: item.id,
              label: `${item.location}-${item.precise_location} (${item.sports
                .map((sport) => sport.name)
                .join(", ")})`,
              sport: item.sports.map(sport => ({
                sportID: sport.id,
                sportName: sport.name,
              })),
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
  }, []);

  const searchSports = (location) => {
    setSelectedLocation(location);
    setSelectedSport(null);
    setOptionsSport(location?.sport.map(item => ({
      value: item.sportID,
      label: item.sportName,
    })));
  };



  const createNew = async () => {
    await axios.post('http://localhost:8000/api/activities/add/', eventData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((response) => {
        console.log("Data updated successfully:", response.data);
        alert("Događaj je uspješno kreiran.");
        window.location.reload();
      })
      .catch((error) => {
        console.error("There was an error updating the data:", error);
        alert("Doslo je do greške prilikom ažuriranja...");
      });
  };
  const updateEventData = async () => {
    await axios.put(`http://localhost:8000/activities/update/${eventData.id}/`, eventData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((response) => {
        console.log("Data updated successfully:", response.data);
        alert("Događaj je uspješno ažuriran.");
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
      color: isSelected ? '#F15A24' : 'gray', // Text color
    }),
  };

  //Dohvatanje svih aktivnosti
  const [allActivities, setAllActivities] = useState([]);
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/activities/");
        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }
        const data = await response.json();
        setAllActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchActivities();
  }, []);


  //Dohvatanje svih oglasa 
  const [allAdvertisements, setAllAdvertisements] = useState([]);
  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/advertisements/");
        if (!response.ok) {
          throw new Error("Failed to fetch advertisements");
        }
        const data = await response.json();
        setAllAdvertisements(data);
      } catch (error) {
        console.error("Error fetching advertisements:", error);
      }
    };

    fetchAdvertisements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

      // Provjera postoji li aktivnost s istim terenom i datumom
      const isDuplicateActivity = allActivities.some((activity) => {
        const activityStartTime = new Date(activity.date);
        activityStartTime.setHours(activityStartTime.getHours() - 1);
        const activityEndTime = new Date(activity.date);
        activityEndTime.setHours(activityEndTime.getHours() - 1);
        activityEndTime.setHours(activityEndTime.getHours() + activity.duration_hours);
  
        const eventStartTime = new Date(eventData.date);
        const eventEndTime = new Date(eventData.date);
      
        eventEndTime.setHours(eventEndTime.getHours() + parseInt(eventData.duration_hours || 0, 10));
        console.log(eventStartTime, eventEndTime, activityStartTime, activityEndTime);
        // Provjera preklapanja vremena
        return (
          activity.field === selectedLocation?.value  && activity.id !== eventData.id &&
          (
            (eventStartTime >= activityStartTime && eventStartTime < activityEndTime) ||
            (eventEndTime > activityStartTime && eventEndTime <= activityEndTime) ||
            (eventStartTime <= activityStartTime && eventEndTime >= activityEndTime)
          )
        );
      });
  
      if (isDuplicateActivity) {
        alert(
          "Postoji već događaj za odabrani teren i datum. Molimo odaberite drugi datum, vrijeme ili teren."
        );
        return;
      }
  
        // Provjera postoji li oglas s istim terenom i datumom 
        const isDuplicateAd = allAdvertisements.some((ad) => {
          const adStartTime = new Date(ad.date);
          adStartTime.setHours(adStartTime.getHours() - 1);
          const adEndTime = new Date(ad.date);
          adEndTime.setHours(adEndTime.getHours() - 1);
          adEndTime.setHours(adEndTime.getHours() + ad.duration_hours);
  
          const eventStartTime = new Date(eventData.date);
          const eventEndTime = new Date(eventData.date);
          eventEndTime.setHours(eventEndTime.getHours() + parseInt(eventData.duration_hours || 0, 10));
  
          // Provjera preklapanja vremena
          return (
            ad.field === selectedLocation?.value  &&
            (
              (eventStartTime >= adStartTime && eventStartTime < adEndTime) ||
              (eventEndTime > adStartTime && eventEndTime <= adEndTime) ||
              (eventStartTime <= adStartTime && eventEndTime >= adEndTime)
            )
          );
        });
  
        if (isDuplicateAd) {
          alert(
            "Postoji već događaj za odabrani teren i datum. Molimo odaberite drugi datum, vrijeme ili teren."
          );
          return;
        }

    await setEventData(prevData => ({ ...prevData, field: selectedLocation.value, sport: selectedSport.value }));
    if (eventData.field !== -1 && eventData.sport !== -1 && eventData.NumberOfParticipants !== -1
      && eventData.NumberOfParticipants !== -1
    ) {
      if (eventData.id !== -1) {
        updateEventData();
      }
      else
        await createNew();

    }
  };

  return (
    <div className='dimmer'>
      <form className="EditEventCard-form" onSubmit={handleSubmit}>
        <IoIosCloseCircle className="close-icon" onClick={closeFunction} />
        <div className="EditEventCard-body">
          <div className="EditEventCard-user">
            <img src={user.profile_picture !== null ? user.profile_picture : CreatorImg} className="creator-image" alt="Creator" />
            <div className="edit-event-card-header">
              <input
                className="UnosInformacijaDogadjaja"
                value={eventData.titel}
                type="text"
                placeholder="Unesi naslov događaja"
                required
                onChange={(e) => setEventData(prevData => ({ ...prevData, titel: e.target.value }))}
              />
              <div className="created"> by @{user.username}</div>
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
            <Select className='editeventcard-selectlocation'
              styles={colourOptions}
              value={selectedLocation}
              options={optionsLocation}
              onChange={(e) => searchSports(e)}
              placeholder="Odaberi lokaciju terena..."
              isClearable
              required
            />

            <label className="EditEventLabel"> Sport: </label>
            <Select className='editeventcard-selectlocation'
              styles={colourOptions}
              options={optionsSport}
              value={selectedSport}
              onChange={setSelectedSport}
              placeholder="Odaberi sport..."
              isClearable
              required
            />

            <label className="EditEventLabel"> Datum i vrijeme: </label>
            <input className="UnosInformacijaDogadjaja"
              id="UnosDatumaDogadjaja-input"
              type="datetime-local"
              value={eventData.date}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setEventData(prevData => ({ ...prevData, date: (e.target.value) }))}
              required />

            <label className="EditEventLabel"> Broj osoba: </label>
            <input
              className="UnosInformacijaDogadjaja"
              type="number"
              placeholder="Unesi broj osoba..."
              value={eventData.NumberOfParticipants}
              min={1}
              onChange={(e) => setEventData(prevData => ({ ...prevData, NumberOfParticipants: e.target.value }))}
              required />
            <label className="EditEventLabel"> Vrijeme trajanja događaja (u satima): </label>
            <input
              className="UnosInformacijaDogadjaja"
              type="number"
              min="1"
              max="24"
              placeholder="Unesi broj sati"
              value={eventData.duration_hours}
              onChange={(e) =>
                setEventData((prevData) => ({
                  ...prevData,
                  duration_hours: e.target.value,
                }))
              }
            />
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