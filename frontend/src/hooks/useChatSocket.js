import { useState, useEffect } from 'react';

const useChatSocket = (room, token) => {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState({});
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://yourserver.com/ws/chat/?token=${token}&room=${room}`);

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'message_history':
          setMessages(data.messages);
          break;
        case 'chat_message':
          setMessages((prevMessages) => [...prevMessages, data]);
          break;
        case 'online_users':
          setOnlineUsers(data.users);
          break;
        case 'typing_notification':
          setTyping((prevTyping) => ({
            ...prevTyping,
            [data.sender]: data.is_typing,
          }));
          break;
        default:
          console.log('Unknown message type:', data);
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [room, token]);

  const sendMessage = (message) => {
    if (socket) {
      socket.send(
        JSON.stringify({
          action: 'send_message',
          message,
        })
      );
    }
  };

  const sendTypingNotification = (isTyping) => {
    if (socket) {
      socket.send(
        JSON.stringify({
          action: 'typing',
          is_typing: isTyping,
        })
      );
    }
  };

  return { messages, onlineUsers, typing, sendMessage, sendTypingNotification };
};

export default useChatSocket;
