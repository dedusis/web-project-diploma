import thesesService from "./service.js";

const createThesesController = async (req, res) => {
  try {
    const{title, description, status, professor,student} = req.body;

    const thesesData = {
      title,
      description,
      status,
      professor,
    };
    const newThesis = await thesesService.createTheses(thesesData); 
    res.status(201).json(newThesis);
  }
  catch (err) {
    res.status(400).json({ error: err.message });
  }
};


const getAllThesesController = async (req, res) => {
  try {
    const theses = await thesesService.getAllTheses();
    res.json(theses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getThesesByIdController = async (req, res) => {
  try {
    const theses = await thesesService.getThesesById(req.params.id);
    if (!theses) return res.status(404).json({ error: "Theses not found" });
    res.json(theses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateThesesController = async (req, res) => {
  try {
    const updated = await thesesService.updateTheses(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Theses not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteThesesController = async (req, res) => {
  try {
    const deleted = await thesesService.deleteTheses(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Theses not found" });
    res.json({ message: "Theses deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const assignThesesController = async (req, res) => {
    const thesesId = req.params.id; 
    const { studentId } = req.body;
    try {
        const updatedTheses = await thesesService.assignThesesToStudent(thesesId, studentId);
        res.status(200).json(updatedTheses);
    } catch (err) {
    res.status(400).json({ error: err.message });
    }
};
export default {
  createThesesController,
  getAllThesesController,
  getThesesByIdController,
  updateThesesController,
  assignThesesController,
  deleteThesesController,
};
