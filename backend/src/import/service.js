import ImportLog from './model.js';

const createImportLog = async ({ filename, type, importedBy, summary, description }) => {
  const log = new ImportLog({
    filename,
    type,
    importedBy,
    summary,
    description
  });
  return await log.save();
};

const getAllImportLogs = async () => {
  return await ImportLog.find().populate('importedBy', 'username name email');
};

const getImportLogById = async (id) => {
  return await ImportLog.findById(id).populate('importedBy', 'username name email');
};

const deleteImportLog = async (id) => {
  return await ImportLog.findByIdAndDelete(id);
};

export default {
  createImportLog,
  getAllImportLogs,
  getImportLogById,
  deleteImportLog
};
