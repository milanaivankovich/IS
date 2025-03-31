import { useState, useEffect, useRef } from "react";

const useWebSocket = (token) => {
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!token) return;

        const socket = new WebSocket(`ws://localhost:8000/ws/chat/?token=${token}`);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("Connected to WebSocket");
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Received:", data);

            switch (data.type) {
                case "chat_message":
                    setMessages((prev) => [...prev, data]);
                    break;
                case "message_history":
                    setMessages(data.messages.reverse());  // Consider revisiting the order if needed
                    break;
                case "message_edited":
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.message_id === data.message_id ? { ...msg, message: data.new_content } : msg
                        )
                    );
                    break;
                case "message_deleted":
                    setMessages((prev) => prev.filter((msg) => msg.message_id !== data.message_id));
                    break;
                case "typing_notification":
                    console.log(`${data.user} is typing...`);
                    break;
                default:
                    console.log("Unknown message type:", data);
                    break;
            }
        };

        socket.onclose = () => {
            console.log("Disconnected from WebSocket");
            setIsConnected(false);
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [token]);

    const sendMessage = (message) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            const newMessage = {
                sender: "You",  // Replace with actual sender info if needed
                message,
                timestamp: new Date().toLocaleTimeString(),
            };
            setMessages((prev) => [...prev, newMessage]);
            socketRef.current.send(JSON.stringify({ action: "send_message", message }));
        }
    };

    const fetchMessages = (page = 1) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ action: "fetch_messages", page }));
        }
    };

    const editMessage = (message_id, new_content) => {
        if (socketRef.current) {
            socketRef.current.send(JSON.stringify({ action: "edit_message", message_id, new_content }));
        }
    };

    const deleteMessage = (message_id) => {
        if (socketRef.current) {
            socketRef.current.send(JSON.stringify({ action: "delete_message", message_id }));
        }
    };

    const sendTyping = () => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ action: "typing_notification", sender: token }));
        }
    };

    return { messages, sendMessage, fetchMessages, editMessage, deleteMessage, sendTyping, isConnected };
};

export default useWebSocket;
