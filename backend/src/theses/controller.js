import thesesService from "./service.js";

const createThesesController = async (req, res) => {
  try {
    const theses = await thesesService.createTheses(req.body);
    res.status(201).json(theses);
  } catch (err) {
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

export default {
  createThesesController,
  getAllThesesController,
  getThesesByIdController,
  updateThesesController,
  deleteThesesController,
};
