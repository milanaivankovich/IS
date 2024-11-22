import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer } from "react-leaflet";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "leaflet/dist/leaflet.css";
import "./Tereni.css";
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";

const Tereni = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [advertisements, setAdvertisements] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noEvents, setNoEvents] = useState(false);


  // Funkcija za dohvaćanje sponzorisanih događaja
const fetchAdvertisements = async () => {
  setLoading(true);
  setNoEvents(false);  
  try {
    const formattedDate = formatDateToLocal(selectedDate);

    console.log("Slanje datuma backendu:", formattedDate);

    const sponsoredResponse = await axios.get(`http://localhost:8000/api/advertisement/${formattedDate}`);

    console.log("Odgovor s backend-a:", sponsoredResponse.data);

    // Provjera odgovora za grešku
    if (sponsoredResponse.data.error) {
      setNoEvents(true); // Ako postoji greška, postavi noEvents na true
      setAdvertisements([]);
    } else {
      if (sponsoredResponse.data.length === 0) {
        setNoEvents(true); // Ako nema događaja, postavi noEvents na true
      } else {
        setAdvertisements(sponsoredResponse.data); // Inače postavi događaje
      }
    }
  } catch (error) {
    console.error("Greška pri dohvaćanju sponzorisanih događaja:", error);
    setNoEvents(true); // Ako dođe do greške u zahtjevu, postavi noEvents na true
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

  useEffect(() => {
    fetchAdvertisements();
  }, [selectedDate]);

  useEffect(() => {
    fetchFields();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="tereni-page-container">
      <header className="tereni-header">
        <MenuBar variant={["registered"]} search={true} />
      </header>

      <section className="map-calendar-section">
        <h2 className="section-title">MAPE</h2>
        <p className="section-subtitle">Odaberite datum da biste pretražili sponzorisane događaje</p>
        <div className="map-calendar-container">
          {/* Leaflet mapa */}
          <MapContainer center={[44.7722, 17.191]} zoom={13} className="map-container">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </MapContainer>

          {/* Kalendar */}
          <Calendar className="calendar" onChange={handleDateChange} value={selectedDate} />
        </div>
      </section>

      <div className="Events-body">
        <div className="Events-bar">
          <div className="Event-bar-title">SPONZORISANI DOGAĐAJI</div>
          {loading ? (
            <p>Učitavanje sponzorisanih događaja...</p>
          ) : noEvents ? (
            <p>Nema sponzorisanih događaja za odabrani datum.</p>
          ) : (
            <div className="Scroll-bar">
              <div className="Event-cards">
                {advertisements.map((advertisement) => (
                  <div key={advertisement.id} className="Event-card">
                    <h3>{advertisement.description} (Sponzorisano)</h3>
                    <p><strong>Datum:</strong> {advertisement.date}</p>
                    <p><strong>Lokacija:</strong> {advertisement.field_id}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="Fields-body">
        <div className="Fields-bar">
          <div className="Field-bar-title">TERENI</div>
          <div className="Field-bar-subtitle">Lista svih terena</div>
          {loading ? (
            <p>Učitavanje terena...</p>
          ) : (
            <div className="Scroll-bar">
              <ul className="Field-list">
                {fields.map((field) => (
                  <li key={field.id} className="Field-item">
                    <h3>{field.name}</h3>
                    <p>Lokacija: {field.location}</p>
                    <p>Latitude: {field.latitude}</p>
                    <p>Longitude: {field.longitude}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Tereni;
