import express from 'express';
import studentController from './controller.js';

const router = express.Router();

router.post('/', studentController.createStudentController);
router.get('/:username', studentController.getStudentController);
router.put('/:username', studentController.updateStudentController);
router.delete('/:username', studentController.deleteStudentController);

export default router;
