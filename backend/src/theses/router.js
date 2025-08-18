import express from 'express';
import thesesController from './controller.js';
import { authenticateToken, authorizeRoles } from '../auth/middleware.js';

const router = express.Router();

// Create theses (professor ή secretary)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('professor', 'secretary'),
  thesesController.createThesesController
);

// Get all theses (logged in users)
router.get(
  '/',
  authenticateToken,
  thesesController.getAllThesesController
);

// Get theses by id (logged in users)
router.get(
  '/:id',
  authenticateToken,
  thesesController.getThesesByIdController
);

// Update theses (professor ή secretary)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('professor', 'secretary'),
  thesesController.updateThesesController
);

// Delete theses (professor ή secretary)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('professor', 'secretary'),
  thesesController.deleteThesesController
);

router.post(
  '/:id/assign',
  authenticateToken,
  authorizeRoles('professor','secretary'),
  thesesController.assignThesesController // Assign thesis to student (professor ή secretary)
);

export default router;
