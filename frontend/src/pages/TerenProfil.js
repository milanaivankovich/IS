import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SponsoredEventCard from '../components/SponsoredEventCard';
import './UserProfile.css';
import './BusinessSubjectProfile.css';
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import { CiSettings } from "react-icons/ci";
import './TerenProfil.css';
import NewReviewCard from '../components/NewReviewCard.js';
import { IoIosCloseCircle } from "react-icons/io";
import ReviewCard from '../components/ReviewCard.js';

const TerenProfil = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleFloatingWindow = () => {
    setIsVisible(!isVisible);
  };

  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [information, setInformation] = useState([]);
  const [loading, setLoading] = useState(true);

  const [idField, setIdField]=useState({
    "id": -1
  });

    const [id, setID]=useState({
      "id": -1,
      "type": ''
    });

    const [user, setUser] = useState({
      "first_name": "",
      "last_name": "",
      "username": "",
      "email": "email",
      "profile_picture": null
    });
  
  const [fieldData, setFieldData] = useState({
    "id": -1,
    "location": "",
    "precise_location":"",
    "latitude": 0,
    "longitude": 0,
    "sports": [],
    "is_suspended": false,
    "image": null,
  });

  useEffect(() => {

    const fetchUserData = async ()=> {
    await axios.get('http://localhost:8000/api/client/'+id.id+'/')
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error('Error fetching data: ', error);
      });
    };

    if(id.id!==-1)
      fetchUserData();
  }, [id]);

  useEffect(() => {
    const fetchIDType = async ()=> {
      await axios.get('http://localhost:8000/api/get-user-type-and-id/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((request) => {
          setID(request.data);
        })
        .catch((error) => {
          console.error("Error getting ID: ",error);
        });
      };

    fetchIDType();
  },[]);

  useEffect(() => {
    // Izvlačenje poslednjeg segmenta iz URL-a
    const path = window.location.pathname; 
    const idFromUrl = path.split("/").pop(); 
    if (!isNaN(idFromUrl)) {
      setIdField({ id: parseInt(idFromUrl, 10) });
    }
  }, []);
  
    useEffect(() => {

      const fetchFieldData = async ()=> {
      await axios.get('http://localhost:8000/api/advertisements/field/'+id.id+'/')
        .then(response => {
          setFieldData(response.data);
        })
        .catch(error => {
          console.error('Error fetching data: ', error);
        });
      };

      if(idField.id!==-1)
        fetchFieldData();
    }, [idField]);

    const [eventsData, setEventsData] = useState([]);
    const [selectionTitle, setSelectionTitle] = useState('Događaji');
    const [selectionSubtitle,setSelectionSubtitle] = useState('Događaji koji su na terenu');
    //napraviti chain sa fetch
  // Funkcija za dohvaćanje podataka za različite kartice
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
        <MenuBar variant={[idField.id!==-1 ? "registered" : "unregistered"]} search={true} />
      </header>
      <div className="userprofile-body">
        <div className="userprofile-header">
          <img src={`http://127.0.0.1:8000${information.image}`} alt="Teren" className="userprofilepreview-image"/>
          <div className='name-surname-username'>
            <h0 className="userprofile-name">{information.location }</h0>
            <h1 className="userprofile-subtitle">{information.precise_location}</h1>
          </div>
          <CiSettings className='edituserprofile-button' onClick={() => window.location.replace('/teren-profil')} />
        </div>
          <div>
            <nav className="profile-tabs">
          <button className={`tab-button ${activeTab === "events" ? "active" : ""}`} 
          onClick={() => {
            setSelectionTitle('Događaji'); 
            setSelectionSubtitle('Događaji koji su na terenu');
            setActiveTab("events");
          }}>Događaji</button>
          <button className={`tab-button ${activeTab === "reviews" ? "active" : ""}`} onClick={() => 
            {
              setSelectionTitle('Recenzije'); setSelectionSubtitle('Recenzije korisnika');
              setActiveTab("reviews")}}>Recenzije</button>
          <button className={`tab-button ${activeTab === "information" ? "active" : ""}`} onClick={() =>
            {
              setSelectionTitle('Informacije'); 
              setSelectionSubtitle('Informacije o terenu');
              setActiveTab("information")}  
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
                  <div className="scroll-bar-user-profile">
                  {Array.isArray(eventsData) && eventsData.map((activity) => (
                    <SponsoredEventCard key={activity.id} event={activity} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
             <div className="activity-section">
               <div className="activity-cards-container">
               {reviews.map((review) => {
               const reviewDate = new Date(review.date);
               reviewDate.setHours(reviewDate.getHours() + 1); // Dodajemo 1 sat na vrijeme

               return (
               <div key={review.id} className="activity-card">
               <ReviewCard clientId={review.client} />
               <p className="size"><strong>Ocjena: </strong>{review.rating}</p>
               <p className="size"><strong>Komentar: </strong>{review.description}</p>
               <p className="size"><strong>Datum: </strong>{reviewDate.toISOString().split('T')[0]}</p>
               <p className="size"><strong>Vrijeme: </strong>{reviewDate.toISOString().split('T')[1].split(':').slice(0, 2).join(':')}</p>
               </div>
               );
              })}

              </div>
              { (idField.pk!==-1) ? (
                  <button className="create-event-button" onClick={()=>toggleFloatingWindow()}>
                    + Nova recenzija
                  </button> 
                  ) : null }
                { isVisible ? (
                <div>
                  <NewReviewCard user={user} pk={id.id} className="new-event-card" />
                  <IoIosCloseCircle className="close-icon-new-advertisement" onClick={()=>toggleFloatingWindow()}/>
                </div>
                ): null }
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
