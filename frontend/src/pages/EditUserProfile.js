import React, { useState, useEffect} from "react";
import "./EditUserProfile.css";
import profileImage from "../images/user.svg";
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import axios from "axios";

const EditUserProfile = () => {
    const [userData, setUserData] = useState([]);
  
    useEffect(() => {
      axios.get('http://localhost:8000/api/get/client/1/')
        .then(response => {
          setUserData(response.data);
        })
        .catch(error => {
          console.error('Error fetching data: ', error);
        });
    }, []);

  const [updatedData, setUpdatedData] = useState("");

  const handleUpdate = async (updatedData) => {
    try {
      axios.put("http://localhost:8000/api/edit/client/1/", updatedData)
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
            <label className="EditProfileLabel">Ime i prezime</label>
            <input
              type="text"
              value={updatedData}
              placeholder={userData.user.username}
              className="EditProfileInput"
              required
              onChange={(e) => setUpdatedData(e.target.value)}
            />
            <label className="EditProfileLabel">E-mail ili telefon</label>
            <input
              type="email"
              placeholder={userData.user.email}
              className="EditProfileInput"
              required
            />
            <button
              className="EditProfileButton"
              id="EditNameEmailButton"
              type="submit"
            >
              Sačuvaj
            </button>
          </form>
          <label className="EditProfileLabel">Stara lozinka</label>
          <input
            type="password"
            placeholder="Unesi staru lozinku"
            className="EditProfileInput"
          />
          <label className="EditProfileLabel">Nova lozinka</label>
          <input
            type="password"
            placeholder="Unesi novu lozinku"
            className="EditProfileInput"
          />
          <input
            type="password"
            placeholder="Potvrdi novu lozinku"
            className="EditProfileInput"
          />
          <button className="EditProfileButton" id="PromijeniLozinkuButton">
            Promijeni lozinku
          </button>
          <button className="EditProfileButton">Odjavi se</button>
          <button className="EditProfileButton">Deaktiviraj nalog</button>
        </div>
      </div>
      <Footer />
    </body>
  );
};

export default EditUserProfile;
