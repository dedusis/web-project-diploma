import thesesService from "./service.js";

const createThesesController = async (req, res) => {
  try {
    const theses = await thesesService.createTheses(req.body);
    res.status(201).json(theses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};;


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

//secr actions
const activateThesisController = async (req, res) => {
  try {
    const updated = await thesesService.activateThesis(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Thesis not found" });
    res.json({ message: "Thesis activated successfully", thesis: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const cancelThesisController = async (req, res) => {
  try {
    const updated = await thesesService.cancelThesis(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Thesis not found" });
    res.json({ message: "Thesis canceled successfully", thesis: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const completeThesisController = async (req, res) => {
  try {
    const updated = await thesesService.completeThesis(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Thesis not found" });
    res.json({ message: "Thesis marked as completed", thesis: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//function for get mythesis
const getMyThesisController = async (req, res) => {
  try {
    const thesis = await thesesService.getThesisByStudent(req.user.id);
    res.json(thesis);
  } catch (err) {
    if (err.message.includes("No thesis")) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// Student invites professors
const inviteProfessorsController = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { emails } = req.body; // prof emails

    const updatedThesis = await thesesService.inviteProfessors(studentId, emails);

    res.json({
      message: "Invitations sent successfully",
      thesis: updatedThesis
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Professor responds to invitation
const respondInvitationController = async (req, res) => {
  try {
    const professorId = req.user.id;
    const thesisId = req.params.id;
    const { response } = req.body; // accepted | rejected

    const updatedThesis = await thesesService.respondInvitation(professorId, thesisId, response);

    res.json({
      message: `Invitation ${response}`,
      thesis: updatedThesis
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
const showProfessorThesesController = async (req, res) => {
    try {
      const theses = await thesesService.showProfessorTheses(req.user.id);
      res.json(theses);
    }
    catch (err) {
      if (err.message === 'No theses assigned to this professor') {
        return res.status(404).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
};
const showThesesDetailsController = async (req, res) => {
  try {
    const professorId= req.user.id;
    const thesesId= req.params.id;
    const theses = await thesesService.showthesesdetails(thesesId,professorId);
    if(!theses) return res.status(404).json({ error: 'Theses not found' });
    res.json(theses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const showProfessorInvitationsController = async (req,res) => {
  try{
    const professorId= req.user.id;
    const invitations= await thesesService.showProfessorInvitations(professorId);
    if(invitations.length===0) 
      return res.status(404).json({error:'No invitations found'});
    res.json(invitations);
  }
  catch(err){
    res.status(500).json({error:err.message});
  }
};

const getInvitedProfessorsController = async (req, res) => {
  try {
    const thesesId = req.params.id;
    const professorId=req.user.id;
    const details = await thesesService.getInvitedProfessors(thesesId,professorId);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const unassignThesisFromStudent = async (req, res) => {
  try {
    const thesesId = req.params.id;
    const updatedThesis = await thesesService.unassignThesisFromStudent(thesesId);
    if (!updatedThesis) {
      return res.status(404).json({ error: 'Theses not found or not assigned to any student' });
    }
    res.json({ message: 'Theses unassigned from student successfully'});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addNotesController = async (req, res) => {
  try {
    const thesesId = req.params.id;
    const professorId = req.user.id;
    const { text } = req.body;
    if(!text || text.trim() === 0) {
      return res.status(400).json({ error: "Note text is required" });
    }
    const note = await thesesService.addNotes(thesesId, professorId, text);
    res.json({ message: 'Note added successfully', note });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

const viewMyNotes = async (req, res) => {
  try {
    const thesesId = req.params.id;
    const professorId = req.user.id;
    const notes = await thesesService.viewMyNotes(thesesId, professorId);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export default {
  createThesesController,
  getAllThesesController,
  getThesesByIdController,
  updateThesesController,
  assignThesesController,
  deleteThesesController,
  activateThesisController,
  cancelThesisController,
  completeThesisController,
  getMyThesisController,
  showProfessorThesesController,
  inviteProfessorsController,
  respondInvitationController,
  showProfessorInvitationsController,
  showThesesDetailsController,
  getInvitedProfessorsController,
  unassignThesisFromStudent,
  addNotesController,
  viewMyNotes
};
