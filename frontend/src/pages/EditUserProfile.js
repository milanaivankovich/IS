import React, { useState, useEffect } from "react";
import "./EditUserProfile.css";
import profileImage from "../images/user.svg";
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import axios from "axios";
import AddPhoto from '../components/AddPhoto.js';
import { IoIosCloseCircle } from "react-icons/io";
import { Modal, Button } from 'react-bootstrap';
//import 'bootstrap/dist/css/bootstrap.min.css';

const EditUserProfile = () => {
  const [id, setID] = useState({
    "id": -1,
    "type": '',
  });

  const [userData, setUserData] = useState({
    "first_name": '',
    "last_name": '',
    "username": '',
    "email": '',
    "profile_picture": null
  });

  useEffect(() => {

    const fetchID = async () => {
      await axios.get('http://localhost:8000/api/get-user-type-and-id/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((request) => {
          if (request.data.type === 'BusinessSubject')
            window.location.replace("/editbusinesssubject");
          setID(request.data);
        })
        .catch((error) => {
          console.error("Error getting ID: ", error);
          alert("Neuspjesna autorizacija. Molimo ulogujte se ponovo... ");
          window.location.replace("/login");
        });
    };

    fetchID();
  }, []);

  useEffect(() => {

    const fetchUserData = async () => {
      await axios.get('http://localhost:8000/api/client/' + id.id + '/')
        .then(response => {
          setUserData(response.data);
        })
        .catch(error => {
          console.error('Error fetching data: ', error);
          alert('Error fetching data');
        });
    };

    if (id.id !== -1)
      fetchUserData();
  }, [id]);


  const handleUpdate = async (e) => {
    e.preventDefault();
    await axios.put('http://localhost:8000/api/client/' + id.id + '/edit/', userData, {
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


  const handlePasswordUpdate = async (e, password) => {
    e.preventDefault();
    if (password.new_password === password.old_password) {
      alert("Nova lozinka se podudara sa starom. Odaberite drugu lozinku!");
    }
    else if (password.new_password !== password.confirm_password) {
      alert("Nova lozinka se ne podudara sa potvrdom");
    }
    else {
      await axios.put('http://localhost:8000/api/client/' + id.id + '/edit/', password, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((response) => {
          console.log("Password updated successfully:", response.data);
          alert("Lozinka je azurirana" + response.data + "");
        })
        .catch((error) => {
          console.error("There was an error updating the data:", error);
          alert("Doslo je do greške prilikom ažuriranja...");
        });
    }
  };

  const handleDeactivation = async () => {
    //dodati neki message popup da se potvrdi deaktivacija i onda pozvati on button click
    //sta sa poslovnim subjektom
    await axios.post('http://localhost:8000/api/deactivate-client/', userData.username)
      .then((response) => {
        console.log("Password updated successfully:", response.data);
        alert("Nalog je deaktiviran" + response.data);
      })
      .catch((error) => {
        console.error("There was an error updating the data:", error);
        alert("Doslo je do greške prilikom deaktivacije...");
      });
  };

  const handleLogout = () => {
    // Remove the token from localStorage
    localStorage.removeItem('token');
    window.location.replace("/login");
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const toggleDialog = () => {
    setIsDialogOpen(!isDialogOpen);
  };

  const [isDeactivating, setIsDeactivating] = useState(false);
  const toggleDeactivation = () => {
    setIsDeactivating(!isDeactivating);
  };

  return (
    <body>
      <header>
        <MenuBar variant={["registered"]} search={true} />
      </header>
      <div className="EditUserProfileBody">
        <div className="EditUserProfileDialog">
          <img
            src={userData.profile_picture !== null ? userData.profile_picture : profileImage}
            alt="Circular Image"
            className="EditProfileImage"
          />
          <button className="NewImage" onClick={() => toggleDialog()} >
            Nova slika
          </button>
          {isDialogOpen && id.id !== -1 ? <div>
            <AddPhoto className="new-event-card" userId={id} />
            <IoIosCloseCircle className="close-icon-orange" onClick={() => toggleDialog()} />
          </div> : null}
          <form onSubmit={handleUpdate}>
            <label className="EditProfileLabel">Ime</label>
            <input
              type="name"
              value={userData.first_name}
              className="EditProfileInput"
              required
              onChange={(e) => setUserData(prevData => ({ ...prevData, first_name: e.target.value }))}
            />
            <label className="EditProfileLabel">Prezime</label>
            <input
              type="name"
              value={userData.last_name}
              className="EditProfileInput"
              required
              onChange={(e) => setUserData(prevData => ({ ...prevData, last_name: e.target.value }))}
            />
            <label className="EditProfileLabel">Korisničko ime</label>
            <input
              type="text"
              value={userData.username}
              className="EditProfileInput"
              required
              onChange={(e) => setUserData(prevData => ({ ...prevData, username: e.target.value }))}
            />
            <label className="EditProfileLabel">E-mail</label>
            <input
              type="email"
              value={userData.email}
              className="EditProfileInput"
              required
              onChange={(e) => setUserData(prevData => ({ ...prevData, email: e.target.value }))}
            />
            <button
              className="EditProfileButton"
              id="EditNameEmailButton"
              type="submit"
            >
              Sačuvaj
            </button>
          </form>
          <form onSubmit={(e) => handlePasswordUpdate(e, password)}>
            <label className="EditProfileLabel">Stara lozinka</label>
            <input
              type="password"
              placeholder="Unesi staru lozinku"
              className="EditProfileInput"
              onChange={(e) => setPassword(prevData => ({ ...prevData, old_password: e.target.value }))}
              required
            />
            <label className="EditProfileLabel">Nova lozinka</label>
            <input
              type="password"
              placeholder="Unesi novu lozinku"
              className="EditProfileInput"
              onChange={(e) => setPassword(prevData => ({ ...prevData, new_password: e.target.value }))}
              required
            />
            <input
              type="password"
              placeholder="Potvrdi novu lozinku"
              className="EditProfileInput"
              onChange={(e) => setPassword(prevData => ({ ...prevData, confirm_password: e.target.value }))}
              required
            />
            <button
              className="EditProfileButton"
              id="PromijeniLozinkuButton"
              type="submit">
              Promijeni lozinku
            </button>
          </form>
          <button className="EditProfileButton"
            onClick={() => handleLogout()}>Odjavi se</button>
          <button className="EditProfileButton" onClick={() => toggleDeactivation()}>Deaktiviraj nalog</button>
          {isDeactivating ? <div
            className="dimmer"
          >
            <Modal.Dialog className='modal-bootstrap' >
              <Modal.Header>
                <Modal.Title className='Naslov'>DEAKTIVACIJA NALOGA</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <p className='modal-body'>Da li sigurno želite deaktivirati vaš nalog?</p>
              </Modal.Body>

              <Modal.Footer>
                <Button
                  className="EditProfileButton"
                  id='OdustaniButton'
                  onClick={() => toggleDeactivation()}
                  variant="primary">Odustani</Button>
                <Button
                  className="EditProfileButton"
                  onClick={() => handleDeactivation()}
                  variant="secondary">Nastavi</Button>
              </Modal.Footer>
            </Modal.Dialog>
          </div> : null}
        </div>
      </div>
      <Footer />
    </body>
  );
};

export default EditUserProfile;
