import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchIdAndTypeOfUser } from '../utils';

const WebSocketNotifications = () => {
    const url = "127.0.0.1:8000";
    //const [messages, setMessages] = useState([]);

    const connectWebSocketNotifications = (id, type) => {
        const token = localStorage.getItem("token");
        const socket = new WebSocket(`ws://${url}/ws/notifications/${type}-${id}/?token=${token}`);

        // Kada server šalje poruku
        socket.onmessage = (event) => {
            try {
                const newMessage = JSON.parse(event.data); // Parse is synchronous
                //setMessages((prevMessages) => [...prevMessages, newMessage.data]);

                console.log("Message accepted:", newMessage); // Debugging log
                toast(`@${newMessage.data.content}`, { onClick: () => window.location.replace("/dashboard") }); // todo izgled
            } catch (error) {
                console.error("Error parsing message:", error);
            }
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
            socket.onmessage = null;
            socket.close();
        };

    }

    const connectWebSocketChat = (id) => {
        const socket = new WebSocket(`ws://${url}/ws/chat/${id}/`); //todo id korisnika je room name

        // Kada server šalje poruku
        socket.onmessage = (event) => {
            try {
                const newMessage = JSON.parse(event.data); // Parse is synchronous
                //setMessages((prevMessages) => [...prevMessages, newMessage.data]);

                console.log("Message accepted:", newMessage); // Debugging log
                toast(`@${newMessage.data.content}`); // todo izgled
            } catch (error) {
                console.error("Error parsing message:", error);
            }
        };

        // Kretanje povezivanja sa serverom
        socket.onopen = () => {
            console.log(`Povezan sa WebSocket serverom ws://${url}/ws/chat/${id}/`);
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
            socket.onmessage = null;
            socket.close();
        };

    }

    useEffect(() => {
        // Uspostavljanje WebSocket veze
        const is_registered = async () => {
            try {
                await fetchIdAndTypeOfUser()
                    .then((userType) => {
                        if (userType && userType.id !== -1 && userType.type === "Client") { //sta sa subjektom?
                            connectWebSocketNotifications(userType.id, userType.type)
                            //connectWebSocketChat(userType.id)
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
            <ToastContainer position='bottom-right' />
        </div>
    );
};

export default WebSocketNotifications;
