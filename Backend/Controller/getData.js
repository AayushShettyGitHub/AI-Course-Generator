const mongoose = require('mongoose');
const Schema = require('../models/schema');

exports.getData = async (req, res) => {
    const { id } = req.query;  // Get id from query params (assumed to be MongoDB ObjectId)
    
    // Ensure that the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ message: 'Invalid user ID' });
    }

    try {
        const user = await Schema.findById(id);  // Use findById to search by MongoDB ObjectId
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.json(user);  // Return the user data
    } catch (error) {
        console.error(error);  // Log error to help debugging
        res.status(500).send({ message: 'Error fetching user data' });
    }
};
