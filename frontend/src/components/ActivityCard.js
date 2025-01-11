import React, { useEffect, useState } from "react";
import "./ActivityCard.css";
import axios from "axios";

const ActivityCard = ({ activity }) => {
  const { description, date, field, titel, sport, id, NumberOfParticipants, client } = activity;
  const [location, setLocation] = useState("");
  const [sports, setSport] = useState("");
  const [remainingSlots, setRemainingSlots] = useState(NumberOfParticipants);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);



  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/client/${client}/username/`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setUsername(data.username);
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUsername();
  }, [id]);

  // Dohvaćanje lokacije na osnovu field ID-a
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/advertisement/field/${field}/`);
        const data = await response.json();
        setLocation(data.location);
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };

    if (field) {
      fetchLocation();
    }

    // Provera da li je korisnik prijavljen
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // Ako postoji token, korisnik je prijavljen

  }, [field]);

  // Dohvaćanje sporta na osnovu njegovog ID-a
  useEffect(() => {
    const fetchSport = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/sport/${sport}/`);
        const data = await response.json();
        setSport(data.sports);
      } catch (error) {
        console.error("Error fetching sport:", error);
      }
    };

    if (sport) {
      fetchSport();
    }
  }, [sport]);

  const handleUnregister = async () => {
    if (!isLoggedIn) {
      alert("Morate biti prijavljeni da biste se odjavili sa aktivnosti.");
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await fetch(`http://127.0.0.1:8000/activities/${id}/unregister/`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to unregister from the activity");
      }
  
      const data = await response.json();
      setRemainingSlots(data.remaining_slots); // Ažuriranje broja preostalih mesta
      alert(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleUsernameClick = (username) => {
    window.location.href = `http://localhost:3000/userprofile/${id}/`;
  };

  const handleLocationClick = (fieldId) => {
    window.location.href = `/teren-profil/${fieldId}`;
  };
  // Funkcija za registraciju na aktivnost
  const handleRegister = async () => {
    if (!isLoggedIn) {
      alert("Morate biti prijavljeni kao rekreativac da biste se prijavili na aktivnost.");
      return;
    }
    let pk = {
      id: -1,
      type: ''
    };
    const uri = "http://localhost:8000"
    let currentUserData = {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      profile_picture: '',
    };

    await axios.get(`${uri}/api/get-user-type-and-id/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((request) => {
        pk = request.data;
      })
      .catch((error) => {
        console.error("Error getting ID: ", error);
      });

    if (pk.id !== -1 && pk.type === 'Client') {
      await axios.get(`${uri}/api/client/${pk.id}/`)
        .then(async response => {
          currentUserData = {
            first_name: response.data.first_name,
            last_name: response.data.last_name,
            username: response.data.username,
            email: response.data.email,
            profile_picture: response.data.profile_picture ? uri + response.data.profile_picture : null,
          }
        })
        .catch(error => {
          console.error('Error fetching data: ', error);
          return;
        });
    } else {
      alert("Morate biti prijavljeni kao rekreativac da biste se prijavili na aktivnost.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/activities/${id}/register/`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(currentUserData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to register for the activity");
      }

      const data = await response.json();
      setRemainingSlots(data.remaining_slots);
      alert(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  ///datetime
  const parseDateTime = (dateString) => {
    // Parse the input date string
    const date = new Date(dateString);

    // Format the date as dd/MM/yyyy
    const formattedDate = date
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-")
      .replace(/-/g, "/");

    // Format the time as hh:mm
    const formattedTime = date
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

    return { formattedDate, formattedTime };
  };

  const { formattedDate, formattedTime } = parseDateTime(date);

  return (
    <div className="activity-card">
      <h3 className="activity-card-title">{titel}</h3>
      <p>
        <strong>Kreirao oglas:</strong>{" "}
        {username ? (
          <span
            className="clickable-username"
            onClick={() => handleUsernameClick(username)}
          >
            {username}
          </span>
        ) : (
          "Nepoznato"
        )}
      </p>

      <p><strong>Opis:</strong> {description}</p>
      <p><strong>Sport:</strong> {sports}</p>
      <p><strong>Datum:</strong> {formattedDate}</p>
      <p><strong>Vrijeme: </strong>{formattedTime}</p>
      <p><strong>Broj preostalih učesnika:</strong> {remainingSlots}</p>
      <p>
        <strong>Lokacija:</strong>{" "}
        {location ? (
          <span
            className="clickable-location"
            onClick={() => handleLocationClick(field)}
          >
            {location}
          </span>
        ) : (
          "Učitavanje..."
        )}
      </p>


      <div className="activity-card-buttons">
        <button
          className="button"
          onClick={handleRegister}
          disabled={remainingSlots <= 0 || isLoading || !isLoggedIn}
        >
          {isLoading ? "Prijava u toku..." : "Prijavi se"}
        </button>
        <button
    className="button unregister-button"
    onClick={handleUnregister}
    disabled={isLoading || !isLoggedIn}
  >
    {isLoading && remainingSlots ? "Odjava u toku..." : "Odjavi se"}
  </button>
      </div>

      {!isLoggedIn && <p className="error-message">Morate biti prijavljeni da biste se prijavili na aktivnost.</p>}

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ActivityCard;
