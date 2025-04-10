const mongoose = require('mongoose');
const Schema = require('../models/schema');

exports.getData = async (req, res) => {
    const { id } = req.query; 
    
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ message: 'Invalid user ID' });
    }

    try {
        const user = await Schema.findById(id).select('-password -__v'); 
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.json(user); 
    } catch (error) {
        console.error(error); 
        res.status(500).send({ message: 'Error fetching user data' });
    }
};
