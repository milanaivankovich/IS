import React, { useEffect, useState } from "react";
import { ChatList } from "react-chat-elements";
import "react-chat-elements/dist/main.css";

const ChatListComponent = ({ onSelectChat }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch("/api/users") // Fetch user list from backend
            .then((res) => res.json())
            .then((data) => setUsers(data));
    }, []);

    return (
        <div style={{ width: "300px", borderRight: "1px solid #ccc", overflowY: "auto" }}>
            <ChatList
                dataSource={users.map((user) => ({
                    avatar: user.avatar || "https://via.placeholder.com/150",
                    alt: user.name,
                    title: user.name,
                    subtitle: user.lastMessage || "No messages yet",
                    date: new Date(user.lastActive),
                    unread: user.unread || 0,
                    onClick: () => onSelectChat(user),
                }))}
            />
        </div>
    );
};

export default ChatListComponent;
