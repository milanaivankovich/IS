import React, { useState, useEffect, useRef } from "react";
import { MessageBox, Input, Button } from "react-chat-elements";
import "react-chat-elements/dist/main.css";

const ChatRoom = ({ token, room }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const ws = useRef(null);

  // Establish WebSocket connection for the selected room
  useEffect(() => {
    if (!room || !token) return;

    ws.current = new WebSocket(`ws://localhost:8000/ws/chat/?token=${token}&room=${room}`);

    ws.current.onopen = () => console.log(`Connected to room: ${room}`);
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat_message") {
        setMessages((prev) => [...prev, data]);
      } else if (data.type === "online_users") {
        setOnlineUsers(data.users);
      }
    };

    return () => ws.current.close();  // Close the WebSocket connection when the component is unmounted
  }, [room, token]);

  // Send a message to the WebSocket server
  const sendMessage = () => {
    if (message.trim() && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action: "send_message", message }));
      setMessage("");
    }
  };

  return (
    <div className="p-4 bg-gray-100 w-full h-full flex flex-col">
      <h2 className="text-lg font-bold">Room: {room}</h2>

      {/* Online Users */}
      <div className="p-2 bg-white rounded shadow mb-2">
        <h3 className="text-sm font-semibold">Online Users:</h3>
        <ul>
          {onlineUsers.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>

      {/* Chat Messages */}
      <div className="messages flex-1 overflow-auto bg-white rounded p-2 shadow">
        {messages.map((msg, index) => (
          <MessageBox
            key={index}
            position={msg.sender === "me" ? "right" : "left"}
            type="text"
            text={msg.message}
          />
        ))}
      </div>

      {/* Message Input */}
      <div className="mt-2 flex gap-2">
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1"
        />
        <Button text="Send" onClick={sendMessage} />
      </div>
    </div>
  );
};

export default ChatRoom;
