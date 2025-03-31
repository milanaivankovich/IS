import React, { useState, useEffect, useRef } from "react";
import { MessageBox, Input, Button } from "react-chat-elements";
import "react-chat-elements/dist/main.css";

const Chat = ({ token }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/ws/chat/?token=${token}`);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat_message") {
        setMessages((prev) => [...prev, data]);
      } else if (data.type === "message_history") {
        setMessages(data.messages);
      }
    };

    return () => ws.current.close();
  }, [token]);

  const sendMessage = () => {
    if (message.trim()) {
      ws.current.send(
        JSON.stringify({ action: "send_message", message })
      );
      setMessage("");
    }
  };

  return (
    <div className="chat-container p-4 bg-gray-100 w-96 mx-auto rounded-lg">
      <div className="messages h-80 overflow-auto p-2 bg-white rounded shadow">
        {messages.map((msg, index) => (
          <MessageBox
            key={index}
            position={msg.sender === "me" ? "right" : "left"}
            type="text"
            text={msg.message}
          />
        ))}
      </div>
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

export default Chat;
