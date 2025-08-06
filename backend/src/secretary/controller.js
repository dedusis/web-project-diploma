import secretaryService from './service.js'

const createSecretaryController = async (req, res) => {
    try {
        const secretary = await secretaryService.createSecretary(req.body);
        res.status(201).json(secretary);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const getSecretaryController = async (req, res) => {
    try {
        const secretary = await secretaryService.getSecretaryByUsername(req.params.username);
        if (!secretary) return res.status(404).json({ error: 'Secretary not found' });
        res.json(secretary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const updateSecretaryController = async (req, res) => {
  try {
    const updated = await secretaryService.updateSecretaryByUsername(req.params.username, req.body);
    if (!updated) return res.status(404).json({ error: 'Secretary not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteSecretaryController = async (req, res) => {
  try {
    const deleted = await secretaryService.deleteSecretaryByUsername(req.params.username);
    if (!deleted) return res.status(404).json({ error: 'Secretary not found' });
    res.json({ message: 'Secretary deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  createSecretaryController,
  getSecretaryController,
  updateSecretaryController,
  deleteSecretaryController
};