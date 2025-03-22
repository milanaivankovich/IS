import React, { useState, useEffect, useRef } from "react";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";
import useWebSocket from "../hooks/useWebSocket";

const Chat = ({ token }) => {
    const { messages, sendMessage, fetchMessages, sendTyping, onlineUsers, isConnected } = useWebSocket(token);
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Fetch old messages on component mount
    useEffect(() => {
        fetchMessages();
    }, []);

    // Scroll to latest message when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim() === "") return;
        sendMessage(newMessage);
        setNewMessage("");
        setIsTyping(false);
    };

    return (
        <Box
            sx={{
                maxWidth: 500,
                mx: "auto",
                p: 3,
                bgcolor: "background.default",
                borderRadius: 2,
                boxShadow: 3,
            }}
        >
            <Typography variant="h5" textAlign="center" fontWeight="bold" gutterBottom>
                Chat
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary">
                {isConnected ? "🟢 Online" : "🔴 Offline"}
            </Typography>

            <Typography variant="subtitle2" sx={{ my: 1 }}>
                <strong>Online Users:</strong> {onlineUsers.length > 0 ? onlineUsers.join(", ") : "None"}
            </Typography>

            <Paper elevation={3} sx={{ height: 300, overflowY: "auto", p: 2, my: 2, display: "flex", flexDirection: "column" }}>
                {messages.map((msg, index) => (
                    <Box
                        key={index}
                        sx={{
                            p: 1.5,
                            my: 1,
                            maxWidth: "75%",
                            borderRadius: 2,
                            boxShadow: 2,
                            alignSelf: msg.sender === token ? "flex-end" : "flex-start",
                            bgcolor: msg.sender === token ? "primary.main" : "grey.300",
                            color: msg.sender === token ? "white" : "black",
                        }}
                    >
                        <Typography variant="subtitle2" fontWeight="bold">
                            {msg.sender === token ? "You" : msg.sender}
                        </Typography>
                        <Typography variant="body1">{msg.message}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {msg.timestamp}
                        </Typography>
                    </Box>
                ))}
                <div ref={messagesEndRef} />
            </Paper>

            {isTyping && (
                <Typography variant="caption" color="text.secondary">
                    Someone is typing...
                </Typography>
            )}

            <Box sx={{ display: "flex", mt: 2, gap: 1 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        setIsTyping(true);
                        sendTyping();  // Notify others you're typing
                        setTimeout(() => setIsTyping(false), 2000);
                    }}
                    onKeyPress={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                    }}
                    sx={{ bgcolor: "white", borderRadius: 1 }}
                />
                <Button onClick={handleSendMessage} variant="contained" sx={{ px: 3 }}>
                    Send
                </Button>
            </Box>
        </Box>
    );
};

export default Chat;
