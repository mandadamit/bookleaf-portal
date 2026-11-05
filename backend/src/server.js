
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000;
const socketAuth = require("./middleware/socketAuth");

const startServer = async () => {
  try {
    await connectDB();

    // Create HTTP server
    const httpServer = http.createServer(app);


    // Initialize Socket.IO
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    io.use(socketAuth);

    // Make io accessible inside controllers
    app.set("io", io);

    // Socket connection event
    
    io.on("connection", (socket) => {
      console.log(`${socket.user.role} connected:`, socket.user.userId);

      // Join personal user room
      socket.join(`user:${socket.user.userId}`);

      // Join admin room
      if (socket.user.role === "ADMIN") {
        socket.join("admins");
      }

      // Join a specific ticket room
      socket.on("ticket:join", async (ticketId) => {
        try {
          const Ticket = require("./models/Ticket");

          const ticket = await Ticket.findById(ticketId).select("author");

          if (!ticket) {
            return socket.emit("ticket:error", {
              message: "Ticket not found",
            });
          }

          const isAdmin = socket.user.role === "ADMIN";
          const isAuthor = ticket.author.toString() === socket.user.userId;

          if (!isAdmin && !isAuthor) {
            return socket.emit("ticket:error", {
              message: "Access denied",
            });
          }

          socket.join(`ticket:${ticketId}`);

          socket.emit("ticket:joined", {
            ticketId,
            message: "Joined ticket room successfully",
          });
        } catch (error) {
          socket.emit("ticket:error", {
            message: "Unable to join ticket room",
          });
        }
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });
    });


    httpServer.listen(PORT, () => {
      console.log(`BookLeaf API running on port ${PORT}`);
      console.log("Socket.IO is ready");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
