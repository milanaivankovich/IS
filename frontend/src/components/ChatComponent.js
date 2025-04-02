import React, { useState, useEffect } from "react";
import { MessageBox, Input } from "react-chat-elements";
import "react-chat-elements/dist/main.css";

const ChatComponent = ({ selectedUser }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");

    useEffect(() => {
        if (selectedUser) {
            fetch(`/api/messages?user=${selectedUser.id}`)
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
        setInputText(""); 

        fetch("/api/send", {
            method: "POST",
            body: JSON.stringify({ to: selectedUser.id, message: inputText }),
            headers: { "Content-Type": "application/json" },
        });
    };

    return (
        <div className="flex flex-col flex-1 p-4">
            {selectedUser ? (
                <>
                    <h3 className="text-lg font-semibold mb-2">Chat with {selectedUser.name}</h3>
                    <div className="flex-1 overflow-y-auto bg-gray-100 p-4 rounded">
                        {messages.map((msg, index) => (
                            <MessageBox key={index} {...msg} />
                        ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                        <Input
                            placeholder="Type a message..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                            rightButtons={
                                <button className="bg-blue-500 text-white px-4 py-1 rounded" onClick={sendMessage}>
                                    Send
                                </button>
                            }
                        />
                    </div>
                </>
            ) : (
                <h3 className="text-lg font-semibold">Select a user to start chatting</h3>
            )}
        </div>
    );
};

export default ChatComponent;
