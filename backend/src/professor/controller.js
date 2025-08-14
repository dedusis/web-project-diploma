import professorService from './service.js'

const createProfessorController = async (req,res) => {
    try{
        const Professor = await professorService.createProfessor(req.body);
        res.status(201).json(Professor);
    }
    catch(err){
        res.status(400).json({error:err.message});
    }
}

const getAllProfessorsController = async (req, res) => {
    try {
        const professors = await professorService.getAllProfessors();
        res.json(professors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getProfessorController = async (req, res) => {
    try {
        const Professor = await professorService.getProfessorByUsername(req.params.username);
        if (!Professor) return res.status(404).json({ error: 'Professor not found' });
        res.json(Professor);
    } catch (err) { 
        res.status(500).json({ error: err.message });
    }
};

const updateProfessorController = async (req, res) => {
    try {
      const updated = await professorService.updateProfessorByUsername(req.params.username, req.body);
      if (!updated) return res.status(404).json({ error: 'Professor not found' });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  const deleteProfessorController = async (req, res) => {
    try {
      const deleted = await professorService.deleteProfessorByUsername(req.params.username);
      if (!deleted) return res.status(404).json({ error: 'Professor not found' });
      res.json({ message: 'Professor deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  export default{
    createProfessorController,
    getAllProfessorsController,
    deleteProfessorController,
    getProfessorController,
    updateProfessorController
  }