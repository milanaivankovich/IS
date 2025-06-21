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
import EmojiPicker from "emoji-picker-react";

const reactionsList = ["❤️", "👍", "😂", "😮", "😢", "👏"];

const Chat = ({ currentUserId, selectedUser }) => {
  const [messages, setMessages] = useState([
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
  const [typing, setTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [reactionToMsg, setReactionToMsg] = useState(null);

  const messageListRef = useRef(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

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
            reaction: null,
          },
        ]);
      }, 2000);
    }, 15000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  const handleSend = (msgText) => {
    if (!msgText.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: currentUserId,
        content: msgText,
        timestamp: new Date(),
        status: "delivered",
        reaction: null,
      },
    ]);
    setShowPicker(false);
    setInputValue("");
  };

  const onEmojiClick = (emojiData) => {
    setInputValue((prev) => prev + emojiData.emoji);
  };

  const togglePicker = () => setShowPicker((prev) => !prev);

  const addReaction = (msgId, reaction) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, reaction } : m))
    );
    setReactionToMsg(null);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #ddd", backgroundColor: "#f4f4f4", display: "flex", alignItems: "center", gap: "12px" }}>
        <img
          src={selectedUser.avatar || "https://via.placeholder.com/40"}
          alt="avatar"
          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
        />
        <h4 style={{ margin: 0 }}>{selectedUser.name}</h4>
      </div>

      <MainContainer style={{ flex: 1 }}>
        <ChatContainer>
          <MessageList
            typingIndicator={typing ? <TypingIndicator content={`${selectedUser.name} tipka...`} /> : null}
            ref={messageListRef}
            style={{ overflowY: "auto" }}
          >
            {messages.map((msg) => (
              <div key={msg.id} style={{ marginBottom: "10px", position: "relative" }}>
                <Message
                  onClick={() => setReactionToMsg(msg.id)}
                  model={{
                    message: msg.content,
                    sender: msg.sender === currentUserId ? "You" : selectedUser.name,
                    direction: msg.sender === currentUserId ? "outgoing" : "incoming",
                    avatarPosition: "start",
                    avatarSpacer: true,
                    avatar: msg.sender === currentUserId ? null : selectedUser.avatar,
                  }}
                />
                {msg.reaction && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 5,
                      left: msg.sender !== currentUserId ? "50px" : undefined,
                      right: msg.sender === currentUserId ? "20px" : undefined,
                      fontSize: "18px",
                    }}
                  >
                    {msg.reaction}
                  </span>
                )}
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
                    <span>{msg.status === "read" ? "Pročitano" : "Dostavljeno"}</span>
                  )}
                </div>

                {reactionToMsg === msg.id && (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      position: "absolute",
                      bottom: "30px",
                      left: msg.sender !== currentUserId ? "10px" : undefined,
                      right: msg.sender === currentUserId ? "10px" : undefined,
                      background: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "4px 8px",
                      zIndex: 2,
                    }}
                  >
                    {reactionsList.map((r) => (
                      <button
                        key={r}
                        style={{
                          fontSize: "18px",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onClick={() => addReaction(msg.id, r)}
                      >
                        {r}
                      </button>
                    ))}
                    <button
                      onClick={() => setReactionToMsg(null)}
                      style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "16px" }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </MessageList>

          {/* Emoji picker */}
          {showPicker && (
            <div
              style={{
                position: "absolute",
                bottom: "70px",
                right: "20px",
                zIndex: 1000,
              }}
            >
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}

          {/* Input + emoji button wrapper */}
          
            <button
              onClick={togglePicker}
              style={{
                fontSize: "22px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                marginRight: "8px",
                userSelect: "none",
              }}
              aria-label="Toggle emoji picker"
            >
              😊
            </button>
            <MessageInput
              placeholder="Unesi poruku"
              onSend={handleSend}
              attachButton={false}
              value={inputValue}
              onChange={setInputValue}
              style={{ flex: 1 }}
            />
          
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default Chat;
