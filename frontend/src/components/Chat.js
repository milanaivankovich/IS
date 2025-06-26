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

const reactionsList = ["❤️", "👍", "😂", "😮", "😢", "👏"];

const Chat = ({ currentUserId, selectedUser, token, roomName }) => {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [reactionToMsg, setReactionToMsg] = useState(null);
  const [socket, setSocket] = useState(null);

  const messageListRef = useRef(null);
  const numericUserId = parseInt(currentUserId, 10);

  // Reset messages on room or user change
  useEffect(() => {
    setMessages([]);
  }, [roomName, selectedUser]);

  useEffect(() => {
    if (!token || !roomName) return;

    const ws = new WebSocket(
      `ws://localhost:8000/ws/chat/${roomName}/?token=${token}`
    );
    setSocket(ws);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Primljena WS poruka:", data);

      if (data.type === "chat_message") {
        console.log("Sender:", data.sender);
        console.log("currentUserId (broj):", numericUserId);
        setMessages((prev) => [
          ...prev,
          {
            id: data.message_id,
            sender: parseInt(data.sender, 10),
            content: data.message,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
            reaction: null,
            status: "delivered",
          },
        ]);
      }

      if (data.type === "message_reacted") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.message_id ? { ...msg, reaction: data.reaction } : msg
          )
        );
      }

      if (data.type === "typing_notification") {
        setTyping(true);
        setTimeout(() => setTyping(false), 2000);
      }

      if (data.type === "message_history") {
        const loaded = data.messages.map((m) => ({
          id: m.id,
          sender: parseInt(m.sender, 10),
          content: m.message,
          timestamp: new Date(m.timestamp),
          reaction: m.reaction || null,
          status: m.is_read ? "read" : "delivered",
        }));
        setMessages(loaded);
      }
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket zatvoren");
    };

    return () => {
      ws.close();
    };
  }, [roomName, token]);

  useEffect(() => {
    if (!socket) return;

    socket.onopen = () => {
      console.log("✅ WebSocket otvoren, šaljem fetch_messages");
      socket.send(
        JSON.stringify({
          action: "fetch_messages",
          page: 1,
        })
      );
    };
  }, [socket]);

  const handleSend = (text) => {
    if (!text.trim() || !socket || !selectedUser) return;

    socket.send(
      JSON.stringify({
        action: "send_message",
        receiver_id: selectedUser.id, // Sigurno broj
        message: text,
      })
    );

    setInputValue("");
    setShowPicker(false);
  };

  const onEmojiSelect = (emoji) => {
    setInputValue((prev) => prev + emoji.native);
    setShowPicker(false);
  };

  const sendReaction = (emoji, messageId) => {
    if (!socket) return;
    socket.send(
      JSON.stringify({
        action: "add_reaction",
        message_id: messageId,
        emoji,
      })
    );
    setReactionToMsg(null);
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
          src={selectedUser?.avatar || "https://via.placeholder.com/40"}
          alt="avatar"
          style={{ width: 40, height: 40, borderRadius: "50%" }}
        />
        <h4 style={{ margin: 0 }}>{selectedUser?.name || "Nepoznati korisnik"}</h4>
      </div>

      <MainContainer>
        <ChatContainer>
          <MessageList
            typingIndicator={
              typing ? <TypingIndicator content={`${selectedUser?.name} tipka...`} /> : null
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
                      right: msg.sender === numericUserId ? "10px" : undefined,
                      left: msg.sender !== numericUserId ? "50px" : undefined,
                    }}
                  >
                    {msg.reaction}
                  </div>
                )}
                <Message
                  model={{
                    message: msg.content,
                    sender: msg.sender === numericUserId ? "Ti" : selectedUser?.name,
                    direction: msg.sender === numericUserId ? "outgoing" : "incoming",
                    avatarPosition: "start",
                    avatarSpacer: true,
                    avatar: msg.sender !== numericUserId ? selectedUser?.avatar : undefined,
                  }}
                  onClick={() => setReactionToMsg(msg.id)}
                />
                <div
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    marginTop: "4px",
                    marginLeft: msg.sender === numericUserId ? "auto" : "50px",
                    maxWidth: "70%",
                    display: "flex",
                    justifyContent: msg.sender === numericUserId ? "flex-end" : "flex-start",
                    gap: "10px",
                  }}
                >
                  <span>{format(msg.timestamp)}</span>
                  {msg.sender === numericUserId && (
                    <span>{msg.status === "read" ? "Pročitano" : "Dostavljeno"}</span>
                  )}
                </div>

                {reactionToMsg === msg.id && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "30px",
                      left: msg.sender !== numericUserId ? "10px" : undefined,
                      right: msg.sender === numericUserId ? "10px" : undefined,
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
                        onClick={() => sendReaction(r, msg.id)}
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

          {/* Message input */}
          <MessageInput
            placeholder="Unesi poruku"
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            attachButton
            autoFocus
            style={{
              width: "calc(100% - 50px)",
              marginRight: "50px",
            }}
          />
        </ChatContainer>

        <button
          onClick={() => setShowPicker((prev) => !prev)}
          style={{
            position: "absolute",
            bottom: "10px",
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

        {showPicker && (
          <div
            style={{
              position: "absolute",
              bottom: "60px",
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
