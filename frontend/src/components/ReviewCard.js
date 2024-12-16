import React, { useEffect, useState } from "react";

const ReviewCard = ({ clientId }) => {
  const [name, setName] = useState("");

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

  return (
    <div className="Naslov">
            Recenzija
            <div className="createdBy"> by @{name}</div>
          </div>
  );
};

export default ReviewCard;
