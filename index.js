const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "https://client-videocall.vercel.app", // URL de tu cliente en Vercel
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});
const PORT = process.env.PORT || 3001;
const path = require("path");
const cors = require("cors");

let socketList = {};

// Habilitar CORS para todas las rutas
app.use(
  cors({
    origin: "https://client-videocall.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Servir archivos estáticos si es necesario
// app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal para verificar que el servidor está funcionando
app.get("/", (req, res) => {
  res.send("Servidor de videollamadas funcionando correctamente");
});

// Ruta de ping para verificar la conexión
app.get("/ping", (req, res) => {
  res
    .send({
      success: true,
    })
    .status(200);
});

// Socket
io.on("connection", (socket) => {
  console.log(`New User connected: ${socket.id}`);

  socket.on("disconnect", () => {
    delete socketList[socket.id];
    console.log("User disconnected!");
  });

  socket.on("BE-check-user", ({ roomId, userName }) => {
    let error = false;
    console.log("BE-check-user", roomId, userName);
    io.sockets.in(roomId).clients((err, clients) => {
      if (err) {
        console.error("Error checking users:", err);
        return;
      }
      clients.forEach((client) => {
        if (socketList[client] == userName) {
          error = true;
        }
      });
      socket.emit("FE-error-user-exist", { error });
    });
  });

  /**
   * Join Room
   */
  socket.on("BE-join-room", ({ roomId, userName }) => {
    // Socket Join RoomName
    console.log("BE-join-room", roomId, userName);
    socket.join(roomId);
    socketList[socket.id] = { userName, video: true, audio: true };

    // Set User List
    io.sockets.in(roomId).clients((err, clients) => {
      try {
        if (err) {
          console.error("Error getting clients:", err);
          return;
        }
        const users = [];
        clients.forEach((client) => {
          // Add User List
          users.push({ userId: client, info: socketList[client] });
        });
        socket.broadcast.to(roomId).emit("FE-user-join", users);
      } catch (e) {
        console.error("Error in BE-join-room:", e);
        io.sockets.in(roomId).emit("FE-error-user-exist", { err: true });
      }
    });
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

    // Forma segura de hacer que el socket abandone la sala
    if (socket.rooms && socket.rooms[roomId]) {
      socket.leave(roomId);
    } else if (io.sockets.sockets[socket.id]) {
      io.sockets.sockets[socket.id].leave(roomId);
    }
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

http.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
