import React, { useState } from "react";

const UserSearch = ({ users, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Pretraži korisnike..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          marginBottom: "1rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
          fontSize: "1rem",
        }}
      />
      <ul style={{ listStyle: "none", paddingLeft: 0, maxHeight: "200px", overflowY: "auto" }}>
        {filteredUsers.map((u) => (
          <li
            key={u.id}
            onClick={() => onSelect(u)}
            style={{
              cursor: "pointer",
              padding: "0.5rem 0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              borderBottom: "1px solid #eee",
            }}
          >
            <img
              src={u.avatar}
              alt={u.name}
              style={{ width: 32, height: 32, borderRadius: "50%" }}
            />
            <span>{u.name}</span>
            {u.online && <span style={{
              backgroundColor: "#4caf50",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              display: "inline-block",
              marginLeft: "auto"
            }} title="Online"></span>}
          </li>
        ))}
        {filteredUsers.length === 0 && (
          <li style={{ color: "#999", padding: "0.5rem" }}>Nema korisnika.</li>
        )}
      </ul>
    </div>
  );
};

export default UserSearch;
