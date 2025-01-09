import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SponsoredEventCard from '../components/SponsoredEventCard';
import SponsoredEventCardForBusinessSubject from '../components/SponsoredEventCardForBusinessSubject';
import MessageCard from '../components/MessageCard';
import './UserProfile.css';
import './BusinessSubjectProfile.css';
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import CreatorImg from "../images/user.svg";
import NewAdvertisementCard from "../components/NewAdvertisementCard.js";
import { CiSettings } from "react-icons/ci";
import { IoIosCloseCircle } from "react-icons/io";
import FieldsCard from '../components/FieldsCard.js';
import Spinner from 'react-bootstrap/esm/Spinner.js';

const BusinessSubjectProfile = () => {

  const uri = 'http://localhost:8000';

  //logika za prikaz bilo kog profila poslovnog

  const path = window.location.pathname;
  const segments = path.split('/');
  const [username, setUsername] = useState(segments[2]);

  const [subjectData, setSubjectData] = useState({
    "nameSportOrganization": "",
    "profile_picture": null,
    "description": "",
    "email": "",
  });

  useEffect(() => {

    const fetchUserData = async () => {
      await axios.get(`${uri}/api/business-subject/${username}/`
      ).then(async response => {
        await setSubjectData({
          nameSportOrganization: response.data.nameSportOrganization,
          description: response.data.description,
          email: response.data.email,
          profile_picture: response.data.profile_picture ? uri + response.data.profile_picture : null,
        })
      }).catch(error => {
        console.error('Error fetching data: ', error);
        alert('Error 404');
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


  //trenutni korisnik

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
      await axios.get(`${uri}/api/business-subject/${id.id}/`)
        .then(async response => {
          await setCurrentUserData({
            nameSportOrganization: response.data.nameSportOrganization,
            description: response.data.description,
            email: response.data.email,
            profile_picture: response.data.profile_picture ? uri + response.data.profile_picture : null,
          });
          if (window.location.pathname === '/userprofile1' && id.type === 'BusinessSubject')
            setUsername(response.data.nameSportOrganization);
        })
        .catch(error => {
          console.error('Error fetching data: ', error);
          //alert('Error 404');
        });
    };
    const fetchCurrentUserData = async () => {
      if (window.location.pathname === '/userprofile1' && id.type === 'Client')
        window.location.replace("/userprofile");
      await axios.get(`${uri}/api/client/${id.id}/`)
        .then(async response => {
          await setCurrentUserData({
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
  const [selectionSubtitle, setSelectionSubtitle] = useState('Predstojeći događaji koje je kreirao korisnik');

  // Funkcija za dohvaćanje podataka za različite kartice
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        switch (activeTab) {
          case "events":
            const eventsResponse = await axios.get(`${uri}/api/advertisements/businesssubject/${username}/`);
            setEventsData(eventsResponse.data);
            break;
          case "favorites":
            const favoritesResponse = await axios.get(`${uri}/api/business-subject/favorite-fields/${username}/`, {
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
            const activityResponse = await axios.get(`${uri}/api/advertisementspast/businesssubject/${username}/`, {
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
  }, [id, activeTab, username]);

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
          {((id.type === 'BusinessSubject') && (currentUserData.nameSportOrganization === username)) ? (
            <CiSettings className='edituserprofile-button' onClick={() => window.location.replace('/editbusinessprofile')} />
          ) : null}
        </div>
        <div>
          <nav className="profile-tabs">
            <button className='userprofile-tab-button'
              onClick={() => {
                setSelectionTitle('Događaji');
                setSelectionSubtitle('Predstojeći događaji koje je kreirao korisnik');
                setActiveTab("events");
              }}>Događaji</button>
            <button className='userprofile-tab-button' onClick={() => {
              setSelectionTitle('Omiljeno'); setSelectionSubtitle('Vaši omiljeni tereni');
              setActiveTab("favorites")
            }}>Omiljeno</button>
            {/*<button className={`tab-button ${activeTab === "messages" ? "active" : ""}`} onClick={() => {
              setSelectionTitle('Poruke'); setSelectionSubtitle('');
              setActiveTab("messages")
            }

            }>Poruke</button>*/}
            <button className='userprofile-tab-button' onClick={() => {
              setSelectionTitle('Istoriјa aktivnosti'); setSelectionSubtitle('Stari događaji koje je kreirao korisnik');
              setActiveTab("activity")
            }}>Istorija Aktivnosti</button>
          </nav></div>

        <div className="userprofile-selection">
          <h1 className="userprofile-name">{selectionTitle}</h1>
          <h2 className="userprofile-subtitle">{selectionSubtitle}</h2>
          <section className="tab-content">
            {loading ? (
              <Spinner className='spinner-border' animation="border" />
            ) : (
              <div>
                {activeTab === "events" && (
                  <div className="events-section">
                    <div className="scroll-bar-user-profile">
                      {Array.isArray(eventsData) && eventsData.map((activity) => (
                        <SponsoredEventCardForBusinessSubject user={subjectData} event={activity} currentUser={currentUserData} />
                      ))}
                    </div>
                    {((id.type === 'BusinessSubject') && (currentUserData.nameSportOrganization === username)) ? (
                      <button className="create-event-button" onClick={() => toggleFloatingWindow()}>
                        + Novi događaj
                      </button>
                    ) : null}
                    {isVisible ? (
                      <div>
                        <NewAdvertisementCard user={currentUserData} pk={id.id} className="new-event-card" />
                        <IoIosCloseCircle className="close-icon-new-advertisement" onClick={() => toggleFloatingWindow()} />
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
    </body >
  );
};

export default BusinessSubjectProfile;
