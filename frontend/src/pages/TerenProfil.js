import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SponsoredEventCard from '../components/SponsoredEventCard';
import './UserProfile.css';
import './BusinessSubjectProfile.css';
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import { CiSettings } from "react-icons/ci";
import './TerenProfil.css';

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

  const [id, setId]=useState({
    "id": -1
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
    // Izvlačenje poslednjeg segmenta iz URL-a
    const path = window.location.pathname; 
    const idFromUrl = path.split("/").pop(); 
    if (!isNaN(idFromUrl)) {
      setId({ id: parseInt(idFromUrl, 10) });
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
          alert('Error fetching data');
        });
      };

      if(id.id!==-1)
        fetchFieldData();
    }, [id]);

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
        const informationResponse = await axios.get(`http://localhost:8000/api/field/id/${id.id}/`);
        setInformation(informationResponse.data);

        const eventsResponse = await axios.get(`http://localhost:8000/api/advertisements/field/${id.id}/`);
        setEventsData(eventsResponse.data);

        const reviewsResponse = await axios.get(`http://localhost:8000/api/reviews/${id.id}/`);
        setReviews(reviewsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]); 
  
  
  
  return (
    <body>
      <header className="userprofile-menu">
        <MenuBar variant={[id.id!==-1 ? "registered" : "unregistered"]} search={true} />
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
            setSelectionSubtitle('Događaji na terenu');
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
              <div>
                {reviews.map((review) => (
                <div key={review.id}>
                <p>Rating: {review.rating}</p>
                <p>Description: {review.description}</p>
                <p>Client: {review.client}</p>
                <p>Field: {review.field}</p>
              </div>
              ))}
               </div>
            )}  

            {activeTab === "information" && (
            <div className="information-container">
             <div className="image-container">
              <img src={`http://127.0.0.1:8000${information.image}`} alt="Teren" />
             </div>
            <div>
             <p className="information-text">Lokacija: {information.location}</p>
             <p className="information-text">Tacna lokacija: {information.precise_location}</p>
             <p className="information-text">Latitude: {information.latitude}</p>
             <p className="information-text">Longitude: {information.longitude}</p>
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
