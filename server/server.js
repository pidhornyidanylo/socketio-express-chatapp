const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(express.static(path.join(__dirname, '../client')));

io.on("connection", (socket) => {
    // console.log("ws connected")

    socket.on("join", ({
        username,
        room
    }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        socket.emit("message", formatMessage("BOT", "Welcome to Chat"))

        socket.broadcast.to(user.room).emit("message", formatMessage("BOT", `${user.username} has joined the chat`));

        socket.on("typing", (data) => {
            if(data.typing === true) {
                socket.broadcast.to(user.room).emit('display', data)
            } else {
                io.emit('display', data);
            }
        });

        io.to(user.room).emit("room-users", {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })


    socket.on("chat-message", (message) => {
        io.to(getCurrentUser(socket.id).room).emit("message", formatMessage(getCurrentUser(socket.id).username, message));
    })

    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        if(user) {
            io.to(user.room).emit("message", formatMessage("BOT", `${user.username} has left the chat`));
            io.to(user.room).emit("room-users", {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    });
})

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log("SERVER RUNNING"));