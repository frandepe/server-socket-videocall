// const express = require("express");
// const app = express();
// const http = require("http").createServer(app);
// // const io = require("socket.io")(http);
// const PORT = process.env.PORT || 3001;
// const path = require("path");

// // const io = require("socket.io")(http, {
// //   transports: ["websocket", "polling"],
// //   cors: {
// //     origin: "*", // Reemplaza con tu URL de frontend
// //     methods: ["GET", "POST"],
// //     allowedHeaders: ["Content-Type"],
// //     credentials: true, // Si necesitas compartir cookies u otras credenciales
// //   },
// // });

// const { Server } = require("socket.io");

// const io = new Server({
//   cors: {
//     origin: "https://client-videocall.vercel.app", // Asegúrate de usar la URL de tu frontend desplegado en Vercel
//     methods: ["GET", "POST"],
//   },
// });

// let socketList = {};

// // app.use(express.static(path.join(__dirname, 'public'))); // this will work for CRA build
// app.use(express.static(path.join(__dirname, "../vite")));

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../client/build")));

//   app.get("/*", function (req, res) {
//     res.sendFile(path.join(__dirname, "../client/build/index.html"));
//   });
// }

// // Route
// app.get("/ping", (req, res) => {
//   res
//     .send({
//       success: true,
//     })
//     .status(200);
// });

// // Socket
// io.on("connection", (socket) => {
//   console.log(`New User connected: ${socket.id}`);

//   socket.on("disconnect", () => {
//     socket.disconnect();
//     console.log("User disconnected!");
//   });

//   socket.on("BE-check-user", ({ roomId, userName }) => {
//     let error = false;
//     console.log("BE-check-user", roomId, userName);
//     io.sockets.in(roomId).clients((err, clients) => {
//       clients.forEach((client) => {
//         if (socketList[client] == userName) {
//           error = true;
//         }
//       });
//       socket.emit("FE-error-user-exist", { error });
//     });
//   });

//   /**
//    * Join Room
//    */
//   socket.on("BE-join-room", ({ roomId, userName }) => {
//     // Socket Join RoomName
//     console.log("BE-join-room", roomId, userName);
//     socket.join(roomId);
//     socketList[socket.id] = { userName, video: true, audio: true };

//     // Set User List
//     io.sockets.in(roomId).clients((err, clients) => {
//       try {
//         const users = [];
//         clients.forEach((client) => {
//           // Add User List
//           users.push({ userId: client, info: socketList[client] });
//         });
//         socket.broadcast.to(roomId).emit("FE-user-join", users);
//         // io.sockets.in(roomId).emit('FE-user-join', users);
//       } catch (e) {
//         io.sockets.in(roomId).emit("FE-error-user-exist", { err: true });
//       }
//     });
//   });

//   socket.on("BE-call-user", ({ userToCall, from, signal }) => {
//     io.to(userToCall).emit("FE-receive-call", {
//       signal,
//       from,
//       info: socketList[socket.id],
//     });
//   });

//   socket.on("BE-accept-call", ({ signal, to }) => {
//     io.to(to).emit("FE-call-accepted", {
//       signal,
//       answerId: socket.id,
//     });
//   });

//   socket.on("BE-send-message", ({ roomId, msg, sender }) => {
//     io.sockets.in(roomId).emit("FE-receive-message", { msg, sender });
//   });

//   socket.on("BE-leave-room", ({ roomId, leaver }) => {
//     delete socketList[socket.id];
//     socket.broadcast
//       .to(roomId)
//       .emit("FE-user-leave", { userId: socket.id, userName: [socket.id] });
//     io.sockets.sockets[socket.id].leave(roomId);
//   });

//   socket.on("BE-toggle-camera-audio", ({ roomId, switchTarget }) => {
//     if (switchTarget === "video") {
//       socketList[socket.id].video = !socketList[socket.id].video;
//     } else {
//       socketList[socket.id].audio = !socketList[socket.id].audio;
//     }
//     socket.broadcast
//       .to(roomId)
//       .emit("FE-toggle-camera", { userId: socket.id, switchTarget });
//   });
// });
// console.log(socketList);

// http.listen(PORT, () => {
//   console.log("Connected : 3001");
// });

// api/socket.js
// import { Server } from "socket.io";

// // Reemplaza la URL con la URL de tu servidor WebSocket real (Heroku, AWS, etc)
// const ioUrl = "https://server-socket-videocall.vercel.app";

// export default function handler(req, res) {
//   if (req.method === "GET") {
//     // Este endpoint podría ser usado para verificar la conexión
//     return res.status(200).json({ success: true });
//   } else if (req.method === "POST") {
//     // Establecer la conexión a un servidor WebSocket externo (ioUrl)
//     const io = new Server(ioUrl, {
//       cors: {
//         origin: "https://client-videocall.vercel.app", // La URL de tu frontend
//         methods: ["GET", "POST"],
//       },
//     });

//     const socket = io.of("/");

//     socket.on("connection", (socket) => {
//       console.log(`New User connected: ${socket.id}`);

//       socket.on("disconnect", () => {
//         socket.disconnect();
//         console.log("User disconnected!");
//       });

//       socket.on("BE-check-user", ({ roomId, userName }) => {
//         let error = false;
//         console.log("BE-check-user", roomId, userName);
//         socket.broadcast.to(roomId).clients((err, clients) => {
//           clients.forEach((client) => {
//             if (socketList[client] == userName) {
//               error = true;
//             }
//           });
//           socket.emit("FE-error-user-exist", { error });
//         });
//       });

//       socket.on("BE-join-room", ({ roomId, userName }) => {
//         console.log("BE-join-room", roomId, userName);
//         socket.join(roomId);
//         socketList[socket.id] = { userName, video: true, audio: true };

//         socket.broadcast.to(roomId).emit("FE-user-join", users);
//       });

//       socket.on("BE-call-user", ({ userToCall, from, signal }) => {
//         io.to(userToCall).emit("FE-receive-call", {
//           signal,
//           from,
//           info: socketList[socket.id],
//         });
//       });

//       socket.on("BE-accept-call", ({ signal, to }) => {
//         io.to(to).emit("FE-call-accepted", {
//           signal,
//           answerId: socket.id,
//         });
//       });

//       socket.on("BE-send-message", ({ roomId, msg, sender }) => {
//         io.sockets.in(roomId).emit("FE-receive-message", { msg, sender });
//       });

//       socket.on("BE-leave-room", ({ roomId, leaver }) => {
//         delete socketList[socket.id];
//         socket.broadcast
//           .to(roomId)
//           .emit("FE-user-leave", { userId: socket.id, userName: [socket.id] });
//         socket.leave(roomId);
//       });

//       socket.on("BE-toggle-camera-audio", ({ roomId, switchTarget }) => {
//         if (switchTarget === "video") {
//           socketList[socket.id].video = !socketList[socket.id].video;
//         } else {
//           socketList[socket.id].audio = !socketList[socket.id].audio;
//         }
//         socket.broadcast
//           .to(roomId)
//           .emit("FE-toggle-camera", { userId: socket.id, switchTarget });
//       });
//     });

//     res.status(200).json({ success: true });
//   }
// }

import express from "express";
import http from "http";
import pkg from "socket.io";
import cors from "cors";

const { Server } = pkg;
const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(
  cors({
    origin: "https://client-videocall.vercel.app",
    methods: ["GET", "POST"],
  })
);

// Create a socket.io server
const io = new Server(server, {
  cors: {
    origin: "https://client-videocall.vercel.app",
    methods: ["GET", "POST"],
  },
});

// Store connected users
const socketList = {};

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`New User connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log("User disconnected!");
  });

  socket.on("BE-check-user", ({ roomId, userName }) => {
    let error = false;
    console.log("BE-check-user", roomId, userName);

    // Get clients in the room
    const clients = io.sockets.adapter.rooms.get(roomId) || new Set();

    // Check if username already exists in the room
    for (const clientId of clients) {
      if (socketList[clientId]?.userName === userName) {
        error = true;
        break;
      }
    }

    socket.emit("FE-error-user-exist", { error });
  });

  socket.on("BE-join-room", ({ roomId, userName }) => {
    console.log("BE-join-room", roomId, userName);
    socket.join(roomId);
    socketList[socket.id] = { userName, video: true, audio: true };

    // Get all users in the room
    const users = {};
    const clients = io.sockets.adapter.rooms.get(roomId) || new Set();

    for (const clientId of clients) {
      if (socketList[clientId]) {
        users[clientId] = socketList[clientId];
      }
    }

    socket.broadcast.to(roomId).emit("FE-user-join", users);
  });

  socket.on("BE-call-user", ({ userToCall, from, signal }) => {
    io.to(userToCall).emit("FE-receive-call", {
      signal,
      from,
      info: socketList[socket.id],
    });
  });

  socket.on("BE-accept-call", ({ signal, to }) => {
    io.to(to).emit("FE-call-accepted", {
      signal,
      answerId: socket.id,
    });
  });

  socket.on("BE-send-message", ({ roomId, msg, sender }) => {
    io.sockets.in(roomId).emit("FE-receive-message", { msg, sender });
  });

  socket.on("BE-leave-room", ({ roomId, leaver }) => {
    delete socketList[socket.id];
    socket.broadcast
      .to(roomId)
      .emit("FE-user-leave", { userId: socket.id, userName: [socket.id] });
    socket.leave(roomId);
  });

  socket.on("BE-toggle-camera-audio", ({ roomId, switchTarget }) => {
    if (switchTarget === "video") {
      socketList[socket.id].video = !socketList[socket.id].video;
    } else {
      socketList[socket.id].audio = !socketList[socket.id].audio;
    }
    socket.broadcast
      .to(roomId)
      .emit("FE-toggle-camera", { userId: socket.id, switchTarget });
  });
});

// Basic routes
app.get("/", (req, res) => {
  res.send("Video call server is running");
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
