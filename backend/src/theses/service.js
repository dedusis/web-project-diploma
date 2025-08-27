import Theses from "./model.js";
import Student from "../student/model.js";
import Professor from "../professor/model.js";
import mongoose from "mongoose";

const createTheses = async (data) => {
  const theses = new Theses(data);
  return await theses.save();
};

const getAllTheses = async () => {
  return await Theses.find();
};

const getThesesById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid thesis ID");
  }
  const thesis = await Theses.findById(id);
  console.log("Thesis Found:", thesis); 
  if (!thesis) {
    throw new Error("Thesis not found");
  }
  return thesis;
};

const updateTheses = async (id, updates) => {
  return await Theses.findByIdAndUpdate(id, updates, { new: true });
};

const deleteTheses = async (id) => {
  return await Theses.findByIdAndDelete(id);
};

const assignThesesToStudent = async (thesesId, studentId) => {

  const theses = await Theses.findById(thesesId);
  if (!theses) {
    throw new Error("Thesis not found");
  }

  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error("Student not found");
  }

  const alreadyAssigned = await Theses.findOne({ student: studentId });
  if (alreadyAssigned) {
    throw new Error("This student already has an assigned thesis");
  }
  if (theses.student) {
    throw new Error("This thesis is already assigned to a student");
  }
  theses.student = studentId;
  theses.status = "pending";
  await theses.save();
  return theses;
};

//secr actions
const activateThesis = async (id, { ap_number, ap_year }) => {
  return await Theses.findByIdAndUpdate(
    id,
    {
      status: "active",
      ap_number,
      ap_year,
    },
    { new: true }
  );
};

const cancelThesis = async (id, { ap_number, ap_year, reason }) => {
  return await Theses.findByIdAndUpdate(
    id,
    {
      status: "canceled",
      ap_number,
      ap_year,
      cancel_reason: reason,
    },
    { new: true }
  );
};

const completeThesis = async (id, { grade, nymerti_link }) => {
  return await Theses.findByIdAndUpdate(
    id,
    {
      status: "completed",
      grade,
      nymerti_link,
    },
    { new: true }
  );
};

//function for get my thesis
const getThesisByStudent = async (studentId) => {
  const thesis = await Theses.findOne({ student: studentId })
    .populate("professor", "name surname email")
    .populate("student", "name surname student_number email");

  if (!thesis) {
    throw new Error("No thesis found for this student");
  }

  // calc days from assign
  const daysSinceAssignment = thesis.assignedDate
    ? Math.floor((Date.now() - thesis.assignedDate) / (1000 * 60 * 60 * 24))
    : null;

  return { ...thesis.toObject(), daysSinceAssignment };
};

//student invites professor
const inviteProfessors = async (studentId, professorEmails) => {
  const thesis = await Theses.findOne({ student: studentId });
  if (!thesis) throw new Error("No thesis found for this student");

  if (thesis.status !== "pending") {
    throw new Error("Committee can only be set while thesis is pending");
  }

  //find prof by email
  const professors = await Professor.find({ email: { $in: professorEmails } });
  if (professors.length === 0) {
    throw new Error("No professors found with these emails");
  }

  professors.forEach((prof) => {
    const existingInvitation = thesis.committee.find(
      (inv) => inv.professor.toString() === prof._id.toString()
    );
    if (existingInvitation) {
      if (existingInvitation.status === "rejected") {
        existingInvitation.status = "pending";
      }
    } else {
      thesis.committee.push({
        professor: prof._id,
        status: "pending"
      });
    }
  });

  await thesis.save();
  return thesis.populate("committee.professor", "name surname email");
};

//prof accept or reject
const respondInvitation = async (professorId, thesisId, response) => {
  const thesis = await Theses.findById(thesisId);
  if (!thesis) throw new Error("Thesis not found");

  const invitation = thesis.committee.find(
    (inv) => inv.professor.toString() === professorId.toString()
  );
  if (!invitation) throw new Error("No invitation found for this professor");

  if (invitation.status === "rejected") {
    throw new Error("This invitation has been rejected and cannot be changed");
  }

  invitation.status = response; // "accepted" or "rejected"

  // if >= 2 accepted -> thesis.active
  const acceptedCount = thesis.committee.filter(
    (inv) => inv.status === "accepted"
  ).length;

  if (acceptedCount >= 2) {
    thesis.status = "active";
    thesis.assignedDate = new Date();
  } else {
    thesis.status = "pending"; 
  }


  await thesis.save();
  return thesis.populate("committee.professor", "name surname email");
};

const uploadDraft = async (studentId, { draftFile, extraLinks }) => {
  const thesis = await Theses.findOne({ student: studentId });
  if (!thesis) throw new Error("No thesis found for this student");

  if (thesis.status !== "active") {
    throw new Error("Draft can only be uploaded when thesis is active");
  }

  thesis.draftFile = draftFile || thesis.draftFile;
  thesis.extraLinks = extraLinks || thesis.extraLinks;
  thesis.status = "under_review"; 

  await thesis.save();
  return thesis;
};

// Student sets exam details
const setExamDetails = async (studentId, { examDate, examMode, examLocation }) => {
  const thesis = await Theses.findOne({ student: studentId });
  if (!thesis) throw new Error("No thesis found for this student");

  if (thesis.status !== "under_review") {
    throw new Error("Exam details can only be set when thesis is under review");
  }

  thesis.examDate = examDate;
  thesis.examMode = examMode;
  thesis.examLocation = examLocation;

  await thesis.save();
  return thesis;
};

//supervisor opens grading
const openGrading = async (professorId, thesisId) => {
  const thesis = await Theses.findById(thesisId);
  if (!thesis) throw new Error("Thesis not found");

  // Only supervisor have access
  if (thesis.professor.toString() !== professorId.toString()) {
    throw new Error("Only the supervisor can open grading");
  }

  if (thesis.gradingOpen) {
    throw new Error("Grading is already open");
  }

  thesis.gradingOpen = true;
  await thesis.save();

  return thesis;
};

// Professor sets grade
const setGrade = async (id, professorId, gradeData) => {
  const thesis = await Theses.findById(id)
    .populate("professor", "name surname email")
    .populate("committee.professor", "name surname email")
    .populate("student", "name surname student_number email");

  if (!thesis) throw new Error("Thesis not found");
  if (!thesis.gradingOpen) throw new Error("Grading is not open for this thesis");

  // Supervisor or comittee prof
  const isSupervisor = thesis.professor._id.toString() === professorId.toString();
  const isCommittee = thesis.committee.some(
    (inv) => inv.professor._id.toString() === professorId.toString()
  );
  if (!isSupervisor && !isCommittee) {
    throw new Error("You are not part of this committee");
  }

  // check for existing grade
  const alreadyGraded = thesis.grades.some(
    (g) => g.professor.toString() === professorId.toString()
  );
  if (alreadyGraded) throw new Error("Professor has already graded this thesis");

  // calc total = MO criteria
  const { originality, methodology, presentation, knowledge } = gradeData.criteria;
  const total =
    (originality + methodology + presentation + knowledge) / 4;

  // save grade
  thesis.grades.push({
    professor: professorId,
    criteria: gradeData.criteria,
    total: Number(total.toFixed(2)),
  });

  if (thesis.grades.length === 3) {
    const totals = thesis.grades.map((g) => g.total);
    const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
    thesis.finalGrade = Number(avg.toFixed(2));
  }

  await thesis.save();
  return thesis;
};

//get prof's grades
const getGrades = async (professorId, thesisId) => {
  const thesis = await Theses.findById(thesisId)
    .populate("grades.professor", "name surname email")
    .populate("professor", "name surname email")
    .populate("committee.professor", "name surname email");

  if (!thesis) throw new Error("Thesis not found");

  const isSupervisor = thesis.professor._id.toString() === professorId.toString();
  const isCommittee = thesis.committee.some(
    (inv) => inv.professor && inv.professor._id.toString() === professorId.toString()
  );
  if (!isSupervisor && !isCommittee) {
    throw new Error("You are not part of this committee");
  }

  return {
    thesisId: thesis._id,
    grades: thesis.grades,
    finalGrade: thesis.finalGrade || null
  };
};

// Student gets praktiko (HTML)
const getPraktiko = async (studentId) => {
  const thesis = await Theses.findOne({ student: studentId })
    .populate("professor", "name surname email")
    .populate("committee.professor", "name surname email")
    .populate("student", "name surname email student_number");

  if (!thesis) throw new Error("No thesis found for this student");
  if (thesis.status !== "completed") {
    throw new Error("Praktiko is available only after thesis is completed");
  }

  let html = `
    <html>
      <head>
        <title>Πρακτικό Εξέτασης - ${thesis.title}</title>
      </head>
      <body>
        <h1>Πρακτικό Εξέτασης</h1>
        <h2>Τίτλος: ${thesis.title}</h2>
        <p><b>Φοιτητής:</b> ${thesis.student.name} ${thesis.student.surname} (${thesis.student.email})</p>
        <p><b>Επιβλέπων:</b> ${thesis.professor.name} ${thesis.professor.surname} (${thesis.professor.email})</p>
        <p><b>Ημερομηνία Εξέτασης:</b> ${thesis.examDate ? thesis.examDate.toLocaleString() : "-"}</p>

        <h3>Βαθμολογίες</h3>
        <ul>
  `;

  thesis.grades.forEach(g => {
    html += `
      <li>
        <b>${g.professor.name} ${g.professor.surname}</b> 
        (Σύνολο: ${g.total})<br>
        - Originality: ${g.criteria.originality}<br>
        - Methodology: ${g.criteria.methodology}<br>
        - Presentation: ${g.criteria.presentation}<br>
        - Knowledge: ${g.criteria.knowledge}
      </li>
    `;
  });

  html += `
        </ul>
        <h2>Τελικός Βαθμός: ${thesis.finalGrade}</h2>
      </body>
    </html>
  `;

  return html;
};

// Student adds Nimertis link
const setNimertisLink = async (studentId, { nimertis_link }) => {
  const thesis = await Theses.findOne({ student: studentId });
  if (!thesis) throw new Error("No thesis found for this student");

  if (thesis.status !== "completed") {
    throw new Error("You can only set the Nimertis link after completion");
  }

  thesis.nimertis_link = nimertis_link;
  thesis.status = "completed";
  await thesis.save();

  return thesis;
};

// View completed thesis info + exam record
const getCompletedThesis = async (id) => {
  const thesis = await Theses.findById(id)
    .populate("professor", "name surname email")
    .populate("student", "name surname email")
    .populate("committee.professor", "name surname email");

  if (!thesis) throw new Error("Thesis not found");
  if (thesis.status !== "completed") {
    throw new Error("Thesis is not completed yet");
  }

  return thesis; 
};

export default {
  createTheses,
  getAllTheses,
  getThesesById,
  updateTheses,
  assignThesesToStudent,
  deleteTheses,
  activateThesis,
  cancelThesis,
  completeThesis,
  getThesisByStudent,
  inviteProfessors,
  respondInvitation,
  uploadDraft,
  setExamDetails,
  openGrading,
  setGrade,
  getGrades,
  getPraktiko,
  setNimertisLink,
  getCompletedThesis
};
