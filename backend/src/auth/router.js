import express from 'express';
import authController from './controller.js';
import { authenticateToken } from './middleware.js';

const router = express.Router();

router.post('/login', authController.loginController);
router.get('/me', authenticateToken, authController.GetProfileController);

export default router;