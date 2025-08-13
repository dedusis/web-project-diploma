import importLogService from './service.js';

const createImportLogController = async (req, res) => {
  try {
    const log = await importLogService.createImportLog({
      ...req.body,
      importedBy: req.user.id // Από το token
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAllImportLogsController = async (req, res) => {
  try {
    const logs = await importLogService.getAllImportLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getImportLogByIdController = async (req, res) => {
  try {
    const log = await importLogService.getImportLogById(req.params.id);
    if (!log) return res.status(404).json({ error: 'ImportLog not found' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteImportLogController = async (req, res) => {
  try {
    const deleted = await importLogService.deleteImportLog(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'ImportLog not found' });
    res.json({ message: 'ImportLog deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  createImportLogController,
  getAllImportLogsController,
  getImportLogByIdController,
  deleteImportLogController
};
