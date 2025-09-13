import express from 'express';
import studentController from './controller.js';
import { authenticateToken, authorizeRoles } from '../auth/middleware.js';

const router = express.Router();

//Create user (secretary)
router.post('/', authenticateToken, authorizeRoles('secretary'), studentController.createStudentController);

//Get all users (secretary)
router.get('/', authenticateToken, authorizeRoles('secretary'), studentController.getAllStudentsController);

//Get user (secretary)
router.get('/:username', authenticateToken, authorizeRoles('secretary'), studentController.getStudentController);

//Update user (secretary)
router.put('/:username', authenticateToken, authorizeRoles('secretary','student'), studentController.updateStudentController);

//Delete user (secretary)
router.delete('/:username', authenticateToken, authorizeRoles('secretary'), studentController.deleteStudentController);

router.get('/id/:id', authenticateToken, authorizeRoles('secretary'), studentController.getStudentByIdController);

//update my profile
router.patch(
  '/me',
  authenticateToken,
  authorizeRoles('student'),
  studentController.updateOwnProfileController
);

export default router;
