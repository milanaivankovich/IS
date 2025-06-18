import React, { useState } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

const Chat = ({ currentUserId, selectedUser }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: currentUserId,
      content: "Zdravo! Kako si?",
    },
    {
      id: 2,
      sender: selectedUser.id,
      content: "Ćao! Super, ti?",
    },
  ]);

  const handleSend = (text) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: currentUserId, content: text },
    ]);
  };

  return (
    <div style={{ height: "500px", position: "relative" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList>
            {messages.map((msg) => (
              <Message
                key={msg.id}
                model={{
                  message: msg.content,
                  sentTime: "just now",
                  sender:
                    msg.sender === currentUserId ? "You" : selectedUser.name,
                  direction:
                    msg.sender === currentUserId ? "outgoing" : "incoming",
                }}
              />
            ))}
          </MessageList>
          <MessageInput placeholder="Unesi poruku" onSend={handleSend} />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default Chat;