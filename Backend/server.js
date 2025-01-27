require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectToDatabase= require('./config/database.js'); 
const authRoutes=require('./routes/verify')

const server = express();
server.use(express.json({ limit: '10mb' }));
server.use(cookieParser());
server.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

server.use('/api',authRoutes) ;



const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectToDatabase();
});
