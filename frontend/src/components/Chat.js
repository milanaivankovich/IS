import React, { useState, useEffect } from "react";
import useWebSocket from "./useWebSocket";
import { v4 as uuidv4 } from "uuid";

const Chat = ({ token }) => {
    const { messages, sendMessage, fetchMessages, editMessage, deleteMessage, isConnected } = useWebSocket(token);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        fetchMessages(); // Fetch messages when the component mounts
    }, []);

    const handleSendMessage = () => {
        if (newMessage.trim() === "") return;
        sendMessage(newMessage);
        setNewMessage("");
    };

    return (
        <div className="chat-container">
            <h2>Chat</h2>
            <div className="status">{isConnected ? "🟢 Online" : "🔴 Offline"}</div>
            <div className="messages">
                {messages.map((msg) => (
                    <div key={uuidv4()} className="message">
                        <span>{msg.sender}: </span>
                        {msg.message}
                        <button onClick={() => editMessage(msg.message_id, prompt("Edit message:", msg.message))}>
                            ✏️
                        </button>
                        <button onClick={() => deleteMessage(msg.message_id)}>🗑</button>
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    );
};

export default Chat;
