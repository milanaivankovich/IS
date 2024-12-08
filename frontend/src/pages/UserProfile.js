import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';
import SponsoredEventCard from '../components/SponsoredEventCard';
import FavoriteCard from '../components/FavoriteCard';
import MessageCard from '../components/MessageCard';
import ActivityCard from '../components/ActivityCard';
import './UserProfile.css';
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import CreatorImg from "../images/user.svg";
import EditEventCard from "../components/EditEventCard.js";
import { CiSettings } from "react-icons/ci";
import { IoIosCloseCircle } from "react-icons/io";
{/*proba za sponzorisane dogadjaje */}
const UserProfile = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleFloatingWindow = () => {
    setIsVisible(!isVisible);
  };

  const [activeTab, setActiveTab] = useState("events");
  const [userEvents, setUserEvents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [id, setID]=useState({
    "pk": -1,
  });
  const [userData, setUserData] = useState({
    "first_name": 'Ime',
    "last_name": 'Prezime',
    "username": 'username',
    "email": '',
    "profile_picture": null
  });

  useEffect(() => {

      const fetchID = async ()=> {
      await axios.get('http://localhost:8000/api/get-client-id/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((request) => {
          setID(request.data);
        })
        .catch((error) => {
          console.error("Error getting ID: ",error);
          alert("Neuspjesna autorizacija. Molimo ulogujte se ponovo... ");
        {/*window.location.replace("/login");*/}
        });
      };

      fetchID();
    },[]);
  
    useEffect(() => {

      const fetchUserData = async ()=> {
      await axios.get('http://localhost:8000/api/client/'+id.pk+'/')
        .then(response => {
          setUserData(response.data);
        })
        .catch(error => {
          console.error('Error fetching data: ', error);
          alert('Error fetching data');
        });
      };

      if(id.pk!==-1)
        fetchUserData();
    }, [id]);

  // Funkcija za dohvaćanje podataka za različite kartice
  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case "events":
          const eventsResponse = await axios.get('http://localhost:8000/api/advertisement/sport/1/', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setUserEvents(eventsResponse.data);
          break;
        case "favorites":
          const favoritesResponse = await axios.get('http://localhost:8000/api/user/favorites', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setFavorites(favoritesResponse.data);
          break;
        case "messages":
          const messagesResponse = await axios.get('http://localhost:8000/api/user/messages', {
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
      setSelectionSubtitle("Nema podataka");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const [selectionTitle, setSelectionTitle] = useState('Događaji');
  const [selectionSubtitle,setSelectionSubtitle] = useState('Događaji koje je kreirao korisnik');

  return (
    <body>
      <header className="userprofile-menu">
        <MenuBar variant={[id!==-1 ? "registered" : "unregistered"]} search={true} />
      </header>
      <div className="userprofile-body">
        <div className="userprofile-header">
          <img src={userData.profile_picture!==null ? userData.profile_picture: CreatorImg} 
          className="userprofilepreview-image" alt="Creator" />
          <div className='name-surname-username'>
            <h0 className="userprofile-name">{userData.first_name } {userData.last_name}</h0>
            <h1 className="userprofile-subtitle">@{userData.username}</h1>
          </div>
          <CiSettings className='edituserprofile-button' onClick={() => window.location.replace('/edituserprofile')} />
        </div>
          <div>
            <nav className="profile-tabs">
          <button className={`tab-button ${activeTab === "events" ? "active" : ""}`} 
          onClick={() => {
            setSelectionTitle('Događaji'); setSelectionSubtitle('Događaji koje je kreirao korisnik');
            setActiveTab("events");
          }}>Događaji</button>
          <button className={`tab-button ${activeTab === "favorites" ? "active" : ""}`} onClick={() => 
            {
              setSelectionTitle('Omiljeno'); setSelectionSubtitle('Vaši omiljeni događaji');
              setActiveTab("favorites")}}>Omiljeno</button>
          <button className={`tab-button ${activeTab === "messages" ? "active" : ""}`} onClick={() =>
            {
              setSelectionTitle('Poruke'); setSelectionSubtitle('');
              setActiveTab("messages")}  
            
          }>Poruke</button>
          <button className={`tab-button ${activeTab === "activity" ? "active" : ""}`} onClick={() => 
            {
              setSelectionTitle('Istoriјa aktivnosti'); setSelectionSubtitle('Događaji kojima se korisnik pridružio');
              setActiveTab("activity")}}>Istorija Aktivnosti</button>
        </nav></div>
        
          <div className="userprofile-selection">
            <h1 className="userprofile-name">{selectionTitle}</h1>
            <h2 className="userprofile-subtitle">{selectionSubtitle}</h2>
            <section className="tab-content">
              {loading ? (
                <p>Učitavanje...</p>
                ) : (
              <div>
                {activeTab === "events" && (
                  <div className="events-section">
                  <div className="event-cards-container">
                  {Array.isArray(userEvents) && userEvents.map((advertisement) => (
                    <SponsoredEventCard key={advertisement.id} event={advertisement} />
                  ))}
                </div>
                { (id.pk!==-1) ? (
                  <button className="create-event-button" onClick={()=>toggleFloatingWindow()}>
                    + Novi događaj
                  </button> 
                  ) : null }
                { isVisible ? (
                <div>
                  <EditEventCard user={userData} className="new-event-card" />
                  <IoIosCloseCircle className="close-icon" onClick={()=>toggleFloatingWindow()}/>
                </div>
                ): null }
              </div>
            )}

            {activeTab === "favorites" && (
              <div className="favorites-section">
                <div className="favorites-cards-container">
                  {favorites.map((favorite) => (
                    <FavoriteCard key={favorite.id} title={favorite.title} description={favorite.description} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "messages" && (
              <div className="messages-section">
                <div className="messages-cards-container">
                  {messages.map((message) => (
                    <MessageCard key={message.id} sender={message.sender} content={message.content} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="activity-section">
                <div className="activity-cards-container">
                  {activityHistory.map((activity) => (
                    <ActivityCard key={activity.id} description={activity.description} date={activity.date} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
              </section>
          </div>
        </div>
      <Footer />
    </body>
  );
};

export default UserProfile;
