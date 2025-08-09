import express from 'express';
import ProfessorController from './controller.js'

const router=express.Router();

router.post('/', ProfessorController.createProfessorController);
router.get('/:username', ProfessorController.getProfessorController);
router.put('/:username', ProfessorController.updateProfessorController);
router.delete('/:username', ProfessorController.deleteProfessorController);

export default router;