import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MessageCard from '../components/MessageCard';
import ActivityCard from '../components/ActivityCard';
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import CreatorImg from "../images/user.svg";
import EditEventCard from "../components/EditEventCard.js";
import { CiSettings } from "react-icons/ci";
import { IoIosCloseCircle } from "react-icons/io";
import FieldsCard from '../components/FieldsCard.js';
import Spinner from 'react-bootstrap/Spinner';
//import "bootstrap/dist/css/bootstrap.min.css";
//todo spinner.css bez ostalih stilova

import './UserProfile.css';

const UserProfile = () => {
  const uri = 'http://localhost:8000';

  //logika za prikaz bilo kog profila

  const path = window.location.pathname;
  const segments = path.split('/');
  const [username, setUsername] = useState(segments[2]);

  const [userData, setUserData] = useState({
    "first_name": '',
    "last_name": '',
    "username": 'user',
    "email": '',
    "profile_picture": null
  });

  useEffect(() => {

    const fetchUserData = async () => {
      await axios.get(`${uri}/api/client/${username}/`
      ).then(async response => {
        await setUserData({
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          username: response.data.username,
          email: response.data.email,
          profile_picture: response.data.profile_picture ? uri + response.data.profile_picture : null,
        })
      }).catch(error => {
        console.error('Error fetching data: ', error);
        //alert('Error 404');
      });
    };
    if (username)
      fetchUserData();
  }, [username]);

  /////////


  const [isVisible, setIsVisible] = useState(false);

  const toggleFloatingWindow = () => {
    setIsVisible(!isVisible);
  };

  const [activeTab, setActiveTab] = useState("events");
  const [favorites, setFavorites] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  //podaci korisnika koji je trenutno ulogovan u slucaju da udje na svoj nalog

  const [id, setID] = useState({
    "id": -1,
    "type": ''
  });

  const [currentUserData, setCurrentUserData] = useState({});

  useEffect(() => {
    const fetchIDType = async () => {
      await axios.get(`${uri}/api/get-user-type-and-id/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((request) => {
          setID(request.data);
        })
        .catch((error) => {
          console.error("Error getting ID: ", error);
          alert("Neuspjesna autorizacija. Molimo ulogujte se... ");
          window.location.replace("/login"); //todo probati /usertype1
        });
    };

    fetchIDType();
  }, []);

  useEffect(() => {
    const fetchSubjectData = async () => {
      if (window.location.pathname === '/userprofile' && id.type === 'BusinessSubject')
        window.location.replace("/userprofile1");
      await axios.get(`${uri}/api/business-subject/${id.id}/`)
        .then(async response => {
          await setCurrentUserData({
            nameSportOrganization: response.data.nameSportOrganization,
            description: response.data.description,
            email: response.data.email,
            profile_picture: response.data.profile_picture ? uri + response.data.profile_picture : null,
          });
        })
        .catch(error => {
          console.error('Error fetching data: ', error);
          alert('Error 404');
        });
    };
    const fetchCurrentUserData = async () => {
      await axios.get(`${uri}/api/client/${id.id}/`)
        .then(async response => {
          await setCurrentUserData({
            first_name: response.data.first_name,
            last_name: response.data.last_name,
            username: response.data.username,
            email: response.data.email,
            profile_picture: response.data.profile_picture ? uri + response.data.profile_picture : null,
          })
          if (window.location.pathname === '/userprofile' && id.type === 'Client')
            setUsername(response.data.username);
        }).catch(error => {
          console.error('Error fetching data: ', error);
          alert('Error 404');
        });
    };

    if (id.id !== -1) {
      if (id.type === 'Client')
        fetchCurrentUserData();
      else if (id.type === 'BusinessSubject')
        fetchSubjectData();
      else alert('Unsupported client type.');
    }
  }, [id]);


  const [eventsData, setEventsData] = useState([]);
  const [selectionTitle, setSelectionTitle] = useState('Događaji');
  const [selectionSubtitle, setSelectionSubtitle] = useState('Događaji koje je kreirao korisnik');

  // Funkcija za dohvaćanje podataka za različite kartice
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        switch (activeTab) {
          case "events":
            const eventsResponse = await axios.get(`${uri}/activities/username/${username}/`);
            setEventsData(eventsResponse.data);
            break;
          case "favorites": //todo
            const favoritesResponse = await axios.get(`${uri}/api/client/favorite-fields/${username}/`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setFavorites(favoritesResponse.data);
            break;
          case "messages": //todo
            const messagesResponse = await axios.get('http://localhost:8000/api/user/messages', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setMessages(messagesResponse.data);
            break;
          case "activity": //todo
            const activityResponse = await axios.get(`${uri}/api/user/activity`, {
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

    if (username)
      fetchData();
  }, [activeTab, username, id]);

  return (
    <body className='user-profile-page'>
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
          {((id.type === 'Client') && (currentUserData.username === username)) ? (
            <CiSettings className='edituserprofile-button' onClick={() => window.location.replace('/edituserprofile')} />
          ) : null}
        </div>
        <div>
          <nav className="profile-tabs">
            <button className={`tab - button ${activeTab === "events" ? "active" : ""}`}
              onClick={() => {
                setSelectionTitle('Događaji');
                setSelectionSubtitle('Događaji koje je kreirao korisnik');
                setActiveTab("events");
              }}>Događaji</button>
            <button className={`tab - button ${activeTab === "favorites" ? "active" : ""} `} onClick={() => {
              setSelectionTitle('Omiljeno'); setSelectionSubtitle('Omiljeni tereni korisnika');
              setActiveTab("favorites")
            }}>Omiljeno</button>
            {/*<button className={`tab - button ${activeTab === "messages" ? "active" : ""} `} onClick={() => {
              setSelectionTitle('Poruke'); setSelectionSubtitle('');
              setActiveTab("messages")
            }

            }>Poruke</button>*/}
            <button className={`tab - button ${activeTab === "activity" ? "active" : ""} `} onClick={() => {
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
                    {((id.type === 'Client') && (currentUserData.username === username)) ? (
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
                      <FieldsCard key={favorite.id} field={favorite} userId={id.id} userType={id.type} />
                    ))}
                  </div>
                )}

                {//todo
                  activeTab === "messages" && (
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
