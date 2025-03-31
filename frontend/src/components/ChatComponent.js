import React, { useState, useEffect } from "react";
import { MessageBox, Input } from "react-chat-elements";
import "react-chat-elements/dist/main.css";

const ChatComponent = ({ selectedUser }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");

    useEffect(() => {
        if (selectedUser) {
            fetch(`/api/messages?user=${selectedUser.id}`) // Fetch messages for the selected user
                .then((res) => res.json())
                .then((data) => setMessages(data));
        }
    }, [selectedUser]);

    const sendMessage = () => {
        if (inputText.trim() === "") return;

        const newMessage = {
            position: "right",
            type: "text",
            text: inputText,
            date: new Date(),
        };

        setMessages([...messages, newMessage]);
        setInputText(""); // Clear input

        // Send message to backend
        fetch("/api/send", {
            method: "POST",
            body: JSON.stringify({ to: selectedUser.id, message: inputText }),
            headers: { "Content-Type": "application/json" },
        });
    };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 20 }}>
            {selectedUser ? (
                <>
                    <h3>Chat with {selectedUser.name}</h3>
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        {messages.map((msg, index) => (
                            <MessageBox key={index} {...msg} />
                        ))}
                    </div>

                    <Input
                        placeholder="Type a message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        rightButtons={
                            <button onClick={sendMessage} style={{ padding: "5px 10px", marginLeft: 5 }}>
                                Send
                            </button>
                        }
                    />
                </>
            ) : (
                <h3>Select a user to start chatting</h3>
            )}
        </div>
    );
};

export default ChatComponent;
