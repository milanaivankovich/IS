import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "leaflet/dist/leaflet.css";
import "./Tereni.css";
import MenuBar from "../components/MenuBar.js";
import EventCard from "../components/EventCard.js";
import SponsoredEventCard from "../components/SponsoredEventCard.js";
import Footer from "../components/Footer.js";

const Tereni = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [events, setEvents] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);
  const [fields, setFields] = useState([]); // Dodato stanje za terene
  const [loading, setLoading] = useState(false);

  // Funkcija za dohvaćanje događaja iz backend-a
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const formattedDate = selectedDate ? selectedDate.toISOString().split("T")[0] : null;

      // Dohvatanje običnih događaja
      const eventsResponse = await axios.get("http://localhost:8000/api/activities/", {
        params: {
          date: formattedDate,
          lat: selectedLocation ? selectedLocation[0] : null,
          lng: selectedLocation ? selectedLocation[1] : null,
        },
      });

      // Dohvatanje sponzorisanih događaja
      const sponsoredResponse = await axios.get("http://localhost:8000/api/advertisements", {
        params: {
          date: formattedDate,
          lat: selectedLocation ? selectedLocation[0] : null,
          lng: selectedLocation ? selectedLocation[1] : null,
        },
      });

      setEvents(eventsResponse.data);
      setAdvertisements(sponsoredResponse.data);
    } catch (error) {
      console.error("Greška pri dohvaćanju događaja:", error);
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

  // Pozivanje funkcija za dohvaćanje podataka kad se promijeni lokacija ili datum
  useEffect(() => {
    if (selectedLocation || selectedDate) {
      fetchEvents();
    }
  }, [selectedDate, selectedLocation]);

  // Dohvatanje terena pri inicijalnom učitavanju
  useEffect(() => {
    fetchFields();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
  };

  return (
    <div className="tereni-page-container">
      <header className="tereni-header">
        <MenuBar variant={["registered"]} search={true} />
      </header>

      <section className="map-calendar-section">
        <h2 className="section-title">MAPE</h2>
        <p className="section-subtitle">Odaberite teren i datum da biste pretražili događaje</p>
        <div className="map-calendar-container">
          {/* Leaflet mapa */}
          <MapContainer center={[44.7722, 17.191]} zoom={13} className="map-container">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Automatsko generisanje markera za obične događaje */}
            {events.map((event) => (
              <Marker
                key={event.id}
                position={[event.lat, event.lng]} // Koristi latitude i longitude iz događaja
                eventHandlers={{
                  click: () => handleLocationClick([event.lat, event.lng]), // Postavlja odabranu lokaciju
                }}
              >
                <Popup>
                  <strong>{event.title}</strong>
                  <br />
                  {event.date}
                  <br />
                  {event.location}
                </Popup>
              </Marker>
            ))}

            {/* Automatsko generisanje markera za sponzorisane događaje */}
            {advertisements.map((event) => (
              <Marker
                key={event.id}
                position={[event.lat, event.lng]}
                eventHandlers={{
                  click: () => handleLocationClick([event.lat, event.lng]),
                }}
              >
                <Popup>
                  <strong>{event.title}</strong> (Sponzorisano)
                  <br />
                  {event.date}
                  <br />
                  {event.location}
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Kalendar */}
          <Calendar className="calendar" onChange={handleDateChange} value={selectedDate} />
        </div>
      </section>

      <div className="Events-body">
        <div className="Events-bar">
          <div className="Event-bar-title">DOGAĐAJI</div>
          {loading ? (
            <p>Učitavanje događaja...</p>
          ) : (
            <div className="Scroll-bar">
              <div className="Event-cards">
                {events.map((event) => (
                  <EventCard key={event.id} title={event.title} date={event.date} location={event.location} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="Events-bar">
          <div className="Event-bar-title">SPONZORISANO</div>
          {loading ? (
            <p>Učitavanje sponzorisanih događaja...</p>
          ) : (
            <div className="Scroll-bar">
              <div className="Event-cards">
                {advertisements.map((event) => (
                  <SponsoredEventCard key={event.id} title={event.title} date={event.date} location={event.location} />
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
