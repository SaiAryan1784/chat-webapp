import React, { useEffect, useState } from 'react';
import io from "socket.io-client";

const BACKEND_URL = 'https://chat-webapp-backend-theta.vercel.app'; // Replace with your actual backend URL

const socket = io(BACKEND_URL);

const App = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState("");
  const [room, setRoom] = useState("");
  const [chatIsVisible, setChatIsVisible] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
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
    socket.on("receive_msg", ({ user, message, color }) => {
      const msg = { user, message, color };
      setMessages((prevState) => [msg, ...prevState]);
    });
    
    return () => {
      socket.off("receive_msg");
    };
  }, []);

  const handleEnterChatRoom = () => {
    if (user !== "" && room !== "") {
      setChatIsVisible(true);
      const userColor = getRandomColor();
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
      socket.emit("send_msg", newMsgData);
      setNewMessage("");
    }
  };

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
