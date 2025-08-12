import express from 'express';
import ProfessorController from './controller.js'
import { authenticateToken, authorizeRoles } from '../auth/middleware.js';

const router=express.Router();

//create user (secretary)
router.post('/', authenticateToken, authorizeRoles('secretary'), ProfessorController.createProfessorController);

//Ger user (secretary)
router.get('/:username', authenticateToken, authorizeRoles('secretary'), ProfessorController.getProfessorController);

//Update user (secretary)
router.put('/:username', authenticateToken, authorizeRoles('secretary'), ProfessorController.updateProfessorController);

//Delete user (secretary)
router.delete('/:username', authenticateToken, authorizeRoles('secretary'), ProfessorController.deleteProfessorController);

export default router;