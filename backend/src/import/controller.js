import fs from 'fs';
import Student from '../student/model.js';
import Professor from '../professor/model.js';
import importLogService from './service.js';
import bcrypt from 'bcrypt';


// --- ΝΕΟ: Import από αρχείο JSON ---
const uploadAndImportData = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const rawData = fs.readFileSync(req.file.path, 'utf8');
    const data = JSON.parse(rawData);

    let studentsCount = 0, professorsCount = 0;

    if (data.students && data.students.length) {
      const studentsWithCredentials = await Promise.all(
        data.students.map(async (student) => {
          const plainPassword = 'pass1234'; 
          const hashedPassword = await bcrypt.hash(plainPassword, 10);
          return {
            ...student,
            username: student.email, 
            password: hashedPassword
          };
        })
      );
      await Student.insertMany(studentsWithCredentials);
      studentsCount = data.students.length;
    }
    if (data.professors && data.professors.length) {
      const professorsWithCredentials = await Promise.all(
        data.professors.map(async (prof) => {
          const plainPassword = 'pass1234';
          const hashedPassword = await bcrypt.hash(plainPassword, 10);
          return {
            ...prof,
            username: prof.email,
            password: hashedPassword
          };
        })
      );
      await Professor.insertMany(professorsWithCredentials);
      professorsCount = data.professors.length;
    }

    // Δημιουργία log
    await importLogService.createImportLog({
      filename: req.file.originalname,
      type: 'mixed',
      description: 'Auto import from JSON file',
      importedBy: req.user.id,
      summary: { students: studentsCount, professors: professorsCount, }
    });

    res.json({
      message: 'Import completed successfully',
      summary: { students: studentsCount, professors: professorsCount, }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//CRUD Import
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
  uploadAndImportData,
  getAllImportLogsController,
  getImportLogByIdController,
  deleteImportLogController
};
