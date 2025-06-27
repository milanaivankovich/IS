import React, { useState, useEffect, useCallback } from "react";
import UserSearch from "../components/UserSearch";
import ConversationList from "../components/ConversationList";
import Chat from "../components/Chat";
import axios from "axios";

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]); // iz UserSearch
  const [conversations, setConversations] = useState([]); // za listu
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.id;
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchConversations = useCallback(async () => {
    try {
      const resp = await axios.get("http://localhost:8000/api/conversations/", {
        headers: { Authorization: `Token ${token}` },
        params: { user: user},
        
      });
      setConversations(resp.data);
    } catch (err) {
      console.error("Greška pri učitavanju konverzacija:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSelectUser = (user) => {
    setSelectedUser(null);
    setTimeout(() => setSelectedUser(user), 0);
  };

  const handleNewMessage = (conversationUser) => {
    setConversations(prev => {
      // premjesti ili dodaj iznad
      const others = prev.filter(c => c.other_user.id !== conversationUser.id);
      return [{ other_user: conversationUser, last_message: "", unread: 0 }, ...others];
    });
    fetchConversations();
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: 320, padding: 16, borderRight: "1px solid #ccc", display: "flex", flexDirection: "column" }}>
        <h3>Pretraži korisnike</h3>
        <UserSearch onSelect={handleSelectUser} setAllUsers={setAllUsers} />
        <h4>Nedavne poruke</h4>
        <ConversationList
          conversations={conversations}
          onSelect={handleSelectUser}
          users={allUsers}
        />
      </div>
      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column" }}>
        {selectedUser ? (
          <Chat
            token={token}
            currentUserId={currentUserId}
            selectedUser={selectedUser}
            roomName={[currentUserId, selectedUser.id].sort().join("_")}
            onNewMessage={handleNewMessage}
          />
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
            Izaberi korisnika da započneš razgovor.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
