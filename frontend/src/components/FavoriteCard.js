import React from 'react';
//import './FavoriteCard.css';

const FavoriteCard = ({ title, description }) => {
  return (
    <div className="favorite-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default FavoriteCard;
