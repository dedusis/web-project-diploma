import express from 'express';
import importLogController from './controller.js';
import { authenticateToken, authorizeRoles } from '../auth/middleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// --- Import από αρχείο JSON ---
router.post(
  '/upload',
  authenticateToken,
  authorizeRoles('secretary'),
  upload.single('file'),
  importLogController.uploadAndImportData
);

// --- CRUD για logs ---
router.get('/', authenticateToken, authorizeRoles('secretary'), importLogController.getAllImportLogsController);
router.get('/:id', authenticateToken, authorizeRoles('secretary'), importLogController.getImportLogByIdController);
router.delete('/:id', authenticateToken, authorizeRoles('secretary'), importLogController.deleteImportLogController);

export default router;
