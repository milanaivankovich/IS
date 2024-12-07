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

const Tereni = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedField, setSelectedField] = useState(null);
  const [advertisements, setAdvertisements] = useState([]);
  const [filteredAdvertisements, setFilteredAdvertisements] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noEvents, setNoEvents] = useState(false);

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
  };

  // Funkcija koja se poziva kada korisnik odabere datum
  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchFilteredAdvertisements(selectedField, date);
  };

  // Funkcija za resetovanje datuma
  const handleDateReset = () => {
    setSelectedDate(null);
    setSelectedField(null); // Resetujemo i teren
    fetchFilteredAdvertisements(null, null); // Prikazujemo sve oglase
  };

  useEffect(() => {
    fetchFields();
  }, []);

  useEffect(() => {
    fetchFilteredAdvertisements(selectedField, selectedDate);
  }, [selectedField, selectedDate]);

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

            {/* Dodavanje markera za svaki teren */}
            {fields.map((field) => (
              <Marker
                key={field.id}
                position={[field.latitude, field.longitude]}
                eventHandlers={{ click: () => handleMarkerClick(field) }}
              >
                <Popup>
                  <h3>{"Sportski teren"}</h3>
                  <p><strong>Lokacija:</strong> {field.location}</p>
                  <img
                    src={field.image}
                    alt={`Slika terena ${field.name}`}
                    style={{ width: "100%", height: "auto", maxWidth: "200px" }}
                  />
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Kalendar */}
          <Calendar className="calendar" onChange={handleDateChange} value={selectedDate} />
          
          {/* Dugme za resetovanje datuma */}
          <button onClick={handleDateReset} className="reset-date-button">Poništi datum</button>
        </div>
      </section>

      <div className="Events-body">
        <div className="Events-bar">
          <div className="Event-bar-title">SPONZORISANI DOGAĐAJI</div>
          {loading ? (
            <p>Učitavanje sponzorisanih događaja...</p>
          ) : noEvents ? (
            <p>Nema sponzorisanih događaja za odabrani datum ili lokaciju.</p>
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
