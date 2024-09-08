const express = require('express');
const app = express();
const { createServer } = require('http');
const server = createServer(app);

const { Server } = require("socket.io");

const PORT =  5174;

const Frontend_url = 'https://chat-webapp-lm6eflamg-saiaryan1784s-projects.vercel.app'

app.use(cors({
    origin: Frontend_url || "http://localhost:5173", // Adjust to the actual frontend URL in production
}));

const io = new Server(server, {
    cors: {
        origin: Frontend_url || "http://localhost:5173",
        methods: ["GET", "POST"] // Update the CORS origin if needed
    }
});

const users = {}; // To store user colors

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    // When a user joins a room, save their color
    socket.on("join_room", ({ user, room, color }) => {
        socket.join(room);
        users[socket.id] = { user, color }; // Store the user's color by socket ID
    });

    // Handle sending messages
    socket.on("send_msg", ({ room, user, message }) => {
        const userColor = users[socket.id]?.color || "black"; // Default to black if no color found
        const messageData = { user, message, color: userColor };
        io.to(room).emit("receive_msg", messageData); // Emit the message with the color
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete users[socket.id]; // Remove user from memory when disconnected
    });
});

server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});
