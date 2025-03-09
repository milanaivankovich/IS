import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchIdAndTypeOfUser } from '../utils';

const WebSocketNotifications = () => {
    const url = "127.0.0.1:8000";
    const [messages, setMessages] = useState([]);

    const connectWebSocket = (id) => {
        const socket = new WebSocket(`ws://${url}/ws/notifications/${id}/`); //todo id korisnika je room name

        // Kada server šalje poruku
        socket.onmessage = (event) => {
            const newMessage = event.data;
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            console.assert("message accepted");
            toast("new message");
        };

        // Kretanje povezivanja sa serverom
        socket.onopen = () => {
            console.log(`Povezan sa WebSocket serverom ws://${url}/ws/notifications/${id}/`);
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

    }
    useEffect(() => {
        // Uspostavljanje WebSocket veze
        const is_registered = async () => {
            try {
                await fetchIdAndTypeOfUser()
                    .then((userType) => {
                        if (userType && userType.id !== -1) {
                            connectWebSocket(userType.id)
                        }
                    });
            } catch (error) {
                console.error("Error");
            }
        };
        is_registered();
    }, []);

    return (
        <div>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>
                        <ToastContainer />
                    </li>

                ))}
            </ul>
        </div>
    );
};

export default WebSocketNotifications;
