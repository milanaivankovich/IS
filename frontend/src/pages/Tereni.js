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
  const [sponsoredEvents, setSponsoredEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Funkcija za dohvaćanje događaja iz backend-a
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const formattedDate = selectedDate ? selectedDate.toISOString().split("T")[0] : null;

      // Dohvatanje običnih događaja
      const eventsResponse = await axios.get("http://localhost:5000/api/events", {
        params: {
          date: formattedDate, // Datum u formatu YYYY-MM-DD
          lat: selectedLocation ? selectedLocation[0] : null,
          lng: selectedLocation ? selectedLocation[1] : null,
        },
      });
      
      // Dohvatanje sponzorisanih događaja
      const sponsoredResponse = await axios.get("http://localhost:5000/api/sponsored-events", {
        params: {
          date: formattedDate,
          lat: selectedLocation ? selectedLocation[0] : null,
          lng: selectedLocation ? selectedLocation[1] : null,
        },
      });

      setEvents(eventsResponse.data);
      setSponsoredEvents(sponsoredResponse.data);
    } catch (error) {
      console.error("Greška pri dohvaćanju događaja:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pozivanje funkcije za dohvaćanje događaja kad se promijeni lokacija ili datum
  useEffect(() => {
    if (selectedLocation) {
      fetchEvents();
    }
  }, [selectedDate, selectedLocation]);

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
            {/* Primjer markera koji predstavlja mogući događaj */}
            <Marker
              position={[44.7722, 17.191]}
              eventHandlers={{ click: () => handleLocationClick([44.7722, 17.191]) }}
            >
              <Popup>Lokacija događaja 1</Popup>
            </Marker>
            {/* Dodaj dodatne markere po potrebi */}
          </MapContainer>

          {/* Kalendar */}
          <Calendar className="calendar" onChange={handleDateChange} value={selectedDate} />
        </div>
      </section>

      <div className="Events-body">
        <div className="Events-bar">
          <div className="Event-bar-title">DOGAĐAJI</div>
          <div className="Event-bar-subtitle">Prikaz događaja</div>
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
          <div className="Event-bar-subtitle">Sponzorisani događaji</div>
          {loading ? (
            <p>Učitavanje sponzorisanih događaja...</p>
          ) : (
            <div className="Scroll-bar">
              <div className="Event-cards">
                {sponsoredEvents.map((event) => (
                  <SponsoredEventCard key={event.id} title={event.title} date={event.date} location={event.location} />
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
