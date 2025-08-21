import studentService from './service.js';

const createStudentController = async (req, res) => {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAllStudentsController = async (req, res) => {
    try {
        const students = await studentService.getAllStudents();
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const getStudentController = async (req, res) => {
  try {
    const student = await studentService.getStudentByUsername(req.params.username);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getStudentByIdController = async (req, res) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateStudentController = async (req, res) => {
  try {
    const username= req.params.username;
    const updates = req.body;
    const updated = await studentService.updateStudentByUsername(req.params.username, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteStudentController = async (req, res) => {
  try {
    const deleted = await studentService.deleteStudentByUsername(req.params.username);
    if (!deleted) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//update my profile
const updateOwnProfileController = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const updatedStudent = await studentService.updateOwnProfile(userId, updates);

    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({
      message: "Profile updated successfully",
      student: updatedStudent
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export default {
  createStudentController,
  getAllStudentsController,
  getStudentController,
  updateStudentController,
  getStudentByIdController,
  deleteStudentController,
  updateOwnProfileController
};
