import React, { useState } from "react";
import "./EditUserProfile.css";
import profileImage from "../images/user.svg";
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import axios from "axios";

const EditUserProfile = () => {
  const [updatedData, setUpdatedData] = useState("");

  const handleUpdate = async () => {
    try {
      await axios.put("https://localhost:8000/api/edit/client/1", {
        updatedData,
      });
      alert("Data updated successfully!");
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
          <form action="/submit" method="put">
            <label className="EditProfileLabel">Ime i prezime</label>
            <input
              type="text"
              value={updatedData}
              placeholder="Ime Prezime"
              className="EditProfileInput"
              required
              onChange={(e) => setUpdatedData(e.target.value)}
            />
            <label className="EditProfileLabel">E-mail ili telefon</label>
            <input
              type="email"
              placeholder="email@gmail.com"
              className="EditProfileInput"
              required
            />
            <button
              className="EditProfileButton"
              id="EditNameEmailButton"
              type="submit"
              onClick={handleUpdate}
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
