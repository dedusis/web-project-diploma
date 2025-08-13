import express from 'express';
import importLogController from './controller.js';
import { authenticateToken, authorizeRoles } from '../auth/middleware.js';

const router = express.Router();

// Μόνο η γραμματεία βλέπει τα import logs
router.post('/', authenticateToken, authorizeRoles('secretary'), importLogController.createImportLogController);
router.get('/', authenticateToken, authorizeRoles('secretary'), importLogController.getAllImportLogsController);
router.get('/:id', authenticateToken, authorizeRoles('secretary'), importLogController.getImportLogByIdController);
router.delete('/:id', authenticateToken, authorizeRoles('secretary'), importLogController.deleteImportLogController);

export default router;
