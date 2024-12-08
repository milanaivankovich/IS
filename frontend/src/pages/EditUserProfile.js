import React, { useState, useEffect} from "react";
import "./EditUserProfile.css";
import profileImage from "../images/user.svg";
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import axios from "axios";

const EditUserProfile = () => {
    const [id, setID]=useState({
      "pk": -1,
    });
    
    const [userData, setUserData] = useState({
      "first_name": '',
      "last_name": '',
      "username": '',
      "email": '',
      "date_of_birth": '',
      "bio": ''
    });

    useEffect(() => {

      const fetchID = async ()=> {
      await axios.get('http://localhost:8000/api/get-client-id/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((request) => {
          setID(request.data);
        })
        .catch((error) => {
          console.error("Error getting ID: ",error);
          alert("Neuspjesna autorizacija. Molimo ulogujte se ponovo... ");
          window.location.replace("/login");
        });
      };

      fetchID();
    },[]);
  
    useEffect(() => {

      const fetchUserData = async ()=> {
      await axios.get('http://localhost:8000/api/client/'+id.pk+'/')
        .then(response => {
          setUserData(response.data);
        })
        .catch(error => {
          console.error('Error fetching data: ', error);
          alert('Error fetching data');
        });
      };

      if(id.pk!==-1)
        fetchUserData();
    }, [id]);
    

  const handleUpdate = async () => {
    await axios.put('http://localhost:8000/api/client/'+id.pk+'/edit/', userData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((response) => {
        console.log("Data updated successfully:", response.data);
      })
      .catch((error) => {
        console.error("There was an error updating the data:", error);
        alert("Doslo je do greške prilikom ažuriranja...");
      });
  };

  const [password, setPassword] = useState({
    'old_password': '',
    'new_password': '',
    'confirm_password': '',
  });

  const handlePasswordUpdate =async (password) => {
    if (password.new_password===password.old_password){
      alert("Nova lozinka se podudara sa starom. Odaberite drugu lozinku!");
    }
    else if (password.new_password!==password.confirm_password){
      alert("Nova lozinka se ne podudara sa potvrdom");}
    else {
      await axios.put('http://localhost:8000/api/client/'+id+'/edit/', password, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((response) => {
        console.log("Password updated successfully:", response.data);
        alert("Lozinka je azurirana"+response.data+"");
      })
      .catch((error) => {
        console.error("There was an error updating the data:", error);
        alert("Doslo je do greške prilikom ažuriranja...");
      });
    }};

  const handleDeactivation = async () => {
    //dodati neki message popup da se potvrdi deaktivacija i onda pozvati on button click
    //sta sa poslovnim subjektom
    await axios.post('http://localhost:8000/api/deactivate-client/', userData.username)
    .then((response) => {
      console.log("Password updated successfully:", response.data);
      alert("Nalog je deaktiviran"+response.data);
    })
    .catch((error)=>{
      console.error("There was an error updating the data:", error);
      alert("Doslo je do greške prilikom deaktivacije...");});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleLogout = () => {
    // Remove the token from localStorage
    localStorage.removeItem('token');
    window.location.replace("/login");
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
          <form onSubmit={handleSubmit}>
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
              onClick={() => handleUpdate()}
            >
              Sačuvaj
            </button>
          </form>
          <form onSubmit={handleSubmit}>
          <label className="EditProfileLabel">Stara lozinka</label>
          <input
            type="password"
            placeholder="Unesi staru lozinku"
            className="EditProfileInput"
            onChange={(e) => setPassword(prevData=>({...prevData, old_password: e.target.value }))}
            required
          />
          <label className="EditProfileLabel">Nova lozinka</label>
          <input
            type="password"
            placeholder="Unesi novu lozinku"
            className="EditProfileInput"
            onChange={(e) => setPassword(prevData=>({...prevData, new_password: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Potvrdi novu lozinku"
            className="EditProfileInput"
            onChange={(e) => setPassword(prevData=>({...prevData, confirm_password: e.target.value }))}
            required
          />
          <button 
            className="EditProfileButton" 
            id="PromijeniLozinkuButton"
            type="submit"
            onClick={()=>handlePasswordUpdate(password)}>
            Promijeni lozinku
          </button>
          </form>
          <button className="EditProfileButton"
          onClick={()=>handleLogout()}>Odjavi se</button>
          <button className="EditProfileButton">Deaktiviraj nalog</button>
        </div>
      </div>
      <Footer />
    </body>
  );
};

export default EditUserProfile;
