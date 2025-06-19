import React, { useState, useEffect, useRef } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { format } from "timeago.js";

const Chat = ({ currentUserId, selectedUser }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: currentUserId,
      content: "Zdravo! Kako si?",
      timestamp: new Date(Date.now() - 1000 * 60 * 3), // pre 3 min
      status: "read",
    },
    {
      id: 2,
      sender: selectedUser.id,
      content: "Ćao! Super, ti?",
      timestamp: new Date(Date.now() - 1000 * 60 * 2), // pre 2 min
      status: "read",
    },
  ]);
  const [typing, setTyping] = useState(false);
  const messageListRef = useRef(null);

  // Scroll na kraj kad stignu nove poruke
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  // Simuliraj poruke od druge strane i typing indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setTyping(true);

      setTimeout(() => {
        setTyping(false);

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: selectedUser.id,
            content: "Ovo je simulirana poruka od druge strane 😊",
            timestamp: new Date(),
            status: "delivered",
          },
        ]);
      }, 2000);
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedUser]);

  const handleSend = (text) => {
    if (text.trim() === "") return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: currentUserId, content: text, timestamp: new Date(), status: "delivered" },
    ]);
  };

  return (
    <div style={{ height: "100%", position: "relative", display: "flex", flexDirection: "column" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList
            typingIndicator={
              typing ? <TypingIndicator content={`${selectedUser.name} tipka...`} /> : null
            }
            ref={messageListRef}
            style={{ overflowY: "auto" }}
          >
            {messages.map((msg) => (
              <div key={msg.id} style={{ marginBottom: "10px" }}>
                <Message
                  model={{
                    message: msg.content,
                    sender: msg.sender === currentUserId ? "You" : selectedUser.name,
                    direction: msg.sender === currentUserId ? "outgoing" : "incoming",
                    avatarPosition: "start",
                    avatarSpacer: true,
                    avatar: msg.sender === currentUserId ? null : selectedUser.avatar,
                  }}
                />
                <div
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    marginLeft: msg.sender === currentUserId ? "auto" : "40px",
                    marginTop: "2px",
                    display: "flex",
                    gap: "10px",
                    justifyContent: msg.sender === currentUserId ? "flex-end" : "flex-start",
                    maxWidth: "70%",
                  }}
                >
                  <span>{format(msg.timestamp)}</span>
                  {msg.sender === currentUserId && (
                    <span>
                      {msg.status === "read" ? "Pročitano" : "Dostavljeno"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </MessageList>
          <MessageInput
  placeholder="Unesi poruku"
  onSend={handleSend}
  attachButton={false}
  style={{
    borderTop: "1px solid #ddd",
    marginBottom: "20px" // ⬅️ Podiže input malo iznad dna
  }}
/>

        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default Chat;
