import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SponsoredEventCard from '../components/SponsoredEventCard';
import FavoriteCard from '../components/FavoriteCard';
import MessageCard from '../components/MessageCard';
import './UserProfile.css';
import './BusinessSubjectProfile.css';
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import CreatorImg from "../images/user.svg";
import NewAdvertisementCard from "../components/NewAdvertisementCard.js";
import { CiSettings } from "react-icons/ci";
import { IoIosCloseCircle } from "react-icons/io";
{/*proba za sponzorisane dogadjaje */ }
const BusinessSubjectProfile = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleFloatingWindow = () => {
    setIsVisible(!isVisible);
  };

  const [activeTab, setActiveTab] = useState("events");
  const [favorites, setFavorites] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [id, setID] = useState({
    "id": -1,
    "type": ''
  });
  const [subjectData, setSubjectData] = useState({
    "nameSportOrganization": "Sport organization",
    "profile_picture": null,
    "description": "",
    "email": "email",
  });

  useEffect(() => {
    const fetchIDType = async () => {
      await axios.get('http://localhost:8000/api/get-user-type-and-id/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((request) => {
          if (request.data.type === 'Client')
            window.location.replace("/userprofile");
          setID(request.data);
        })
        .catch((error) => {
          console.error("Error getting ID: ", error);
          alert("Neuspjesna autorizacija. Molimo ulogujte se ponovo... ");
          {/*window.location.replace("/login");*/ }
        });
    };

    fetchIDType();
  }, []);

  useEffect(() => {

    const fetchUserData = async () => {
      await axios.get('http://localhost:8000/api/business-subject/' + id.id + '/')
        .then(async response => {
          await setSubjectData({
            nameSportOrganization: response.data.nameSportOrganization,
            description: response.data.description,
            email: response.data.email,
            profile_picture: response.data.profile_picture ? 'http://localhost:8000' + response.data.profile_picture : null,
          })
        })
        .catch(error => {
          console.error('Error fetching data: ', error);
          alert('Error fetching data');
        });
    };

    if (id.id !== -1)
      fetchUserData();
  }, [id]);

  const [eventsData, setEventsData] = useState([]);
  const [selectionTitle, setSelectionTitle] = useState('Događaji');
  const [selectionSubtitle, setSelectionSubtitle] = useState('Predstojeći događaji koje je kreirao korisnik');

  // Funkcija za dohvaćanje podataka za različite kartice
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        switch (activeTab) {
          case "events":
            const eventsResponse = await axios.get('http://localhost:8000/api/advertisements/businesssubject/' + id.id + '/');
            setEventsData(eventsResponse.data);
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
            const activityResponse = await axios.get('http://127.0.0.1:8000/api/advertisementspast/businesssubject/' + id.id + '/', {
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

    if (id.id !== -1)
      fetchData();
  }, [id, activeTab]);

  return (
    <body>
      <header className="userprofile-menu">
        <MenuBar variant={[id.id !== -1 ? "registered" : "unregistered"]} search={true} />
      </header>
      <div className="userprofile-body">
        <div className="userprofile-header">
          <img src={subjectData.profile_picture ? subjectData.profile_picture : CreatorImg}
            className="userprofilepreview-image" alt="Creator" />
          <div className='name-surname-username'>
            <h0 className="userprofile-name">{subjectData.nameSportOrganization}</h0>
            <h1 className="userprofile-subtitle">{subjectData.description}</h1>
          </div>
          <CiSettings className='edituserprofile-button' onClick={() => window.location.replace('/editbusinessprofile')} />
        </div>
        <div>
          <nav className="profile-tabs">
            <button className={`tab-button ${activeTab === "events" ? "active" : ""}`}
              onClick={() => {
                setSelectionTitle('Događaji');
                setSelectionSubtitle('Predstojeći događaji koje je kreirao korisnik');
                setActiveTab("events");
              }}>Događaji</button>
            <button className={`tab-button ${activeTab === "favorites" ? "active" : ""}`} onClick={() => {
              setSelectionTitle('Omiljeno'); setSelectionSubtitle('Vaši omiljeni događaji');
              setActiveTab("favorites")
            }}>Omiljeno</button>
            <button className={`tab-button ${activeTab === "messages" ? "active" : ""}`} onClick={() => {
              setSelectionTitle('Poruke'); setSelectionSubtitle('');
              setActiveTab("messages")
            }

            }>Poruke</button>
            <button className={`tab-button ${activeTab === "activity" ? "active" : ""}`} onClick={() => {
              setSelectionTitle('Istoriјa aktivnosti'); setSelectionSubtitle('Stari događaji koje je kreirao korisnik');
              setActiveTab("activity")
            }}>Istorija Aktivnosti</button>
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
                    <div className="scroll-bar-user-profile">
                      {Array.isArray(eventsData) && eventsData.map((activity) => (
                        <SponsoredEventCard key={activity.id} event={activity} />
                      ))}
                    </div>
                    {(id.id !== -1) ? (
                      <button className="create-event-button" onClick={() => toggleFloatingWindow()}>
                        + Novi događaj
                      </button>
                    ) : null}
                    {isVisible ? (
                      <div>
                        <NewAdvertisementCard user={subjectData} pk={id.id} className="new-event-card" />
                        <IoIosCloseCircle className="close-icon-new-advertisement" onClick={() => toggleFloatingWindow()} />
                      </div>
                    ) : null}
                  </div>
                )}

                {activeTab === "favorites" && (
                  <div className="scroll-bar-user-profile">
                    {favorites.map((favorite) => (
                      <FavoriteCard key={favorite.id} title={favorite.title} description={favorite.description} />
                    ))}
                  </div>
                )}

                {activeTab === "messages" && (
                  <div className="messages-cards-container">
                    {messages.map((message) => (
                      <MessageCard key={message.id} sender={message.sender} content={message.content} />
                    ))}
                  </div>
                )}
               
               {activeTab === "activity" && (
                <div className="scroll-bar-user-profile">
                 {Array.isArray(activityHistory) && activityHistory.map((activity) => (
                   <SponsoredEventCard key={activity.id} event={activity} />
                 ))}
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

export default BusinessSubjectProfile;
