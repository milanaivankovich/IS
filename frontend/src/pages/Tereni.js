import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "leaflet/dist/leaflet.css";
import "./Tereni.css";
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";

const Tereni = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [advertisements, setAdvertisements] = useState([]);
  const [fields, setFields] = useState([]); // Dodato stanje za terene
  const [loading, setLoading] = useState(false);

  // Funkcija za dohvaćanje sponzorisanih događaja iz backend-a, sada samo filtriranih po datumu
  const fetchAdvertisements = async () => {
    setLoading(true);
    try {
      const formattedDate = selectedDate ? selectedDate.toISOString().split("T")[0] : null;

    // Dohvatanje sponzorisanih događaja po datumu
      const sponsoredResponse = await axios.get("http://localhost:8000/api/advertisement/" + formattedDate);

      setAdvertisements(sponsoredResponse.data);
    } catch (error) {
      console.error("Greška pri dohvaćanju sponzorisanih događaja:", error);
    } finally {
      setLoading(false);
    }
  };

  // Funkcija za dohvaćanje terena iz backend-a
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

  // Pozivanje funkcija za dohvaćanje podataka kad se promijeni datum
  useEffect(() => {
    fetchAdvertisements();
  }, [selectedDate]);

  // Dohvatanje terena pri inicijalnom učitavanju
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
          ) : (
            <div className="Scroll-bar">
              <div className="Event-cards">
                {advertisements.map((advertisement) => (
                  <div key={advertisement.id} className="Event-card">
                    <h3>{advertisement.description} (Sponzorisano)</h3>
                    <p><strong>Datum:</strong> {advertisement.date}</p>
                    <p><strong>Lokacija:</strong> {advertisement.field_id
                    }</p>
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
