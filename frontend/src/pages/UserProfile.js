import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SponsoredEventCard from '../components/SponsoredEventCard';
import EventCard from '../components/EventCard';
import MessageCard from '../components/MessageCard';
import ActivityCard from '../components/ActivityCard';
import './UserProfile.css';
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import CreatorImg from "../images/user.svg";
import EditEventCard from "../components/EditEventCard.js";
import { CiSettings } from "react-icons/ci";
import { IoIosCloseCircle } from "react-icons/io";
import FieldsCard from '../components/FieldsCard.js';
import Spinner from 'react-bootstrap/Spinner';
{/*proba za sponzorisane dogadjaje */ }
const UserProfile = () => {
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
  const [userData, setUserData] = useState({
    "first_name": 'Ime',
    "last_name": 'Prezime',
    "username": 'username',
    "email": '',
    "profile_picture": null
  });

  useEffect(() => {
    const fetchIDType = async () => {
      await axios.get('http://localhost:8000/api/get-user-type-and-id/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((request) => {
          if (request.data.type === 'BusinessSubject')
            window.location.replace("/userprofile1");
          setID(request.data);
        })
        .catch((error) => {
          console.error("Error getting ID: ", error);
          alert("Neuspjesna autorizacija. Molimo ulogujte se ponovo... ");
          {/*window.location.replace("/login");*/ }
        });
    };
    const fetchID = async () => {
      await axios.get('http://localhost:8000/api/get-client-id/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((request) => {
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
      await axios.get('http://localhost:8000/api/client/' + id.id + '/'
      ).then(async response => {
        await setUserData({
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          username: response.data.username,
          email: response.data.email,
          profile_picture: response.data.profile_picture ? 'http://localhost:8000' + response.data.profile_picture : null,
        })
      })
        //const imageResponse = await axios.get(response.data.profile_picture, { responseType: 'file' });


        .catch(error => {
          console.error('Error fetching data: ', error);
          alert('Error 404');
        });
    };

    if (id.id !== -1)
      fetchUserData();
  }, [id]);

  /*useEffect(() => {
    return () => {
      if (userData.profile_picture) {
        URL.revokeObjectURL(userData.profile_picture);
      }
    };
  }, [userData]); */

  const [eventsData, setEventsData] = useState([]);
  const [selectionTitle, setSelectionTitle] = useState('Događaji');
  const [selectionSubtitle, setSelectionSubtitle] = useState('Događaji koje je kreirao korisnik');
  //napraviti chain sa fetch
  // Funkcija za dohvaćanje podataka za različite kartice
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        switch (activeTab) {
          case "events":
            const eventsResponse = await axios.get('http://localhost:8000/clients/' + id.id + '/activities/');
            setEventsData(eventsResponse.data);
            break;
          case "favorites":
            const favoritesResponse = await axios.get('http://localhost:8000/api/client/favorite-fields/'+ id.id + '/', {
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
            const activityResponse = await axios.get('http://localhost:8000/api/user/activity', {
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
          <img src={userData.profile_picture ? userData.profile_picture : CreatorImg}
            className="userprofilepreview-image" alt="profile photo" />
          <div className='name-surname-username'>
            <h0 className="userprofile-name">{userData.first_name} {userData.last_name}</h0>
            <h1 className="userprofile-subtitle">@{userData.username}</h1>
          </div>
          <CiSettings className='edituserprofile-button' onClick={() => window.location.replace('/edituserprofile')} />
        </div>
        <div>
          <nav className="profile-tabs">
            <button className={`tab-button ${activeTab === "events" ? "active" : ""}`}
              onClick={() => {
                setSelectionTitle('Događaji');
                setSelectionSubtitle('Događaji koje je kreirao korisnik');
                setActiveTab("events");
              }}>Događaji</button>
            <button className={`tab-button ${activeTab === "favorites" ? "active" : ""}`} onClick={() => {
              setSelectionTitle('Omiljeno'); setSelectionSubtitle('Omiljeni tereni');
              setActiveTab("favorites")
            }}>Omiljeno</button>
            <button className={`tab-button ${activeTab === "messages" ? "active" : ""}`} onClick={() => {
              setSelectionTitle('Poruke'); setSelectionSubtitle('');
              setActiveTab("messages")
            }

            }>Poruke</button>
            <button className={`tab-button ${activeTab === "activity" ? "active" : ""}`} onClick={() => {
              setSelectionTitle('Istoriјa aktivnosti'); setSelectionSubtitle('Događaji kojima se korisnik pridružio');
              setActiveTab("activity")
            }}>Istorija Aktivnosti</button>
          </nav></div>

        <div className="userprofile-selection">
          <h1 className="userprofile-name">{selectionTitle}</h1>
          <h2 className="userprofile-subtitle">{selectionSubtitle}</h2>
          <section className="tab-content">
            {loading ? (
              <Spinner animation="border" />
            ) : (
              <div>
                {activeTab === "events" && (
                  <div className="events-section">
                    <div className="scroll-bar-user-profile">
                      {Array.isArray(eventsData) && eventsData.map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} />
                      ))}
                    </div>
                    {(id.id !== -1) ? (
                      <button className="create-event-button" onClick={() => toggleFloatingWindow()}>
                        + Novi događaj
                      </button>
                    ) : null}
                    {isVisible ? (
                      <div>
                        <EditEventCard user={userData} pk={id} className="new-event-card" />
                        <IoIosCloseCircle className="close-icon" onClick={() => toggleFloatingWindow()} />
                      </div>
                    ) : null}
                  </div>
                )}

                {activeTab === "favorites" && (
                <div className="scroll-bar-user-profile">
                {favorites.map((favorite) => (
                 <FieldsCard key={favorite.id} field={favorite} userId={id.id} userType={id.type}/>
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
                    {activityHistory.map((activity) => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div >
      <Footer />
    </body >
  );
};

export default UserProfile;
