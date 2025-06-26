import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActivityCard from '../components/ActivityCard';
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import CreatorImg from "../images/user.svg";
import EditEventCard from "../components/EditEventCard.js";
import { CiSettings } from "react-icons/ci";
import FieldsCard from '../components/FieldsCard.js';
import Spinner from 'react-bootstrap/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './UserProfile.css';

const UserProfile = () => {
  const uri = 'http://localhost:8000';
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Get username from URL
  const path = window.location.pathname;
  const segments = path.split('/');
  const [username, setUsername] = useState(segments[2] || '');

  // User data states
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    profile_picture: null
  });

  const [loadingUser, setLoadingUser] = useState(true);
  const [currentUserData, setCurrentUserData] = useState({});
  const [id, setID] = useState({ id: -1, type: '' });

  // Tab and data states
  const [activeTab, setActiveTab] = useState("events");
  const [eventsData, setEventsData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [registered, setRegistered] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Analytics data
const [analyticsData, setAnalyticsData] = useState({
    favorite_sport: null,
    created_by_sport: [],
    participated_by_sport: [],
    total_created: 0,
    total_participated: 0
});
  // Tab titles
  const [selectionTitle, setSelectionTitle] = useState('Događaji');
  const [selectionSubtitle, setSelectionSubtitle] = useState('Događaji koje je kreirao korisnik');

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${uri}/api/client/${username}/`);
        setUserData({
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          username: response.data.username,
          email: response.data.email,
          profile_picture: response.data.profile_picture ? uri + response.data.profile_picture : null,
        });
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    if (username) fetchUserData();
  }, [username]);

  // Fetch current user ID and type
  useEffect(() => {
    const fetchIDType = async () => {
      try {
        const response = await axios.get(`${uri}/api/get-user-type-and-id/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setID(response.data);
      } catch (error) {
        console.error("Error getting ID: ", error);
        window.location.replace("/login");
      }
    };

    fetchIDType();
  }, []);

  // Fetch current user data based on type
  useEffect(() => {
    const fetchCurrentUserData = async () => {
      try {
        if (id.type === 'Client') {
          const response = await axios.get(`${uri}/api/client/${id.id}/`);
          setCurrentUserData({
            first_name: response.data.first_name,
            last_name: response.data.last_name,
            username: response.data.username,
            email: response.data.email,
            profile_picture: response.data.profile_picture ? uri + response.data.profile_picture : null,
          });
          if (window.location.pathname === '/userprofile') {
            setUsername(response.data.username);
          }
        } else if (id.type === 'BusinessSubject') {
          if (window.location.pathname === '/userprofile') {
            window.location.replace("/userprofile1");
          }
          const response = await axios.get(`${uri}/api/business-subject/${id.id}/`);
          setCurrentUserData({
            nameSportOrganization: response.data.nameSportOrganization,
            description: response.data.description,
            email: response.data.email,
            profile_picture: response.data.profile_picture ? uri + response.data.profile_picture : null,
          });
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
      } finally {
        setLoadingUser(false);
      }
    };

    if (id.id !== -1) {
      fetchCurrentUserData();
    }
  }, [id]);

  // Fetch analytics data
useEffect(() => {
    const fetchAnalyticsData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No token found");
                return;
            }

            const response = await axios.get(`${uri}/api/user-analytics/${username}/`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true  // Include cookies if using session auth
            });
            
            setAnalyticsData({
                favorite_sport: response.data.favorite_sport,
                created_by_sport: response.data.created_by_sport,
                participated_by_sport: response.data.participated_by_sport,
                total_created: response.data.total_created,
                total_participated: response.data.total_participated
            });
        } catch (error) {
            console.error("Error fetching analytics:", error);
            if (error.response?.status === 403) {
                alert("You don't have permission to view this data");
            }
        }
    };

    if (activeTab === "analytics" && username) {
        fetchAnalyticsData();
    }
}, [activeTab, username]);

  // Fetch data for current tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        switch (activeTab) {
          case "events":
            const eventsResponse = await axios.get(`${uri}/activities/username/${username}/`);
            setEventsData(eventsResponse.data);
            break;
          case "favorites":
            const favoritesResponse = await axios.get(`${uri}/api/client/favorite-fields/${username}/`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setFavorites(favoritesResponse.data);
            break;
          case "registered-activities":
            const messagesResponse = await axios.get(`${uri}/api/registered-events/${username}/`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setRegistered(messagesResponse.data);
            break;
          case "activity":
            const activityResponse = await axios.get(`${uri}/api/events/history/${username}/`, {
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

    if (username) fetchData();
  }, [activeTab, username, id]);

  const toggleFloatingWindow = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className='user-profile-page'>
      <header className="userprofile-menu">
        <MenuBar variant={"registered"} search={true} />
      </header>
      
      {loadingUser ? (
        <div className='loading-line'></div>
      ) : (
        <div className="userprofile-body">
          <div className="userprofile-header">
            <img 
              src={userData.profile_picture || CreatorImg}
              className="userprofilepreview-image" 
              alt="profile" 
            />
            <div className='name-surname-username'>
              <h0 className="userprofile-name">{userData.first_name} {userData.last_name}</h0>
              <h1 className="userprofile-subtitle">@{userData.username}</h1>
            </div>
            {id.type === 'Client' && currentUserData.username === username && (
              <CiSettings 
                className='edituserprofile-button' 
                onClick={() => window.location.replace('/edituserprofile')} 
              />
            )}
          </div>

          <div>
            <nav className="profile-tabs">
              <button 
                className={`userprofile-tab-button ${activeTab === "events" ? "active" : ""}`}
                onClick={() => {
                  setSelectionTitle('Događaji');
                  setSelectionSubtitle('Događaji koje je kreirao korisnik');
                  setActiveTab("events");
                }}
              >
                Događaji
              </button>
              
              <button 
                className={`userprofile-tab-button ${activeTab === "favorites" ? "active" : ""}`}
                onClick={() => {
                  setSelectionTitle('Omiljeno'); 
                  setSelectionSubtitle('Vaši omiljeni tereni');
                  setActiveTab("favorites");
                }}
              >
                Omiljeno
              </button>
              
              <button 
                className={`userprofile-tab-button ${activeTab === "registered-activities" ? "active" : ""}`}
                onClick={() => {
                  setSelectionTitle('Prijave na aktivnosti'); 
                  setSelectionSubtitle('Događaji kojima se korisnik pridružio');
                  setActiveTab("registered-activities");
                }}
              >
                Prijave na aktivnosti
              </button>
              
              <button 
                className={`userprofile-tab-button ${activeTab === "activity" ? "active" : ""}`}
                onClick={() => {
                  setSelectionTitle('Istorija aktivnosti'); 
                  setSelectionSubtitle('Događaji koji su prošli');
                  setActiveTab("activity");
                }}
              >
                Istorija Aktivnosti
              </button>
              
              <button 
                className={`userprofile-tab-button ${activeTab === "analytics" ? "active" : ""}`}
                onClick={() => {
                  setSelectionTitle('Analitika'); 
                  setSelectionSubtitle('Statistika učestvovanja na aktivnostima');
                  setActiveTab("analytics");
                }}
              >
                Analitika
              </button>
            </nav>
          </div>

          <div className="userprofile-selection">
            <h1 className="userprofile-name">{selectionTitle}</h1>
            <h2 className="userprofile-subtitle">{selectionSubtitle}</h2>
            
            <section className="tab-content">
              {loading ? (
                <Spinner className='spinner-border' animation="border" />
              ) : (
                <>
                  {activeTab === "events" && (
                    <div className="events-section">
                      <div className="scroll-bar-user-profile">
                        {eventsData.map((activity) => (
                          <ActivityCard key={activity.id} activity={activity} />
                        ))}
                      </div>
                      {id.type === 'Client' && currentUserData.username === username && (
                        <>
                          <button 
                            className="create-event-button" 
                            onClick={toggleFloatingWindow}
                          >
                            + Novi događaj
                          </button>
                          {isVisible && (
                            <EditEventCard 
                              user={currentUserData} 
                              pk={id.id} 
                              event={{ id: -1 }}
                              className="new-event-card" 
                              closeFunction={toggleFloatingWindow} 
                            />
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === "favorites" && (
                    <div className="scroll-bar-user-profile">
                      {favorites.map((favorite) => (
                        <FieldsCard 
                          key={favorite.id} 
                          field={favorite} 
                          userId={id.id} 
                          userType={id.type} 
                        />
                      ))}
                    </div>
                  )}

                  {activeTab === "registered-activities" && (
                    <div className="scroll-bar-user-profile">
                      {registered.map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} />
                      ))}
                    </div>
                  )}

                  {activeTab === "activity" && (
                    <div className="scroll-bar-user-profile">
                      {id.type === 'Client' && currentUserData.username === username ? (
                        activityHistory.map((activity) => (
                          <ActivityCard key={activity.id} activity={activity} />
                        ))
                      ) : (
                        <div className="history-activity-container">
                          <div className="history-activity-text">
                            <img 
                              src={userData.profile_picture || CreatorImg} 
                              className="creator-image" 
                              alt="Creator" 
                            />
                            &nbsp;&nbsp;
                            {userData.username} 
                            <hr/>
                            <br/>
                            <FontAwesomeIcon icon={faComment} className="icon"/>
                            U PROŠLOSTI JE KREIRAO {activityHistory.length} AKTIVNOSTI
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  

{activeTab === "analytics" && (
    <div className="analytics-section">
        <div className="analytics-summary">
            <h3>Omiljeni sport: {analyticsData.favorite_sport || 'Nema podataka'}</h3>
            <h4>Ukupno kreiranih događaja: {analyticsData.total_created}</h4>
            <h4>Ukupno prijavljenih događaja: {analyticsData.total_participated}</h4>
        </div>
        
        <div className="charts-container">
            <div className="chart">
                <h4>Kreirani događaji po sportovima</h4>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={analyticsData.created_by_sport}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                    >
                        <XAxis type="number" />
                        <YAxis dataKey="sport__name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="count" name="Broj događaja" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="chart">
                <h4>Prijavljeni događaji po sportovima</h4>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={analyticsData.participated_by_sport}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                    >
                        <XAxis type="number" />
                        <YAxis dataKey="sport__name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="count" name="Broj događaja" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
)}
                </>
              )}
            </section>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default UserProfile;