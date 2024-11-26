import React, { useState, useEffect} from "react";
import "./EditUserProfile.css";
import profileImage from "../images/user.svg";
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import axios from "axios";

{/* post token za provjeru, na osnovu response else redirect to login, kako selektovati klijenta */}

const EditUserProfile = () => {
    const [token, setToken] = useState([]);
    if (localStorage.getItem('token')!= null)
      setToken(localStorage.getItem('token'));
    
    const [userData, setUserData] = useState([]);
  
    useEffect(() => {
      axios.get('http://localhost:8000/api/client/1/')
        .then(response => {
          setUserData(response.data);
        })
        .catch(error => {
          console.error('Error fetching data: ', error);
        });
    }, []);

  const handleUpdate = async (userData) => {
    try {
      axios.put("http://localhost:8000/api/client/1/", userData)
  .then(response => {
    console.log("Data updated successfully:", response.data);
  })
  .catch(error => {
    console.error("There was an error updating the data:", error);
  });
      // Optionally, fetch and update the displayed data
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  return (
    <body>
      <header>
        <MenuBar variant={["registered"]} search={true} />
      </header>
      <div className="EditUserProfileBody">
        <div className="EditUserProfileDialog">
          <img
            src={profileImage}
            alt="Circular Image"
            className="EditProfileImage"
          />
          <a href="" className="NewImage">
            Nova slika
          </a>
          <form >
            <label className="EditProfileLabel">Ime</label>
            <input
              type="name"
              value={userData.first_name}
              className="EditProfileInput"
              required
              onChange={(e) => setUserData(e.target.value)}
            />
             <label className="EditProfileLabel">Prezime</label>
            <input
              type="name"
              value={userData.last_name}
              className="EditProfileInput"
              required
              onChange={(e) => setUserData(e.target.value)}
            />
            <label className="EditProfileLabel">Korisničko ime</label>
            <input
              type="text"
              value={userData.username}
              className="EditProfileInput"
              required
              onChange={(e) => setUserData(e.target.value)}
            />
            <label className="EditProfileLabel">E-mail</label>
            <input
              type="email"
              value={userData.email}
              className="EditProfileInput"
              required
              onChange={(e) => setUserData(e.target.value)}
            />
            <button
              className="EditProfileButton"
              id="EditNameEmailButton"
              type="submit"
              onClick={() => handleUpdate(userData)}
            >
              Sačuvaj
            </button>
          </form>
          <form>
          <label className="EditProfileLabel">Stara lozinka</label>
          <input
            type="password"
            placeholder="Unesi staru lozinku"
            className="EditProfileInput"
            required
          />
          <label className="EditProfileLabel">Nova lozinka</label>
          <input
            type="password"
            placeholder="Unesi novu lozinku"
            className="EditProfileInput"
            required
          />
          <input
            type="password"
            placeholder="Potvrdi novu lozinku"
            className="EditProfileInput"
            required
          />
          <button 
            className="EditProfileButton" 
            id="PromijeniLozinkuButton"
            type="submit">
            Promijeni lozinku
          </button>
          </form>
          <button className="EditProfileButton">Odjavi se</button>
          <button className="EditProfileButton">Deaktiviraj nalog</button>
        </div>
      </div>
      <Footer />
    </body>
  );
};

export default EditUserProfile;
