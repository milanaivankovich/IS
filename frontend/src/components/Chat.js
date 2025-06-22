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
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import EmojiPicker from "emoji-picker-react";

const reactionsList = ["❤️", "👍", "😂", "😮", "😢", "👏"];

const Chat = ({ currentUserId, selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [reactionToMsg, setReactionToMsg] = useState(null);

  const messageListRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: currentUserId,
        content: "Zdravo! Kako si?",
        timestamp: new Date(Date.now() - 1000 * 60 * 3),
        status: "read",
        reaction: null,
      },
      {
        id: 2,
        sender: selectedUser.id,
        content: "Ćao! Super, ti?",
        timestamp: new Date(Date.now() - 1000 * 60 * 2),
        status: "read",
        reaction: null,
      },
    ]);
  }, [selectedUser]);

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
            content: "Ovo je simulirana poruka 😊",
            timestamp: new Date(),
            status: "delivered",
            reaction: null,
          },
        ]);
      }, 2000);
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedUser]);

  const handleSend = (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: currentUserId,
        content: text,
        timestamp: new Date(),
        status: "delivered",
        reaction: null,
      },
    ]);
    setInputValue("");
    setShowPicker(false);
  };

  const onEmojiSelect = (emoji) => {
    setInputValue((prev) => prev + emoji.native);
    setShowPicker(false);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #ddd",
          backgroundColor: "#f4f4f4",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <img
          src={selectedUser.avatar || "https://via.placeholder.com/40"}
          alt="avatar"
          style={{ width: 40, height: 40, borderRadius: "50%" }}
        />
        <h4 style={{ margin: 0 }}>{selectedUser.name}</h4>
      </div>
     

      <MainContainer>
        <ChatContainer>
          <MessageList
            typingIndicator={
              typing ? <TypingIndicator content={`${selectedUser.name} tipka...`} /> : null
            }
            ref={messageListRef}
          >
            {messages.map((msg) => (
              <div key={msg.id} style={{ position: "relative", marginBottom: "30px" }}>
                {msg.reaction && (
                  <div
                    style={{
                      position: "absolute",
                      fontSize: "18px",
                      top: "-20px",
                      right: msg.sender === currentUserId ? "10px" : undefined,
                      left: msg.sender !== currentUserId ? "50px" : undefined,
                    }}
                  >
                    {msg.reaction}
                  </div>
                )}
                <Message
                  model={{
                    message: msg.content,
                    sender: msg.sender === currentUserId ? "You" : selectedUser.name,
                    direction: msg.sender === currentUserId ? "outgoing" : "incoming",
                    avatarPosition: "start",
                    avatarSpacer: true,
                    avatar: msg.sender !== currentUserId ? selectedUser.avatar : undefined,
                  }}
                  onClick={() => setReactionToMsg(msg.id)}
                />
                <div
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    marginTop: "4px",
                    marginLeft: msg.sender === currentUserId ? "auto" : "50px",
                    maxWidth: "70%",
                    display: "flex",
                    justifyContent: msg.sender === currentUserId ? "flex-end" : "flex-start",
                    gap: "10px",
                  }}
                >
                  <span>{format(msg.timestamp)}</span>
                  {msg.sender === currentUserId && (
                    <span>{msg.status === "read" ? "Pročitano" : "Dostavljeno"}</span>
                  )}
                </div>

                {reactionToMsg === msg.id && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "30px",
                      left: msg.sender !== currentUserId ? "10px" : undefined,
                      right: msg.sender === currentUserId ? "10px" : undefined,
                      background: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "4px 8px",
                      zIndex: 10,
                      display: "flex",
                      gap: "6px",
                    }}
                  >
                    {reactionsList.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setMessages((prev) =>
                            prev.map((msg) => (msg.id === reactionToMsg ? { ...msg, reaction: r } : msg))
                          );
                          setReactionToMsg(null);
                        }}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "18px",
                        }}
                      >
                        {r}
                      </button>
                    ))}
                    <button
                      onClick={() => setReactionToMsg(null)}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </MessageList>

          {/* Ovde ćemo staviti MessageInput sa emoji pickerom */}
        {/* Emoji dugme iznad MessageInput-a */}
 

  {/* Message input pomeren da emoji dugme ne preklapa */}
  <MessageInput
    placeholder="Unesi poruku"
    value={inputValue}
    onChange={setInputValue}
    onSend={handleSend}
    attachButton
    autoFocus
    style={{
      width: "calc(100% - 50px)", // pravi mesta za dugme
      marginRight: "50px", // pomeraj po potrebi
    }}
  />
</ChatContainer>
 <button
    onClick={() => setShowPicker((prev) => !prev)}
    style={{
      position: "absolute",
      bottom: "10px", // podešavaj po potrebi
      right: "16px",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      fontSize: "24px",
      zIndex: 1000,
    }}
    aria-label="Emoji dugme"
  >
    😊
  </button>

  {/* Emoji picker koji se otvara iznad dugmeta */}
  {showPicker && (
    <div
      style={{
        position: "absolute",
        bottom: "10px", // iznad dugmeta
        right: "12px",
        zIndex: 2000,
      }}
    >
      <Picker data={data} onEmojiSelect={onEmojiSelect} />
    </div>
  )}
</MainContainer>
    </div>
  );
};

export default Chat;
