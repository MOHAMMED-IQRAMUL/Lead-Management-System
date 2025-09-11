import express from 'express';
import { register, login, logout } from '../controllers/Auth.controller.js';
import { getCurrentUser } from '../controllers/User.controller.js';
import { authMiddleware } from '../middlewares/Auth.middleware.js';

const router = express.Router();

router.post('/register', register); // 201
router.post('/login', login);       // 200
router.post('/logout', logout);     // 200

router.get('/me', authMiddleware, getCurrentUser); // 200 or 401

export default router;
