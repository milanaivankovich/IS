import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SponsoredEventCard from '../components/SponsoredEventCard';
import ActivityCard from '../components/ActivityCard';
import './UserProfile.css';
import './BusinessSubjectProfile.css';
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import './TerenProfil.css';
import NewReviewCard from '../components/NewReviewCard.js';
import { IoIosCloseCircle } from "react-icons/io";
import ReviewCard from '../components/ReviewCard.js';
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FaStar, FaRegStar } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faCalendarAlt, faClock } from '@fortawesome/free-solid-svg-icons';


const TerenProfil = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState({
    "first_name": "",
    "last_name": "",
    "username": "",
    "email": "email",
    "profile_picture": null
  });

  const [businessSubject, setBusinessSubject] = useState({
    "nameSportOrganization": "",
    "profile_picture": null,
    "description": "",
    "email": "",
    "password": ""
  });

  const [idField, setIdField] = useState({
    "id": -1
  });
  const [id, setID] = useState({
    "id": -1,
    "type": ''
  });
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/get-user-type-and-id/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setID(response.data);
        setUserId(response.data.id);
      } catch (error) {
        console.error("Greška prilikom dohvaćanja ID-a korisnika:", error);
      }
    };
    fetchUserId();
  }, []);

  const checkIfFavorited = async () => {
    if (!userId) return;

    try {
      if (id.type === 'BusinessSubject') {
        const businessSubjectUrl = `http://127.0.0.1:8000/api/business-subject/${userId}/`;
        const businessResponse = await axios.get(businessSubjectUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setBusinessSubject({
          nameSportOrganization: businessResponse.data.nameSportOrganization,
          profile_picture: businessResponse.data.profile_picture,
          description: businessResponse.data.description,
          email: businessResponse.data.email,
          password: businessResponse.data.password,
        });

        const url = `http://127.0.0.1:8000/api/business-subject/favorite-fields/${businessResponse.data.nameSportOrganization}/`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const isFieldFavorited = response.data.some(field => field.id === idField.id);
        setIsFavorited(isFieldFavorited);
      }

      if (id.type === 'Client') {
        const userUrl = `http://127.0.0.1:8000/api/client/${userId}/`;
        const userResponse = await axios.get(userUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setUser({
          first_name: userResponse.data.first_name,
          last_name: userResponse.data.last_name,
          username: userResponse.data.username,
          email: userResponse.data.email,
          profile_picture: userResponse.data.profile_picture,
        });

        const favoriteFieldsUrl = `http://127.0.0.1:8000/api/client/favorite-fields/${userResponse.data.username}/`;
        const favoriteResponse = await axios.get(favoriteFieldsUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const isFieldFavorited = favoriteResponse.data.some(field => field.id === idField.id);
        setIsFavorited(isFieldFavorited);
      }

    } catch (error) {
      console.error('Greška prilikom dohvaćanja podataka:', error);
    }
  };

  useEffect(() => {
    if (idField.id !== -1 && userId) {
      checkIfFavorited();
    }
  }, [idField.id, userId]);


  const toggleFavorite = async () => {
    const action = !isFavorited ? 'add' : 'remove';
    setIsFavorited(!isFavorited);

    if (!userId) return;

    const url = id.type === 'Client'
      ? `http://127.0.0.1:8000/api/client/update-favorite-fields/${userId}/`
      : `http://127.0.0.1:8000/api/business-subject/update-favorite-fields/${userId}/`;

    try {
      await axios.post(url,
        { field_id: idField.id, action: action },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      console.log('Status omiljenog terena ažuriran');
      checkIfFavorited();
    } catch (error) {
      console.error('Greška prilikom ažuriranja statusa omiljenog terena:', error);
    }
  };



  const toggleFloatingWindow = () => {
    setIsVisible(!isVisible);
  };

  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [information, setInformation] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fieldData, setFieldData] = useState({
    "id": -1,
    "location": "",
    "precise_location": "",
    "latitude": 0,
    "longitude": 0,
    "sports": [],
    "is_suspended": false,
    "image": null,
  });

  useEffect(() => {

    const fetchUserData = async () => {
      await axios.get('http://localhost:8000/api/client/' + id.id + '/')
        .then(response => {
          setUser(response.data);
        })
        .catch(error => {
          console.error('Error fetching data: ', error);
        });
    };

    if (id.id !== -1)
      fetchUserData();
  }, [id]);

  useEffect(() => {
    const fetchIDType = async () => {
      await axios.get('http://localhost:8000/api/get-user-type-and-id/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((request) => {
          setID(request.data);
        })
        .catch((error) => {
          console.error("Error getting ID: ", error);
        });
    };

    fetchIDType();
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    const idFromUrl = path.split("/").pop();
    if (!isNaN(idFromUrl)) {
      setIdField({ id: parseInt(idFromUrl, 10) });
    }
  }, []);

  useEffect(() => {

    const fetchFieldData = async () => {
      await axios.get('http://localhost:8000/api/advertisements/field/' + id.id + '/')
        .then(response => {
          setFieldData(response.data);
        })
        .catch(error => {
          console.error('Error fetching data: ', error);
        });
    };

    if (idField.id !== -1)
      fetchFieldData();
  }, [idField]);

  const [eventsData, setEventsData] = useState([]);
  const [selectionTitle, setSelectionTitle] = useState('Događaji');
  const [selectionSubtitle, setSelectionSubtitle] = useState('Događaji koji su na terenu');
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Učitavanje podataka odmah, bez obzira na trenutno aktivni tab
        const informationResponse = await axios.get(`http://localhost:8000/api/field/id/${idField.id}/`);
        setInformation(informationResponse.data);

        const eventsResponse = await axios.get(`http://localhost:8000/api/advertisements/field/${idField.id}/`);
        setEventsData(eventsResponse.data);

        const reviewsResponse = await axios.get(`http://localhost:8000/api/reviews/${idField.id}/`);
        setReviews(reviewsResponse.data);

        const activitiesResponse = await axios.get(`http://localhost:8000/activities/field/${idField.id}/`);
        setActivities(activitiesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idField]);

  return (
    <body>
      <header className="userprofile-menu">
        <MenuBar variant={[idField.id !== -1 ? "registered" : "unregistered"]} search={true} />
      </header>
      <div className="userprofile-body">
        <div className="userprofile-header">
          <img src={`http://127.0.0.1:8000${information.image}`} alt="Teren" className="userprofilepreview-image" />
          <div className='name-surname-username'>
            <h0 className="userprofile-name">{information.location}</h0>
            <h1 className="userprofile-subtitle">{information.precise_location}</h1>
          </div>
          <div onClick={toggleFavorite} className="fav-field-like-button">
            {isFavorited ? <FaHeart className="FaHeart-icon" /> : <FaRegHeart className="FaRegHeart-icon" />}
          </div>
          {/* <CiSettings className='edituserprofile-button' onClick={() => window.location.replace('/teren-profil')} /> */}
        </div>
        <div>
          <nav className="profile-tabs">
            <button className={`tab-button ${activeTab === "events" ? "active" : ""}`}
              onClick={() => {
                setSelectionTitle('Događaji');
                setSelectionSubtitle('Događaji koji su na terenu');
                setActiveTab("events");
              }}>Događaji</button>
            <button className={`tab-button ${activeTab === "reviews" ? "active" : ""}`} onClick={() => {
              setSelectionTitle('Recenzije'); setSelectionSubtitle('Recenzije korisnika');
              setActiveTab("reviews")
            }}>Recenzije</button>
            <button className={`tab-button ${activeTab === "information" ? "active" : ""}`} onClick={() => {
              setSelectionTitle('Informacije');
              setSelectionSubtitle('Informacije o terenu');
              setActiveTab("information")
            }
            }>Informacije</button>
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
                    <div className="scroll-bar-field-profile">

                      {/* Sponzorisani događaji */}
                      <div className="sponsored-events-section">
                        {Array.isArray(eventsData) && eventsData.length > 0 ? (
                          eventsData.map((event) => (
                            <SponsoredEventCard key={event.id} event={event} />
                          ))
                        ) : (
                          <p className="no-events-message">Nema sponzorisanih događaja.</p>
                        )}
                      </div>

                      {/* Razmak između sekcija */}
                      <div className="section-divider"></div>

                      {/* Aktivnosti */}
                      <div className="activities-section">
                        {Array.isArray(activities) && activities.length > 0 ? (
                          activities.map((activity) => (
                            <ActivityCard key={activity.id} activity={activity} />
                          ))
                        ) : (
                          <p className="no-events-message">Nema aktivnosti na terenu.</p>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="activity-section">
                    <div className="activity-cards-container-field">
                      {reviews.map((review) => {
                        const reviewDate = new Date(review.date);
                        reviewDate.setHours(reviewDate.getHours() + 1); // Dodajemo 1 sat na vrijeme

                        const renderStars = (rating) => {
                          const stars = [];
                          for (let i = 1; i <= 5; i++) {
                            if (i <= rating) {
                              stars.push(
                                <FaStar key={i} className="star filled" />
                              );
                            } else {
                              stars.push(
                                <FaRegStar key={i} className="star" />
                              );
                            }
                          }
                          return stars;
                        };
                        

                        return (
                          <div key={review.id} className="activity-card-review">
                            <ReviewCard clientId={review.client} />
                            <div className="rating-stars">
                               {renderStars(review.rating)}
                             </div>
                              <div className="review-detail">
                               <FontAwesomeIcon icon={faComment} className="icon" />
                               <p className="size">{review.description}</p>
                              </div>
                              <hr className="separator" />
                             <div className="review-detail">
                                <FontAwesomeIcon icon={faCalendarAlt} className="icon" />
                                <p className="size">{reviewDate.toISOString().split('T')[0]}</p>
                              </div>
                             
  
                             <div className="review-detail">
                               <FontAwesomeIcon icon={faClock} className="icon" />
                               <p className="size">{reviewDate.toISOString().split('T')[1].split(':').slice(0, 2).join(':')}</p>
                             </div>
  
                             
                          </div>
                        );
                      })}

                    </div>
                    {(idField.pk !== -1) ? (
                      <button className="create-event-button" onClick={() => toggleFloatingWindow()}>
                        + Nova recenzija
                      </button>
                    ) : null}
                    {isVisible ? (
                      <div>
                        <NewReviewCard user={user} pk={id.id} className="new-event-card" />
                        <IoIosCloseCircle className="close-icon-new-advertisement" onClick={() => toggleFloatingWindow()} />
                      </div>
                    ) : null}
                  </div>
                )}

                {activeTab === "information" && (
                  <div className="information-container">
                    <div className="image-container">
                      <img src={`http://127.0.0.1:8000${information.image}`} alt="Teren" />
                    </div>
                    <div>
                      <p className="information-text">Lokacija: {information.location}</p>
                      <p className="information-text">Tačna lokacija: {information.precise_location}</p>
                      <p className="information-text">Geografska širina: {information.latitude}</p>
                      <p className="information-text">Geografska dužina: {information.longitude}</p>
                      <div className="information-text">
                        Sportovi:
                        {Array.isArray(information.sports) && information.sports.length > 0 ? (
                          information.sports.map(sport => (
                            <span key={sport.id} className="sport-name">
                              {sport.name}
                            </span>
                          )).reduce((prev, curr) => [prev, ', ', curr])
                        ) : (
                          <span>No sports available</span>
                        )}
                      </div>
                      <p className="information-text">Status:{information.is_suspended ? 'Suspendovan' : 'Aktivan'}</p>
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

export default TerenProfil;