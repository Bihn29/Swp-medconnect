import express from "express"
import userModel from '../models/user.model.js';

const Route = express.Router();
// parse json

// mount
Route.get('/api/users', async (req, res) => {
    const users = await userModel.find()
    return res.status(200).json(users);
});


export default  Route;
