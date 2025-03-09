import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const WebSocketNotifications = () => {
    const url = "127.0.0.1:8000";
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Uspostavljanje WebSocket veze
        const socket = new WebSocket(`ws://${url}/ws/notifications/1/`);

        // Kada server šalje poruku
        socket.onmessage = (event) => {
            const newMessage = event.data;
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        };

        // Kretanje povezivanja sa serverom
        socket.onopen = () => {
            console.log('Povezan sa WebSocket serverom');
        };

        // Ako dođe do greške u vezi
        socket.onerror = (error) => {
            console.error('Greška u WebSocket vezi', error);
        };

        // Kada se veza zatvori
        socket.onclose = () => {
            console.log('Veza sa WebSocket serverom je zatvorena');
        };

        // Čišćenje resursa kada komponenta bude demontirana
        return () => {
            socket.close();
        };
    }, []);

    return (
        <div>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>{msg}</li>
                ))}
            </ul>
            <ToastContainer />
        </div>
    );
};

export default WebSocketNotifications;
