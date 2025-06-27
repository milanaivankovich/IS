import React from "react";

const BASE_URL = "http://localhost:8000";

const ConversationList = ({ conversations, onSelect, users }) => {
  const getUser = (id) => users.find((u) => u.id === id);

  const getAvatarUrl = (user) => {
    const name = user.name || user.username || "Korisnik";

    if (user.avatar) {
      return user.avatar.startsWith("http")
        ? user.avatar
        : `${BASE_URL}${user.avatar}`;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=random&color=fff`;
  };

  return (
    <ul style={{ listStyle: "none", padding: 0, overflowY: "auto" }}>
      {conversations.map((conv, idx) => {
        const other = conv.other_user;
        const user = getUser(other.id) || other;
        const avatarUrl = getAvatarUrl(user);

        return (
          <li
            key={idx}
            onClick={() => onSelect(other)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0.5rem",
              cursor: "pointer",
              borderBottom: "1px solid #eee",
            }}
          >
            <img
              src={avatarUrl}
              alt=""
              style={{ width: 32, height: 32, borderRadius: "50%" }}
              onError={(e) => {
                const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.name || "Korisnik"
                )}&background=random&color=fff`;
                e.target.src = fallback;
              }}
            />
            <div style={{ marginLeft: 8, flex: 1 }}>
              <strong>{user.name || other.name}</strong>
              <br />
              <span style={{ fontSize: "0.9rem", color: "#555" }}>
                {conv.last_message}
              </span>
            </div>
            {conv.unread > 0 && (
              <span
                style={{
                  background: "red",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "0 6px",
                  fontSize: "0.8rem",
                }}
              >
                {conv.unread}
              </span>
            )}
          </li>
        );
      })}
      {conversations.length === 0 && (
        <li style={{ padding: "0.5rem", color: "#999" }}>Nema poruka.</li>
      )}
    </ul>
  );
};

export default ConversationList;
