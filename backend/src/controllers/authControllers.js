import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"});
};

export const registerUser = async (req, res) => {
    const {username, email, password} = req.body;

    try {
        if (!username || !email || !password){
            return res.status(400).json({error: "All fields are required"});
        }
        const userExists = await User.findOne({email});
        if (userExists) {
            return res.status(400).json({error: "User already exists"});
        }
        const user = await User.create({
            username,
            email,
            password
        });
        const token = generateToken(user._id);
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token
        });
    } catch(error){
        res.status(500).json({error:"Server error"});
    }
};

export const loginUser = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.findOne({email});
        if(!user || !(await user.matchPassword(password))){
            return res.status(401).json({error: "Invalid credentials"})
        }
        const token = generateToken(user._id);
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token
        });
    } catch (error) {
        res.status(500).json({error: "Server error"});
    }
};

export const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

