import React from "react";

const ConversationList = ({ conversations, onSelect, users }) => {
  const getUser = (id) => users.find((u) => u.id === id);

  return (
    <ul style={{ listStyle: "none", paddingLeft: 0, maxHeight: "300px", overflowY: "auto" }}>
      {conversations.map((conv, index) => {
        const user = getUser(conv.other_user.id);
        if (!user) return null;

        return (
          <li
            key={index}
            onClick={() => onSelect(conv.other_user)}
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
              src={user.avatar}
              alt={user.name}
              style={{ width: 32, height: 32, borderRadius: "50%" }}
            />
            <span>{conv.name}</span>
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
        );
      })}
      {conversations.length === 0 && (
        <li style={{ color: "#999", padding: "0.5rem" }}>Nema poruka.</li>
      )}
    </ul>
  );
};

export default ConversationList;
