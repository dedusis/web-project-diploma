import { get } from "http";
import thesesService from "./service.js";

const createThesesController = async (req, res) => {
  try {
    const professorId=req.user.id;
    const filePath=req.file ? req.file.path :null;
    const theses = await thesesService.createTheses(professorId,req.body,filePath);
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

//get theses status = active or status = under_review
const getActiveAndUnderReviewController = async (req, res) => {
  try {
    const { status } = req.query; 
    const theses = await thesesService.getActiveAndUnderReviewTheses(status);
    res.json(theses);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
    const { student_number } = req.body;
    console.log("backend",student_number);
    try {
        const updatedTheses = await thesesService.assignThesesToStudent(thesesId, student_number);
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
    const thesis = await thesesService.completeThesis(req.params.id);
    res.json(thesis);
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
const showProfessorAvailableThesesController = async(req,res) => {
  try {
      const theses = await thesesService.showProfessorAvailableTheses(req.user.id);
      res.json(theses);
    }
    catch (err) {
      if (err.message === 'Δεν υπάρχει θέμα προς ανάθεση.') {
        return res.status(404).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
}
const showProfessorThesesController = async (req, res) => {
    try {
      const {status,role} = req.query;
      const theses = await thesesService.showProfessorTheses(req.user.id,{status,role});
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
const uploadDraftController = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { draftFile, extraLinks } = req.body;

    const updatedThesis = await thesesService.uploadDraft(studentId, { draftFile, extraLinks });

    res.json({
      message: "Draft uploaded successfully",
      thesis: updatedThesis
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Student sets exam details
const setExamDetailsController = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { examDate, examMode, examLocation } = req.body;

    const updatedThesis = await thesesService.setExamDetails(studentId, {
      examDate,
      examMode,
      examLocation
    });

    res.json({
      message: "Exam details set successfully",
      thesis: updatedThesis
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Professor sets grade
const openGradingController = async (req, res) => {
  try {
    const professorId = req.user.id; 
    const thesisId = req.params.id;

    const updatedThesis = await thesesService.openGrading(professorId, thesisId);

    res.json({
      message: "Grading is now open for this thesis",
      thesis: updatedThesis
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Professor sets grade
const setGradeController = async (req, res) => {
  try {
    const professorId = req.user.id;
    const thesisId = req.params.id;
    const { criteria } = req.body; // μόνο τα criteria

    if (
      !criteria ||
      typeof criteria.originality !== "number" ||
      typeof criteria.methodology !== "number" ||
      typeof criteria.presentation !== "number" ||
      typeof criteria.knowledge !== "number"
    ) {
      return res.status(400).json({ error: "All criteria must be numbers" });
    }

    const updatedThesis = await thesesService.setGrade(thesisId, professorId, { criteria });

    res.json({
      message: "Grade submitted successfully",
      thesis: updatedThesis
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//get prof's grades
const getGradesController = async (req, res) => {
  try {
    const professorId = req.user.id;
    const thesisId = req.params.id;

    const grades = await thesesService.getGrades(professorId, thesisId);
    res.json(grades);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//students praktiko
const getPraktikoController = async (req, res) => {
  try {
    const html = await thesesService.getPraktiko(req.user.id);
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Student sets Nimertis link
const setNimertisLinkController = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { nimertis_link } = req.body;

    const updatedThesis = await thesesService.setNimertisLink(studentId, { nimertis_link });

    res.json({
      message: "Nimertis link set successfully",
      thesis: updatedThesis
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// View completed thesis info + exam record
const getCompletedThesisController = async (req, res) => {
  try {
    const thesis = await thesesService.getCompletedThesis(req.params.id);
    res.json(thesis);
  } catch (err) {
    res.status(400).json({ error: err.message });
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

const cancelThesesByProfessorcontroller = async (req, res) => {
  try {
    const thesesId = req.params.id;
    const professorId = req.user.id;
    const {apNumber, apYear} = req.body;
    const updatedTheses = await thesesService.cancelThesesByProfessor(thesesId, professorId,apNumber,apYear);
    res.json({ message: 'Thesis canceled successfully'});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const changeToUnderReviewcontroller = async(req,res) => {
  try{
    const thesesId=req.params.id;
    const professorId=req.user.id;
    const updatedTheses= await thesesService.changeToUnderReview(thesesId,professorId);
    res.json({message:'Thesis status changed to under review'});
  } catch(err){
    res.status(500).json({error:err.message});
  }
};
export default {
  createThesesController,
  getThesesByIdController,
  getActiveAndUnderReviewController,
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
  viewMyNotes,
  cancelThesesByProfessorcontroller,
  changeToUnderReviewcontroller,
  uploadDraftController,
  setExamDetailsController,
  openGradingController,
  setGradeController,
  getGradesController,
  getPraktikoController,
  setNimertisLinkController,
  getCompletedThesisController,
  getAllThesesController,
  showProfessorAvailableThesesController
};
