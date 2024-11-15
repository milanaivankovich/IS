import React from 'react';
//import './ActivityCard.css';

const ActivityCard = ({ description, date }) => {
  return (
    <div className="activity-card">
      <p>{description}</p>
      <span>{date}</span>
    </div>
  );
};

export default ActivityCard;
