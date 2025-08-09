import express from 'express';
import secretaryController from './controller.js';

const router = express.Router();

//create secretary user
router.post('/', secretaryController.createSecretaryController);
//get by username
router.get('/:username', secretaryController.getSecretaryController);
//update by username
router.put('/:username', secretaryController.updateSecretaryController);
//delete by username
router.delete('/:username', secretaryController.deleteSecretaryController);

export default router;