require('dotenv').config();
const express = require("express");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const connectToDatabase = require("./config/database.js");
const authRoutes = require("./routes/auth");
const verifyRoutes = require("./routes/verify");

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : ["http://localhost:5173"];

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));


app.use("/api", verifyRoutes);

const publishRoutes = require("./routes/publishRoutes")(io);
app.use("/api", publishRoutes);

app.use("/auth", authRoutes);

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const port = process.env.PORT || 8082;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectToDatabase();
});

module.exports = app;
