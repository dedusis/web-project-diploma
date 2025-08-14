import express from 'express';
import secretaryController from './controller.js';
import { authenticateToken, authorizeRoles } from '../auth/middleware.js';

const router = express.Router();

//create secretary user
router.post('/', authenticateToken, authorizeRoles('secretary'), secretaryController.createSecretaryController);
//Get all users (secretary)
router.get('/', authenticateToken, authorizeRoles('secretary'), secretaryController.getAllSecretariesController);
//get by username
router.get('/:username', authenticateToken, authorizeRoles('secretary'), secretaryController.getSecretaryController);
//update by username
router.put('/:username', authenticateToken, authorizeRoles('secretary'), secretaryController.updateSecretaryController);
//delete by username
router.delete('/:username', authenticateToken, authorizeRoles('secretary'), secretaryController.deleteSecretaryController);

export default router;