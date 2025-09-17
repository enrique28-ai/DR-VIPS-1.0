import express from 'express';
import { protect } from '../middleware/auth.js';
import { getMe, loginUser, registerUser } from '../controllers/authControllers.js';
const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/me", protect, getMe);


export default router;