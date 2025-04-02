import React, { useState } from "react";
import ChatListComponent from "./ChatList";
import ChatRoom from "./ChatRoom";

const ChatContainer = ({ token }) => {
  const [selectedRoom, setSelectedRoom] = useState("global");

  return (
    <div className="flex h-screen">
      {/* Sidebar with Chat Rooms */}
      <ChatListComponent onSelectRoom={setSelectedRoom} />
      
      {/* Main Chat Window */}
      <div className="flex-1 p-4">
        <ChatRoom token={token} room={selectedRoom} />
      </div>
    </div>
  );
};

export default ChatContainer;
