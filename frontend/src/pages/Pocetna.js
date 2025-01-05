import "./Pocetna.css";
import React, { useEffect, useState } from "react";
import MenuBar from "../components/MenuBar.js";
import Search from "../components/Search.js";
import Footer from "../components/Footer.js";
import SearchFields from "../components/SearchFields.js";
import axios from "axios";

function Pocetna() {

  const [id, setID] = useState({
    "id": -1,
    "type": ''
  });

  useEffect(() => {
    const fetchIDType = async () => {
      await axios.get('http://localhost:8000/api/get-user-type-and-id/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((request) => {
          if (request.data.type === 'BusinessSubject')
            window.location.replace("/userprofile1");
          setID(request.data);
        })
        .catch((error) => {
          console.error("Error getting ID: ", error);
          alert("Neuspjesna autorizacija. Molimo ulogujte se ponovo... ");
          {/*window.location.replace("/login");*/ }
        });
    };
    const fetchID = async () => {
      await axios.get('http://localhost:8000/api/get-client-id/', {
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
  return (
    <div className="pocetna">
      <header className="pocetna-header">
        <MenuBar variant={[id.id !== -1 ? "registered" : "unregistered"]} search={true} />
      </header>
      <div className="pocetna-body">
        <div className="search">
          <SearchFields />
        </div>
        <div className="footer">
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Pocetna;
