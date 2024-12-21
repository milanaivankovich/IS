import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "leaflet/dist/leaflet.css";
import "./Tereni.css";
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import SponsoredEventCard from "../components/SponsoredEventCard";
import ActivityCard from "../components/ActivityCard";
import iconPath from "../images/marker.jpg";
import L from 'leaflet';

const Tereni = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [advertisements, setAdvertisements] = useState([]);
  const [filteredAdvertisements, setFilteredAdvertisements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [fields, setFields] = useState([]);
  const [loadingAdvertisements, setLoadingAdvertisements] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [noAdvertisements, setNoAdvertisements] = useState(false);
  const [noActivities, setNoActivities] = useState(false);

  // Dohvaćanje terena
  const fetchFields = async () => {
    try {
      setLoadingAdvertisements(true);
      setLoadingActivities(true);
      const response = await axios.get("http://localhost:8000/api/fields/");
      setFields(response.data);
    } catch (error) {
      console.error("Greška pri dohvaćanju terena:", error);
    } finally {
      setLoadingAdvertisements(false);
      setLoadingActivities(false);
    }
  };

  // Dohvaćanje reklama
  const fetchFilteredAdvertisements = async (field, date) => {
    setLoadingAdvertisements(true);
    setNoAdvertisements(false);
    try {
      let response;

      if (field && date) {
        const formattedDate = formatDateToLocal(date);
        response = await axios.get(
          `http://localhost:8000/api/advertisement/${formattedDate}/location/${field.location}/`
        );
      } else if (date) {
        const formattedDate = formatDateToLocal(date);
        response = await axios.get(
          `http://localhost:8000/api/advertisement/${formattedDate}/`
        );
      } else if (field) {
        response = await axios.get(
          `http://localhost:8000/api/advertisement/location/${field.location}/`
        );
      } else {
        response = await axios.get("http://localhost:8000/api/advertisements/");
      }

      if (response.data.error || response.data.length === 0) {
        setNoAdvertisements(true);
        setFilteredAdvertisements([]);
      } else {
        setFilteredAdvertisements(response.data);
      }
    } catch (error) {
      console.error("Greška pri dohvaćanju oglasa:", error);
      setNoAdvertisements(true);
    } finally {
      setLoadingAdvertisements(false);
    }
  };

  // Dohvaćanje događaja
  const fetchFilteredActivities = async (field, date) => {
    setLoadingActivities(true);
    setNoActivities(false);
    try {
      let response;

      if (field && date) {
        const formattedDate = formatDateToLocal(date);
        response = await axios.get(
          `http://localhost:8000/activities/date/${formattedDate}/location/${field.location}/`
        );
      } else if (date) {
        const formattedDate = formatDateToLocal(date);
        response = await axios.get(
          `http://localhost:8000/activities/date/${formattedDate}/`
        );
      } else if (field) {
        response = await axios.get(
          `http://localhost:8000/activities/location/${field.location}/`
        );
      } else {
        response = await axios.get("http://localhost:8000/api/activities/");
      }

      if (response.data.error || response.data.length === 0) {
        setNoActivities(true);
        setFilteredActivities([]);
      } else {
        setFilteredActivities(response.data);
      }
    } catch (error) {
      console.error("Greška pri dohvaćanju aktivnosti:", error);
      setNoActivities(true);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Formatiranje datuma
  const formatDateToLocal = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Klik na marker
const handleMarkerClick = (field) => {
  setSelectedField(field); 
  fetchFilteredAdvertisements(field, selectedDate); 
  fetchFilteredActivities(field, selectedDate); 
};

// Klik na sliku
const handleImageClick = (fieldId) => {
  window.location.href = `/teren-profil/${fieldId}`;
};

  // Promena datuma
  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchFilteredAdvertisements(selectedField, date);
    fetchFilteredActivities(selectedField, date);
  };

  //Ikona za marker
  const markerIcon = L.icon({
    iconUrl: iconPath, 
    iconSize: [25, 25],
    iconAnchor: [12.5, 12.5],
    popupAnchor: [0, -15], 
  });

  // Resetovanje datuma i lokacije
  const handleDateReset = () => {
    setSelectedDate(null);
    setSelectedField(null);
    fetchFilteredAdvertisements(null, null);
    fetchFilteredActivities(null, null);
  };

  useEffect(() => {
    fetchFields();
    fetchFilteredAdvertisements(null,null);
    fetchFilteredActivities(null,null);
  }, []);

  useEffect(() => {
    fetchFilteredAdvertisements(selectedField, selectedDate);
    fetchFilteredActivities(selectedField, selectedDate);
  }, [selectedField, selectedDate]);

  return (
    <div className="tereni-page-container">
      <header className="tereni-header">
        <MenuBar variant={["registered"]} search={true} />
      </header>

      <section className="map-calendar-section">
        <h2 className="section-title">MAPA I KALENDAR</h2>
        <p className="section-subtitle">
          Odaberite lokaciju i datum da biste pretražili reklame i aktivnosti
        </p>
        <div className="map-calendar-container">
          <MapContainer center={[44.7722, 17.191]} zoom={13} className="map-container">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {fields.map((field) => (
              <Marker
                key={field.id}
                position={[field.latitude, field.longitude]}
                icon={markerIcon} 
                eventHandlers={{ click: () => handleMarkerClick(field) }}
              >
                <Popup>
                  <h3>{field.name}</h3>
                  <p><strong>Lokacija:</strong> {field.location}</p>
                  <img
                    src={field.image}
                    alt={`Slika terena ${field.name}`}
                    style={{ width: "100%", height: "auto", maxWidth: "200px" }}
                    onClick={() => handleImageClick(field.id)}
                  />
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <Calendar
            className="calendar"
            onChange={handleDateChange}
            value={selectedDate}
          />
          <button onClick={handleDateReset} className="reset-date-button"></button>
        </div>
      </section>

      <div className="Events-body">
        {/* Sekcija za reklame */}
        <div className="Events-bar">
          <div className="Event-bar-title">SPONZORISANE REKLAME</div>
          {loadingAdvertisements ? (
            <p>Učitavanje reklama...</p>
          ) : noAdvertisements ? (
            <p>Nema reklama za odabrani datum ili lokaciju.</p>
          ) : (
            <div className="Scroll-bar">
              <div className="Event-cards">
                {filteredAdvertisements.map((advertisement) => (
                  <SponsoredEventCard key={advertisement.id} event={advertisement} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sekcija za aktivnosti */}
        <div className="Events-bar">
          <div className="Event-bar-title">AKTIVNOSTI</div>
          {loadingActivities ? (
            <p>Učitavanje aktivnosti...</p>
          ) : noActivities ? (
            <p>Nema aktivnosti za odabrani datum ili lokaciju.</p>
          ) : (
            <div className="Scroll-bar">
              <div className="Event-cards">
                {filteredActivities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Tereni;
