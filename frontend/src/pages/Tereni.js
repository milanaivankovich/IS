import React, { useState } from "react";
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
  const [selectedLocation, setSelectedLocation] = useState(null); // Dodano stanje za odabranu lokaciju
  const events = [
    // Primjer događaja s lokacijama
    { id: 1, title: "Događaj 1", date: new Date(), location: [44.7722, 17.191] },
    { id: 2, title: "Događaj 2", date: new Date(), location: [44.7822, 17.201] },
    // Dodajte više događaja ovdje
  ];

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Ovdje možete dodati logiku za filtriranje događaja na osnovu odabranog datuma
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    // Ovdje možete dodati logiku za filtriranje događaja na osnovu odabrane lokacije
  };

  // Filtriranje događaja na osnovu datuma i lokacije
  const filteredEvents = events.filter((event) => {
    const isSameDate = event.date.toDateString() === selectedDate.toDateString();
    const isSameLocation = selectedLocation ? 
      event.location[0] === selectedLocation[0] && event.location[1] === selectedLocation[1] : true;

    return isSameDate && isSameLocation;
  });

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
            {/* Marker za događaje */}
            {events.map((event) => (
              <Marker key={event.id} position={event.location} eventHandlers={{ click: () => handleLocationClick(event.location) }}>
                <Popup>{event.title}</Popup>
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
          <div className="Event-bar-subtitle">Šta ima novo u gradu?</div>
          <div className="Scroll-bar">
            <div className="Event-cards">
              {filteredEvents.map(event => (
                <EventCard key={event.id} title={event.title} />
              ))}
            </div>
          </div>
        </div>
        <div className="Events-bar">
          <div className="Event-bar-title">SPONZORISANO</div>
          <div className="Event-bar-subtitle">Sponzorisani događaji</div>
          <div className="Scroll-bar">
            <div className="Event-cards">
              <SponsoredEventCard />
              <SponsoredEventCard />
              <SponsoredEventCard />
              <SponsoredEventCard />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Tereni;
