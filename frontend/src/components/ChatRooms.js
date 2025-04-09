// src/components/ChatRooms.js
import React, { useState } from 'react';
import ChatWindow from './ChatWindow';

const ChatRooms = ({ currentUser }) => {
  const [currentRoom, setCurrentRoom] = useState("general");

  const rooms = ["general", "tech", "random"];

  return (
    <div>
      <div className="room-list mb-3">
        {rooms.map((room) => (
          <button key={room} onClick={() => setCurrentRoom(room)}>
            {room}
          </button>
        ))}
      </div>
      <ChatWindow currentUser={currentUser} currentRoom={currentRoom} />
    </div>
  );
};

export default ChatRooms;

