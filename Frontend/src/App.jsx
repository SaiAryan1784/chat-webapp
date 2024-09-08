import React, { useEffect, useState } from 'react';
import io from "socket.io-client";
import { v4 } from 'uuid';

// Use environment variables or hardcoded URLs
const BACKEND_URL = 'https://chat-webapp-backend-theta.vercel.app/'; // Replace with the actual backend URL

const PORT = 5174;
const socket = io(BACKEND_URL || `http://localhost:${PORT}`);

const App = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState("");
  const [room, setRoom] = useState("");
  const [chatIsVisible, setChatIsVisible] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    console.log('connected:', socket.connected);
    socket.on('connect', () => {
      setIsConnected(true);
    });
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [isConnected]);

  useEffect(() => {
    // When a message is received from the server, add it to the messages list
    socket.on("receive_msg", ({ user, message, color }) => {
      const msg = { user, message, color }; // Store user, message, and color as an object
      setMessages((prevState) => [msg, ...prevState]); // Add it to the messages state
    });
    
    return () => {
      socket.off("receive_msg"); // Clean up the event listener
    };
  }, []);

  const handleEnterChatRoom = () => {
    if (user !== "" && room !== "") {
      setChatIsVisible(true);
      const userColor = getRandomColor(); // Assign a random color to the user
      socket.emit("join_room", { user, room, color: userColor });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      const newMsgData = {
        room,
        user,
        message: newMessage,
      };
      socket.emit("send_msg", newMsgData); // Send message to server
      setNewMessage(""); // Clear input after sending message
    }
  };

  // Helper function to get a random color
  const getRandomColor = () => {
    const colors = ["red", "green", "blue", "purple", "orange", "pink"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className='p-[20px]'>
      {!chatIsVisible ? (
        <>
          <input
            type='text'
            placeholder='user'
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <br />

          <input
            type='text'
            placeholder='room'
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <br />

          <button onClick={handleEnterChatRoom}>Enter Chat Room</button>
        </>
      ) : (
        <>
          <h5>Room: {room} | User: {user}</h5>
          <div className='h-[200px] w-[250px] border border-black overflow-scroll mb-[10px] p-[10px]'>
            {messages.map((el, index) => (
              <div key={index} style={{ color: el.color }}>
                {el.user}: {el.message}
              </div>
            ))}
          </div>

          <input
            type='text'
            placeholder='message'
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />

          <button onClick={handleSendMessage}>Send Message</button>
        </>
      )}
    </div>
  );
};

export default App;
