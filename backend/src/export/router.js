// src/export/router.js
import express from 'express';
import { authenticateToken, authorizeRoles } from '../auth/middleware.js';
import { exportThesesController } from './controller.js';

const router = express.Router();

router.get(
  '/export',
  authenticateToken,
  authorizeRoles('professor', 'secretary'),
  exportThesesController
);

export default router;
