import React, { useState } from "react";
import UserSearch from "../components/UserSearch";
import ConversationList from "../components/ConversationList";
import Chat from "../components/Chat";

const dummyUsers = [
  { id: 1, name: "Ana", avatar: "https://i.pravatar.cc/150?img=1", online: true },
  { id: 2, name: "Marko", avatar: "https://i.pravatar.cc/150?img=2", online: false },
  { id: 3, name: "Jovana", avatar: "https://i.pravatar.cc/150?img=3", online: true },
];

const dummyConversations = [
  { name: "Marko", other_user: { id: 2 } },
  { name: "Ana", other_user: { id: 1 } },
];

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const currentUserId = 999; // Dummy logged-in user
  const token = "dummy-token";

  const handleSelectUser = (user) => {
    setSelectedUser(null);
    setTimeout(() => setSelectedUser(user), 0);
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <div
        style={{
          width: "320px",
          padding: "1rem",
          borderRight: "1px solid #ccc",
          backgroundColor: "#f9f9f9",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h3 style={{ marginBottom: "0.5rem" }}>Pretraži korisnike</h3>
        <UserSearch users={dummyUsers} onSelect={handleSelectUser} />

        <h4 style={{ marginTop: "2rem", marginBottom: "0.5rem" }}>Nedavne poruke</h4>
        <ConversationList
          users={dummyUsers}
          conversations={dummyConversations}
          onSelect={handleSelectUser}
        />
      </div>

      <div style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column" }}>
        {selectedUser ? (
          <Chat
            token={token}
            roomName={[currentUserId, selectedUser.id].sort().join("_")}
            currentUserId={currentUserId}
            selectedUser={selectedUser}
          />
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#888",
              fontSize: "1.2rem",
            }}
          >
            Izaberi korisnika da započneš razgovor.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
