import React from "react";

const ConversationList = ({ conversations, onSelect }) => {
  return (
    <ul>
      {conversations.map((conv, index) => (
        <li
          key={index}
          style={{ cursor: "pointer", padding: "0.5rem 0" }}
          onClick={() => onSelect(conv.other_user)}
        >
          {conv.name}
        </li>
      ))}
    </ul>
  );
};

export default ConversationList;