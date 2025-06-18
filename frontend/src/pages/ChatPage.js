import React, { useState } from "react";
import UserSearch from "../components/UserSearch";
import ConversationList from "../components/ConversationList";
import Chat from "../components/Chat";

const dummyUsers = [
  { id: 1, name: "Ana" },
  { id: 2, name: "Marko" },
  { id: 3, name: "Jovana" },
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
    setSelectedUser(null); // Reset selection first
    setTimeout(() => setSelectedUser(user), 0); // Then set the new user
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "25%", padding: "1rem", borderRight: "1px solid #ccc" }}>
        <h3>Pretraži korisnike</h3>
        <UserSearch users={dummyUsers} onSelect={handleSelectUser} />

        <h4 style={{ marginTop: "2rem" }}>Nedavne poruke</h4>
        <ConversationList conversations={dummyConversations} onSelect={handleSelectUser} />
      </div>

      <div style={{ flex: 1, padding: "1rem" }}>
        {selectedUser ? (
          <Chat
            token={token}
            roomName={[currentUserId, selectedUser.id].sort().join("_")}
            currentUserId={currentUserId}
            selectedUser={selectedUser}
          />
        ) : (
          <div>Izaberi korisnika da započneš razgovor.</div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
