import React, { useEffect, useState } from "react";
import "./EditEventCard.css";
import CreatorImg from "../images/user.svg";
import axios from "axios";
import Select from "react-select";

const EditEventCard = ({ user, pk, eventId }) => {
  const [fields, setFields] = useState([]);
  const [optionsLocation, setOptionsLocation] = useState([]);
  const [optionsSport, setOptionsSport] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [advertisementName, setAdvertisementName] = useState("");
  const [advertisementDescription, setAdvertisementDescription] = useState("");
  const [advertisementDate, setAdvertisementDate] = useState("");
  const [advertisementField, setAdvertisementField] = useState("");
  const [advertisementSport, setAdvertisementSport] = useState("");
  const [advertisementDurationHours, setAdvertisementDurationHours] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [allAdvertisements, setAllAdvertisements] = useState([]);
  const [eventData, setEventData] = useState({
    id: eventId || -1,
    name: "",
    description: "",
    date: "",
    business_subject: pk,
    field: null,
    sport: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

    // Dohvacanje svih oglasa
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

  useEffect(() => {
    const searchFields = async () => {
      if (fields.length === 0) {
        try {
          const response = await axios.get("http://127.0.0.1:8000/api/fields/");
          setFields(response.data);
          setOptionsLocation(
            response.data.map((item) => ({
              value: item.id,
              label: `${item.location}-${item.precise_location} (${item.sports
                .map((sport) => sport.name)
                .join(", ")})`,
              sport: item.sports.map((sport) => ({
                sportID: sport.id,
                sportName: sport.name,
              })),
            }))
          );
        } catch (error) {
          console.error("Error loading fields:", error);
          window.location.replace("/userprofile1");
          alert("Došlo je do greške prilikom pretrage lokacija...");
        }
      }
    };

    searchFields();
  }, [fields]);

  useEffect(() => {
    if (selectedLocation) {
      const selectedField = fields.find(
        (field) => field.id === selectedLocation.value
      );
      if (selectedField) {
        setOptionsSport(
          selectedField.sports.map((sport) => ({
            value: sport.id,
            label: sport.name,
          }))
        );
      }
    }
  }, [selectedLocation, fields]);

  useEffect(() => {
    const fetchAdvertisementData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/advertisement/${eventId}/`);
        const data = await response.json();

        if (data && data[0]) {
          setAdvertisementName(data[0].name || "");
          setAdvertisementDescription(data[0].description || "");
          setAdvertisementDate(data[0].date || "");
          setAdvertisementField(data[0].field || "");
          setAdvertisementSport(data[0].sport || "");
          setAdvertisementDurationHours(data[0].duration_hours || "");
        }
        setIsLoading(false); // Postavljanje statusa učitavanja na false kada su podaci učitani
      } catch (error) {
        console.error("Error fetching advertisement data:", error);
        setIsLoading(false); // Ako dođe do greške, postavite na false kako bi se omogućio unos
      }
    };

    if (eventId) {
      fetchAdvertisementData();
    }
  }, [eventId]);


  const createOrUpdateEvent = async (updatedEventData) => {
    const isPost = updatedEventData.id === -1;
    const url = isPost
      ? "http://127.0.0.1:8000/api/advertisement/"
      : `http://127.0.0.1:8000/api/advertisement/update/${updatedEventData.id}/`;

    const payload = {
      id: updatedEventData.id,
      name: updatedEventData.name || advertisementName,
      description: updatedEventData.description || advertisementDescription,
      date: updatedEventData.date || advertisementDate,
      is_deleted: false,
      business_subject: pk,
      field: updatedEventData.field || advertisementField,
      sport: updatedEventData.sport || advertisementSport,
      duration_hours: updatedEventData.duration_hours || advertisementDurationHours,
    };

    console.log("Payload being sent to API:", payload);

    try {
      const response = await axios({
        method: isPost ? "post" : "put",
        url: url,
        data: payload,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Prikazivanje odgovarajuće poruke
      if (isPost) {
        alert("Događaj je uspješno kreiran.");
      } else {
        alert("Događaj je uspješno ažuriran.");
      }

      window.location.reload();
    } catch (error) {
      console.error(
        "Greška pri spremanju događaja:",
        error.response?.data || error.message
      );
      alert("Došlo je do greške prilikom spremanja događaja.");
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

  // Provjera postoji li oglas s istim terenom i datumom
  const isDuplicate = allAdvertisements.some((ad) => {
    const adStartTime = new Date(ad.date); 
    adStartTime.setHours(adStartTime.getHours() - 1);
    const adEndTime = new Date(ad.date);
    adEndTime.setHours(adEndTime.getHours() - 1);
    adEndTime.setHours(adEndTime.getHours() + ad.duration_hours);
  
    const eventStartTime = new Date(eventData.date);
    const eventEndTime = new Date(eventData.date);
    eventEndTime.setHours(eventEndTime.getHours() + parseInt(eventData.duration_hours || 0, 10));
    console.log(adStartTime, adEndTime, eventStartTime, eventEndTime);
  
    // Provjera preklapanja vremena
    return (
      ad.field === selectedLocation?.value &&
      (
        (eventStartTime >= adStartTime && eventStartTime < adEndTime) || 
        (eventEndTime > adStartTime && eventEndTime <= adEndTime) || 
        (eventStartTime <= adStartTime && eventEndTime >= adEndTime) 
      )
    );
  });
  
  if (isDuplicate) {
    alert(
      "Postoji već događaj za odabrani teren i datum. Molimo odaberite drugi datum, vrijeme ili teren."
    );
    return;
  }
  

    setIsSubmitting(true);

    const updatedEventData = {
      ...eventData,
      field: selectedLocation?.value || eventData.field,
      sport: selectedSport?.value || eventData.sport,
      business_subject: pk,
    };

    console.log("updatedEventData prije slanja:", updatedEventData);
    await createOrUpdateEvent(updatedEventData);
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (advertisementField) {
      const selectedField = optionsLocation.find(
        (option) => option.value === advertisementField
      );
      if (selectedField) {
        setSelectedLocation(selectedField);
      }
    }
  }, [advertisementField, optionsLocation]);

  useEffect(() => {
    if (advertisementSport) {
      const selectedSportOption = optionsSport.find(
        (option) => option.value === advertisementSport
      );
      if (selectedSportOption) {
        setSelectedSport(selectedSportOption);
      }
    }
  }, [advertisementSport, optionsSport]);

  useEffect(() => {
    if (advertisementDate) {
      const formattedDate = new Date(advertisementDate).toISOString().slice(0, 16);
      setEventData((prevData) => ({
        ...prevData,
        date: formattedDate,
      }));
    }
  }, [advertisementDate]);

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


  return (
    <div className="dimmer">
      <form className="EditEventCard-form" onSubmit={handleSubmit}>
        <header className="EditEventCard-Header" />
        <div className="EditEventCard-body">
          <div className="EditEventCard-user">
            <img
              src={user.profile_picture !== null ? user.profile_picture : CreatorImg}
              className="creator-image"
              alt="Creator"
            />
            <div className="edit-event-card-header">
              <input
                className="UnosInformacijaDogadjaja"
                value={eventData.name || advertisementName}
                type="text"
                placeholder="Unesi naslov događaja"
                onChange={(e) =>
                  setEventData((prevData) => ({
                    ...prevData,
                    name: e.target.value,
                  }))
                }
              />
              <div className="created"> by @{user.nameSportOrganization}</div>
            </div>
          </div>

          <div className="Opis">
            <textarea
              className="UnosInformacijaDogadjaja"
              rows="4"
              cols="46"
              placeholder="Unesi opis događaja..."
              minLength="10"
              value={eventData.description || advertisementDescription}
              onChange={(e) =>
                setEventData((prevData) => ({
                  ...prevData,
                  description: e.target.value,
                }))
              }
            />

            <label className="EditEventLabel"> Lokacija: </label>
            <Select
              className="editeventcard-selectlocation"
              styles={colourOptions}
              options={optionsLocation}
              onChange={setSelectedLocation}
              placeholder="Odaberi lokaciju terena..."
              isClearable
              value={selectedLocation}
            />

            <label className="EditEventLabel"> Sport: </label>
            <Select
              className="editeventcard-selectlocation"
              styles={colourOptions}
              options={optionsSport}
              onChange={setSelectedSport}
              placeholder="Odaberi sport..."
              isClearable
              value={selectedSport}
            />

            <label className="EditEventLabel"> Datum i vrijeme: </label>
            <input
              className="UnosInformacijaDogadjaja"
              id="UnosDatumaDogadjaja-input"
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
              value={eventData.date || advertisementDate}
              onChange={(e) =>
                setEventData((prevData) => ({
                  ...prevData,
                  date: e.target.value,
                }))
              }
            />

            <label className="EditEventLabel"> Vrijeme trajanja događaja (u satima): </label>
            <input
              className="UnosInformacijaDogadjaja"
              type="number"
              min="1"
              placeholder="Unesi broj sati"
              value={eventData.duration_hours || advertisementDurationHours}
              onChange={(e) =>
                setEventData((prevData) => ({
                  ...prevData,
                  duration_hours: e.target.value,
                }))
              }
            />
          </div>

          <div className="EventCard-buttons">
            <button className="SpasiIzmjeneDogadjaja-button" type="submit">
              Spasi izmjene
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditEventCard;
