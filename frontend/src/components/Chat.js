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

const Chat = ({ currentUserId, selectedUser, token, roomName, onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [reactionToMsg, setReactionToMsg] = useState(null);
  const [socket, setSocket] = useState(null);
  const numericUserId = parseInt(currentUserId, 10);

  const messageListRef = useRef(null);

  // Čistimo poruke kada se menja soba ili korisnik
  useEffect(() => {
    setMessages([]);
  }, [roomName, selectedUser]);

  // Kreiramo WS i postavljamo evente
  useEffect(() => {
    if (!token || !roomName || !selectedUser) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${roomName}/?token=${token}`);
    setSocket(ws);

    ws.onopen = () => {
      console.log("✅ WebSocket otvoren");
      ws.send(JSON.stringify({ action: "fetch_messages", page: 1 }));
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      switch (data.type) {
        case "chat_message": {
          const senderId = parseInt(data.sender, 10);
          const msgObj = {
            id: data.message_id,
            sender: senderId,
            content: data.message,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
            reaction: null,
            status: "delivered",
          };
          // Callback
          const convUser = senderId === numericUserId ? selectedUser : {
            id: senderId,
            name: selectedUser.name,
            avatar: selectedUser.avatar,
            online: true,
          };
          onNewMessage && onNewMessage(convUser);

          setMessages((prev) => [...prev, msgObj]);
          break;
        }
        case "typing_notification":
          setTyping(true);
          break;
        case "message_reacted":
          setMessages((prev) =>
            prev.map((m) => (m.id === data.message_id ? { ...m, reaction: data.reaction } : m))
          );
          break;
       case "message_history":
  setMessages(
    data.messages
      .slice() // kopija niza
      .reverse() // najstarije → najnovije
      .map((m) => ({
        id: m.id,
        sender: parseInt(m.sender, 10),
        content: m.message,
        timestamp: new Date(m.timestamp),
        reaction: m.reaction || null,
        status: m.is_read ? "read" : "delivered",
      }))
  );
  break;

        default:
          break;
      }
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket zatvoren");
    };

    return () => {
      ws.close();
    };
  }, [roomName, token, selectedUser]);

  // Automatski gasimo indikator tipkanja posle 3 sekunde
  useEffect(() => {
    if (!typing) return;
    const timeout = setTimeout(() => setTyping(false), 3000);
    return () => clearTimeout(timeout);
  }, [typing]);

  // Automatski scroll na dno kada stigne nova poruka
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollToBottom();
    }
  }, [messages]);

  // Slanje poruke
  const handleSend = (text) => {
    if (!text.trim() || !socket || !selectedUser) return;

    socket.send(
      JSON.stringify({
        action: "send_message",
        receiver_id: selectedUser.id,
        message: text,
      })
    );

    setInputValue("");
    setShowPicker(false);
  };

  // Emoji picker handler
  const onEmojiSelect = (emoji) => {
    setInputValue((prev) => prev + emoji.native);
    setShowPicker(false);
  };

  // Slanje reakcije na poruku
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
              <div
                key={msg.id}
                style={{ position: "relative", marginBottom: "30px" }}
              >
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
                    justifyContent:
                      msg.sender === numericUserId ? "flex-end" : "flex-start",
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
            style={{ width: "calc(100% - 50px)", marginRight: "50px" }}
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
