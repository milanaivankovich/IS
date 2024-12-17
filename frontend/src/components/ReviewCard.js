import React, { useEffect, useState } from "react";
import CreatorImg from "../images/user.svg";
import './ReviewCard.css';

const ReviewCard = ({ clientId }) => {
  const [name, setName] = useState("");
  const[picture, setPicture]= useState(null);

  // Dohvaćanje imena klijenta na osnovu njegovog ID-a
  useEffect(() => {
    const fetchName = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const response = await fetch(`http://127.0.0.1:8000/api/client/${clientId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setName(data.username);
      } catch (error) {
        console.error("Error fetching name:", error);
      }
    };

    if (clientId) {
      fetchName();
    }
  }, [clientId]);

  useEffect(() => {
    const fetchPicture = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const response = await fetch(`http://127.0.0.1:8000/api/client/${clientId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setPicture(data.profile_picture);
      } catch (error) {
        console.error("Error fetching picture:", error);
      }
    };

    if (clientId) {
      fetchPicture();
    }
  }, [clientId]);

  return (
    <div className="naslov-review">
      <div className="userprofile-header-review">
        <img
          src={picture !== null ? picture : CreatorImg}
          className="userprofilepreview-image-review"
          alt="Creator"
        />
        <div>
          <p><strong>Recenzija</strong></p>
          <div className="createdBy-review"> by @{name}</div>
        </div>
      </div>
    </div>
  );
  
};

export default ReviewCard;
