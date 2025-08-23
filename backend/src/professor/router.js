import express from 'express';
import ProfessorController from './controller.js'
import { authenticateToken, authorizeRoles } from '../auth/middleware.js';

const router=express.Router();

//create user (secretary)
router.post('/', authenticateToken, authorizeRoles('secretary'), ProfessorController.createProfessorController);

//Get all users (secretary)
router.get('/', authenticateToken, authorizeRoles('secretary'), ProfessorController.getAllProfessorsController);

//Ger user (secretary)
router.get('/:username', authenticateToken, authorizeRoles('secretary'), ProfessorController.getProfessorController);

//Update user (secretary)
router.put('/:username', authenticateToken, authorizeRoles('secretary'), ProfessorController.updateProfessorController);

//Delete user (secretary)
router.delete('/:username', authenticateToken, authorizeRoles('secretary'), ProfessorController.deleteProfessorController);

router.get('/:username/theses', authenticateToken, authorizeRoles('professor','secretary'), ProfessorController.showProfessorThesesController);

router.get('/:username/theses/:id', authenticateToken, authorizeRoles('professor','secretary'), ProfessorController.showThesesDetailsController);
export default router;