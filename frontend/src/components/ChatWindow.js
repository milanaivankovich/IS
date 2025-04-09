// src/components/ChatWindow.js
import React, { useState, useEffect } from 'react';
import { MessageBox, Input, Button } from 'react-chat-elements';
import socket from '../services/socket';
import 'react-chat-elements/dist/main.css';

const ChatWindow = ({ currentUser, currentRoom }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    socket.emit('join_room', currentRoom);

    socket.on('receive_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('message_deleted', (messageId) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== messageId)
      );
    });

    socket.on('message_edited', (editedMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === editedMessage.id ? editedMessage : msg
        )
      );
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_deleted');
      socket.off('message_edited');
    };
  }, [currentRoom]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: currentUser,
        content: inputMessage,
        room: currentRoom,
        timestamp: new Date(),
      };
      socket.emit('send_message', message);
      setMessages((prevMessages) => [...prevMessages, message]);
      setInputMessage('');
    }
  };

  const handleDeleteMessage = (messageId) => {
    socket.emit('delete_message', { id: messageId, room: currentRoom });
  };

  const handleEditMessage = (messageId, newContent) => {
    socket.emit('edit_message', {
      id: messageId,
      content: newContent,
      room: currentRoom,
    });
  };

  return (
    <div>
      <div className="message-list">
        {messages.map((msg) => (
          <MessageBox
            key={msg.id}
            position={msg.sender === currentUser ? 'right' : 'left'}
            type="text"
            text={msg.content}
            date={new Date(msg.timestamp)}
            onDelete={() => handleDeleteMessage(msg.id)}
            onEdit={(newContent) => handleEditMessage(msg.id, newContent)}
          />
        ))}
      </div>
      <div className="message-input">
        <Input
          placeholder="Type here..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          rightButtons={<Button text="Send" onClick={handleSendMessage} />}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
