import React, { useState, useEffect } from "react";
import { ChatList } from "react-chat-elements";
import "react-chat-elements/dist/main.css";

const ChatListComponent = ({ onSelectRoom }) => {
    const [rooms, setRooms] = useState(["global", "tech", "gaming"]);

    return (
        <div style={{ width: "300px", borderRight: "1px solid #ccc", overflowY: "auto" }}>
            <h3 className="p-2">Chat Rooms</h3>
            <ChatList
                dataSource={rooms.map((room) => ({
                    title: room.charAt(0).toUpperCase() + room.slice(1), // Capitalize room name
                    subtitle: "Join the conversation",
                    onClick: () => onSelectRoom(room),
                }))}
            />
        </div>
    );
};

export default ChatListComponent;
