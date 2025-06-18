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
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
      />
      <ul>
        {filteredUsers.map((u) => (
          <li
            key={u.id}
            style={{ cursor: "pointer", padding: "0.5rem 0" }}
            onClick={() => onSelect(u)}
          >
            {u.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearch;
