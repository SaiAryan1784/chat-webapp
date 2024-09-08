const express = require('express');
const cors = require('cors');
const app = express();
const { createServer } = require('http');
const server = createServer(app);
const { Server } = require("socket.io");

const FRONTEND_URL = 'https://chat-webapp-khaki.vercel.app';

app.use(cors({
    origin: '*'
}));

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
    }
});

const users = {};

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on("join_room", ({ user, room, color }) => {
        socket.join(room);
        users[socket.id] = { user, color };
    });

    socket.on("send_msg", ({ room, user, message }) => {
        const userColor = users[socket.id]?.color || "black";
        const messageData = { user, message, color: userColor };
        io.to(room).emit("receive_msg", messageData);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete users[socket.id];
    });
});

server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});
