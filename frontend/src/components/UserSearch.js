import React, { useState, useEffect } from "react";

const UserSearch = ({ onSelect, setAllUsers }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (q) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/search/users/?q=${q}`, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();

     const combined = [
  ...(data.clients || []).map((client) => ({
    id: client.id,
    name: `${client.first_name} ${client.last_name}`,
    avatar: client.profile_picture
      ? `http://localhost:8000${client.profile_picture}` // već je to pun URL ako backend koristi `request.build_absolute_uri`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(client.username)}&background=random&color=fff`
      

,
    online: true,
  })),
  ...(data.business_profiles || []).map((bp) => ({
    id: bp.id,
    name: bp.nameSportOrganization,
    avatar: bp.profile_picture
      ? `http://localhost:8000${bp.profile_picture}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(bp.nameSportOrganization)}&background=random&color=fff`,
    online: true,
  })),
];

      setResults(combined);
      setAllUsers(combined); // Šaljemo korisnike u ChatPage za ConversationList
    } catch (err) {
      console.error("Greška prilikom pretrage:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim() !== "") {
        handleSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div>
      <input
        type="text"
        placeholder="Pretraži korisnike..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          marginBottom: "1rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
          fontSize: "1rem",
        }}
      />
      {isLoading && <div style={{ fontSize: "0.9rem", color: "#888" }}>Učitavanje...</div>}
      <ul style={{ listStyle: "none", paddingLeft: 0, maxHeight: "200px", overflowY: "auto" }}>
        {results.map((user) => (
          <li
            key={user.id}
            onClick={() => onSelect(user)}
            style={{
              cursor: "pointer",
              padding: "0.5rem 0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              borderBottom: "1px solid #eee",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <img
              src={user.avatar}
              alt={user.name}
              style={{ width: 32, height: 32, borderRadius: "50%" }}
            />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</span>
            {user.online && (
              <span
                style={{
                  backgroundColor: "#4caf50",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  display: "inline-block",
                  marginLeft: "auto",
                }}
                title="Online"
              />
            )}
          </li>
        ))}
        {results.length === 0 && query && !isLoading && (
          <li style={{ color: "#999", padding: "0.5rem" }}>Nema rezultata za pretragu.</li>
        )}
      </ul>
    </div>
  );
};

export default UserSearch;
