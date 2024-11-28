import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import FavoriteCard from '../components/FavoriteCard';
import MessageCard from '../components/MessageCard';
import ActivityCard from '../components/ActivityCard';
import './UserProfile.css';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("events");
  const [userEvents, setUserEvents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Funkcija za dohvaćanje podataka za različite kartice
  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case "events":
          const eventsResponse = await axios.get('http://localhost:5000/api/user/events', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setUserEvents(eventsResponse.data);
          break;
        case "favorites":
          const favoritesResponse = await axios.get('http://localhost:5000/api/user/favorites', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setFavorites(favoritesResponse.data);
          break;
        case "messages":
          const messagesResponse = await axios.get('http://localhost:5000/api/user/messages', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setMessages(messagesResponse.data);
          break;
        case "activity":
          const activityResponse = await axios.get('http://localhost:5000/api/user/activity', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setActivityHistory(activityResponse.data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  return (
    <div className="user-profile">
      <header className="profile-header">
        <h1>IME I PREZIME</h1>
        {/* Navigacione kartice */}
        <nav className="profile-tabs">
          <button className={`tab-button ${activeTab === "events" ? "active" : ""}`} onClick={() => setActiveTab("events")}>Događaji</button>
          <button className={`tab-button ${activeTab === "favorites" ? "active" : ""}`} onClick={() => setActiveTab("favorites")}>Omiljeno</button>
          <button className={`tab-button ${activeTab === "messages" ? "active" : ""}`} onClick={() => setActiveTab("messages")}>Poruke</button>
          <button className={`tab-button ${activeTab === "activity" ? "active" : ""}`} onClick={() => setActiveTab("activity")}>Istorija Aktivnosti</button>
        </nav>
      </header>

      <section className="tab-content">
        {loading ? (
          <p>Učitavanje podataka...</p>
        ) : (
          <>
            {activeTab === "events" && (
              <div className="events-section">
                <h2 className="section-title">Događaji</h2>
                <p className="section-subtitle">Događaji koje je kreirao korisnik</p>
                <div className="event-cards-container">
                  {userEvents.map((event) => (
                    <EventCard key={event.id} title={event.title} description={event.description} />
                  ))}
                </div>
                <button className="create-event-button" onClick={handleCreateEvent}>
                  + Novi događaj
                </button>
              </div>
            )}

            {activeTab === "favorites" && (
              <div className="favorites-section">
                <h2 className="section-title">Omiljeni Događaji</h2>
                <p className="section-subtitle">Vaši omiljeni događaji</p>
                <div className="favorites-cards-container">
                  {favorites.map((favorite) => (
                    <FavoriteCard key={favorite.id} title={favorite.title} description={favorite.description} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "messages" && (
              <div className="messages-section">
                <h2 className="section-title">Poruke</h2>
                <p className="section-subtitle">Vaše poruke</p>
                <div className="messages-cards-container">
                  {messages.map((message) => (
                    <MessageCard key={message.id} sender={message.sender} content={message.content} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="activity-section">
                <h2 className="section-title">Istorija Aktivnosti</h2>
                <p className="section-subtitle">Vaša aktivnost na platformi</p>
                <div className="activity-cards-container">
                  {activityHistory.map((activity) => (
                    <ActivityCard key={activity.id} description={activity.description} date={activity.date} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default UserProfile;
