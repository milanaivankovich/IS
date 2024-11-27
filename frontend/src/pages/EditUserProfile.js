import React, { useState, useEffect} from "react";
import "./EditUserProfile.css";
import profileImage from "../images/user.svg";
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import axios from "axios";

{/* selektovati klijenta po tokenu? */}

const EditUserProfile = () => {

    const [token, setToken] = useState([]);
    useEffect(()=> {
      try {
        setToken(localStorage.getItem('token'));
        if (token==null) throw new Error("Sesija istekla");
      } catch (error) {
        console.error("Vrati se na login: ", error.message);
        window.location.replace("/login");
      }
    })
    
    const [userData, setUserData] = useState({
      "first_name": '',
      "last_name": '',
      "username": '',
      "email": '',
      "date_of_birth": '',
      "bio": ''
    });
  
    useEffect(() => {
      axios.get('http://localhost:8000/api/client/1/')
        .then(response => {
          setUserData(response.data);
        })
        .catch(error => {
          console.error('Error fetching data: ', error);
          alert('Error fetching data');
        });
    }, []);

  const handleUpdate = (userData) => {
    axios
      .put("http://localhost:8000/api/client/1/edit", userData)
      .then((response) => {
        console.log("Data updated successfully:", response.data);
      })
      .catch((error) => {
        console.error("There was an error updating the data:", error);
        alert("Doslo je do greške prilikom ažuriranja...");
      });
  };

  const [password, setPassword] = useState({
    old: '',
    new: '',
    confirm: '',
  });

  const handlePasswordUpdate = (password) =>
  { 
    

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
              onChange={(e) => setUserData(prevData=>({...prevData, first_name: e.target.value }))}
            />
             <label className="EditProfileLabel">Prezime</label>
            <input
              type="name"
              value={userData.last_name}
              className="EditProfileInput"
              required
              onChange={(e) => setUserData(prevData=>({...prevData, last_name: e.target.value }))}
            />
            <label className="EditProfileLabel">Korisničko ime</label>
            <input
              type="text"
              value={userData.username}
              className="EditProfileInput"
              required
              onChange={(e) => setUserData(prevData=>({...prevData, username: e.target.value }))}
            />
            <label className="EditProfileLabel">E-mail</label>
            <input
              type="email"
              value={userData.email}
              className="EditProfileInput"
              required
              onChange={(e) => setUserData(prevData=>({...prevData, email: e.target.value }))}
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
            onChange={(e) => setPassword(prevData=>({...prevData, old: e.target.value }))}
            required
          />
          <label className="EditProfileLabel">Nova lozinka</label>
          <input
            type="password"
            placeholder="Unesi novu lozinku"
            className="EditProfileInput"
            onChange={(e) => setPassword(prevData=>({...prevData, new: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Potvrdi novu lozinku"
            className="EditProfileInput"
            onChange={(e) => setPassword(prevData=>({...prevData, confirm: e.target.value }))}
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
