import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "leaflet/dist/leaflet.css";
import "./Tereni.css";
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import SponsoredEventCard from "../components/SponsoredEventCard"; // Prilagodite putanju

const Tereni = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedField, setSelectedField] = useState(null);
  const [advertisements, setAdvertisements] = useState([]);
  const [filteredAdvertisements, setFilteredAdvertisements] = useState([]);
  const [fields, setFields] = useState([]);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noEvents, setNoEvents] = useState(false);
  const [noActivities, setNoActivities] = useState(false);

  // Funkcija za dohvaćanje terena
  const fetchFields = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/api/fields/");
      setFields(response.data);
    } catch (error) {
      console.error("Greška pri dohvaćanju terena:", error);
    } finally {
      setLoading(false);
    }
  };

  // Funkcija za dohvaćanje sponzorisanih događaja
  const fetchFilteredAdvertisements = async (field, date) => {
    setLoading(true);
    setNoEvents(false);
    try {
      let response;
      if (field && date) {
        const formattedDate = formatDateToLocal(date);
        response = await axios.get(
          `http://localhost:8000/api/advertisement/${formattedDate}/location/${field.location}`
        );
      } else if (date) {
        const formattedDate = formatDateToLocal(date);
        response = await axios.get(
          `http://localhost:8000/api/advertisement/${formattedDate}`
        );
      } else if (field) {
        response = await axios.get(
          `http://localhost:8000/api/advertisement/location/${field.location}`
        );
      } else {
        response = await axios.get("http://localhost:8000/api/advertisements/");
      }

      if (response.data.error || response.data.length === 0) {
        setNoEvents(true);
        setFilteredAdvertisements([]);
      } else {
        setFilteredAdvertisements(response.data);
      }
    } catch (error) {
      console.error("Greška pri dohvaćanju oglasa:", error);
      setNoEvents(true);
    } finally {
      setLoading(false);
    }
  };

  // Funkcija za dohvaćanje aktivnosti
  const fetchFilteredActivities = async (field, date) => {
    setLoading(true);
    setNoActivities(false);
    try {
      let response;
      if (field && date) {
        const formattedDate = formatDateToLocal(date);
        response = await axios.get(
          `http://localhost:8000/api/activities/${formattedDate}/location/${field.location}`
        );
      } else if (date) {
        const formattedDate = formatDateToLocal(date);
        response = await axios.get(
          `http://localhost:8000/api/activities/${formattedDate}`
        );
      } else if (field) {
        response = await axios.get(
          `http://localhost:8000/api/activities/location/${field.location}`
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
      setLoading(false);
    }
  };

  // Funkcija za lokalno formatiranje datuma u YYYY-MM-DD
  const formatDateToLocal = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Funkcija koja se poziva kada korisnik klikne na marker
  const handleMarkerClick = (field) => {
    setSelectedField(field);
    fetchFilteredAdvertisements(field, selectedDate);
    fetchFilteredActivities(field, selectedDate); // Filtriraj aktivnosti
  };

  // Funkcija koja se poziva kada korisnik odabere datum
  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchFilteredAdvertisements(selectedField, date);
    fetchFilteredActivities(selectedField, date); // Filtriraj aktivnosti po datumu
  };

  // Funkcija za resetovanje datuma (deselektovanje)
  const handleDateReset = () => {
    setSelectedDate(null);
    fetchFilteredAdvertisements(null, null);
    fetchFilteredActivities(null, null); // Poništi filter za aktivnosti
  };

  useEffect(() => {
    fetchFields();
    fetchFilteredAdvertisements(null, selectedDate);
    fetchFilteredActivities(null, selectedDate);
  }, [selectedDate]);

  return (
    <div className="tereni-page-container">
      <header className="tereni-header">
        <MenuBar variant={["registered"]} search={true} />
      </header>

      <section className="map-calendar-section">
        <h2 className="section-title">MAPE</h2>
        <p className="section-subtitle">Odaberite datum da biste pretražili događaje i aktivnosti</p>
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
                eventHandlers={{ click: () => handleMarkerClick(field) }}
              >
                <Popup>
                <h3>{"Sportski teren"}</h3>
                  <p><strong>Lokacija:</strong> {field.location}</p>
                  <p><strong>Sport:</strong> {field.type_of_sport}</p>
                  <img
                    src={field.image}
                    alt={`Slika terena ${field.name}`}
                    style={{ width: "100%", height: "auto", maxWidth: "200px" }}
                   />
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <Calendar className="calendar" onChange={handleDateChange} value={selectedDate} />
          <button onClick={handleDateReset} className="reset-date-button">Poništi datum</button>
        </div>
      </section>

      <div className="Events-body">
        <h2>SPONZORISANI DOGAĐAJI</h2>
        {loading ? (
          <p>Učitavanje...</p>
        ) : noEvents ? (
          <p>Nema sponzorisanih događaja za odabrani datum ili lokaciju.</p>
        ) : (
          <div className="Event-cards">
            {filteredAdvertisements.map((ad) => (
              <SponsoredEventCard key={ad.id} event={ad} />
            ))}
          </div>
        )}
      </div>

      <div className="Activities-body">
        <h2>AKTIVNOSTI</h2>
        {loading ? (
          <p>Učitavanje...</p>
        ) : noActivities ? (
          <p>Nema aktivnosti za odabrani datum ili lokaciju.</p>
        ) : (
          <div className="Activity-cards">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="Activity-card">
                <h3>{activity.name}</h3>
                <p><strong>Opis:</strong> {activity.description}</p>
                <p><strong>Datum:</strong> {activity.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Tereni;
