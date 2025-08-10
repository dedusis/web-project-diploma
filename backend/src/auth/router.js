import express from 'express';
import authController from './controller.js';

const router = express.Router();

router.post('/login', authController.loginController);

export default router;