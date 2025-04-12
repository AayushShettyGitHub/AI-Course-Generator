const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const connectToDatabase = require("./config/database.js");
const authRoutes = require("./routes/auth");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

const publish = require("./Controller/publish")(io);
const routesWithSocket = require("./routes/verify")(io);

console.log("Routes with Socket:", routesWithSocket); 

app.use("/api", routesWithSocket);
app.use("/auth", authRoutes);

app.post("/api/courses/add", publish.publishCourse);
app.get("/api/courses/others", publish.getCoursesByOtherUsers);
app.get("/api/courses/mine", publish.getCoursesByCurrentUser);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectToDatabase();
});
