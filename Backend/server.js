require('dotenv').config();
const express = require('express');
const cors = require('cors');
const databaseConnect = require('./config/database'); 

const server = express();
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('MONGO_URI:', process.env.connect_string);
server.use(cors());
server.use(express.json());
// Use routes
server.get('/', (req, res) => res.send('Server is running'));
server.use('/api/verify', require('./routes/verify'));



const port = process.env.PORT || 8082;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
