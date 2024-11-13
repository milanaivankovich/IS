import React from 'react';
//import './MessageCard.css';

const MessageCard = ({ sender, content }) => {
  return (
    <div className="message-card">
      <h3>From: {sender}</h3>
      <p>{content}</p>
    </div>
  );
};

export default MessageCard;
