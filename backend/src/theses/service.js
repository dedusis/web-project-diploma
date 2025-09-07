import Theses from "./model.js";
import Student from "../student/model.js";
import Professor from "../professor/model.js";
import mongoose from "mongoose";

const createTheses = async (professorId,data,filePath) => {
  const theses = new Theses({
    professor:professorId,
    description:data.description,
    title:data.title,
    attachment:filePath || null
  });
  return await theses.save();
};
const showProfessorAvailableTheses = async(professorId)=>{
  const theses =await Theses.find({
    professor: professorId,
    student: null
  }).select("title description status createdAt");
  if (!theses || theses.length === 0) {
    throw new Error("Δεν υπάρχει θέμα προς ανάθεση.");
  }
  return theses;
}
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

// Secretary: get theses with status = active or under_review (optional filter by status)
const getActiveAndUnderReviewTheses = async (status) => {
  let query = { 
    $or: [
      { status: { $in: ["active", "under_review"] } },
      { readyForActivation: true }
    ]
  };

  if (status && ["active", "under_review", "readyForActivation"].includes(status)) {
    if (status === "readyForActivation") {
      query = { readyForActivation: true };
    } else {
      query = { status };
    }
  }


  const theses = await Theses.find(query)
    .populate("professor", "name surname email")
    .populate("student", "name surname email student_number")
    .populate("committee.professor", "name surname email");

  return theses.map(t => {
    const daysSinceAssignment = t.assignedDate
      ? Math.floor((Date.now() - t.assignedDate) / (1000 * 60 * 60 * 24))
      : null;

    return { ...t.toObject(), daysSinceAssignment };
  });
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
  const thesis = await Theses.findById(id);
  if (!thesis) throw new Error("Thesis not found");

  if (!thesis.readyForActivation) {
    throw new Error("Thesis is not ready for activation. Committee not complete.");
  }

  thesis.status = "active";
  thesis.ap_number = ap_number;
  thesis.ap_year = ap_year;
  thesis.acceptedAt= new Date();
  thesis.readyForActivation = false; // reset

  await thesis.save();
  return thesis;
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

const completeThesis = async (id) => {
  const thesis = await Theses.findById(id);
  if (!thesis) throw new Error("Thesis not found");

  if (!thesis.finalGrade) {
    throw new Error("Final grade is missing");
  }
  if (!thesis.nimertis_link) {
    throw new Error("Nimertis link is missing");
  }

  thesis.status = "completed";
  await thesis.save();
  return thesis;
};

//function for get my thesis
const getThesisByStudent = async (studentId) => {
  const thesis = await Theses.findOne({ student: studentId })
    select("-notes")
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

    if (prof._id.toString() === thesis.professor.toString()) {
      throw new Error(`Professor ${prof.email} is the supervisor and cannot be invited to the committee`);
    }

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

  if(response ==="accepted"){
    invitation.status = "accepted";
    invitation.acceptedAt = new Date();
    invitation.rejectedAt = null; 
  } else if (response === "rejected") {
    invitation.status = "rejected";
    invitation.rejectedAt = new Date();
    invitation.acceptedAt = null;}
    else {
      throw new Error("Invalid response. Must be 'accepted' or 'rejected'");
  }

  // if >= 2 accepted -> is ready for activation
  const acceptedCount = thesis.committee.filter(
    (inv) => inv.status === "accepted"
  ).length;

  if (acceptedCount >= 2) {
    thesis.readyForActivation = true; 
    thesis.assignedDate = new Date();
    thesis.committee.forEach((inv) => {
      if (inv.status === "pending") {
        inv.status = "rejected";
      }
    });
  } else {
    thesis.readyForActivation = false; 
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
  //thesis.status = "completed"; (gets completed automatically)
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

const showProfessorTheses = async (professorId,filters={}) => {
    const theses = await Theses.find({
        $or:[
        {professor: professorId},
        { "committee.professor": professorId }
        ]
    })
    .select("-notes -statusHistory -__v") 
    .populate("student", "name surname student_number email")
    if (!theses || theses.length === 0) {
        throw new Error('No theses assigned to this professor');
    }
    
    const query = {professor: professorId};

    if(filters.status){
        query.status = filters.status;
    }

    if (filters.role){
        query.role = filters.role;
    }
    return theses;
};

const showthesesdetails = async (thesesId,professorId = null) => {
  const theses = await Theses.findById(thesesId)
      .populate('student', 'name surname student_number email')
      .populate('committee', 'name surname email')
      .lean()
      .exec();

  if (!theses) {
      throw new Error('Thesis not found');
  }
  if (professorId)
  { const isAssigned =
          theses.professor?._id.toString() === professorId ||
          (theses.committee?.some(c => c.professor._id.toString() === professorId));

    if (!isAssigned) {
      const err = new Error('Unauthorized to view this thesis');
      err.status = 403;
      throw err;
    }
  }
  return {
      id: theses._id,
      title: theses.title,
      description: theses.description,
      status: theses.status,
      statusHistory: theses.statusHistory,
      supervisor: theses.professor,
      student: theses.student
          ? {
              name: theses.student.name,
              surname: theses.student.surname,
              student_number: theses.student.student_number,
              email: theses.student.email,
            }
          : null, 
      committee: theses.committee || [], 
  };
};
const showProfessorInvitations = async (professorId) => {
  const theses = await Theses.find({ "committee.professor": professorId })
    .populate("student", "name surname student_number email")
    .populate("committee.professor", "name surname email");

  return theses.flatMap(thesis =>
    thesis.committee
      .filter(inv => inv.professor._id.toString() === professorId.toString() && inv.status === "pending")
      .map(inv => ({
        thesisId: thesis._id,
        title: thesis.title,
        studentName: thesis.student.name,
        studentSurname: thesis.student.surname,
        studentNumber: thesis.student.student_number,
        invitationStatus: inv.status
      }))
  );
};

const getInvitedProfessors = async (thesisId,professorId ) => {
  const theses = await Theses.findById(thesisId)
    .populate("committee.professor", "name surname email")
    .lean()
    .exec();
  if (!theses) {
    throw new Error("Thesis not found");
  }
  const isAuthorized =
    theses.professor?._id.toString() === professorId ||
    (theses.committee?.some(c => c.professor._id.toString() === professorId));

  if (!isAuthorized) {
    const err = new Error("Unauthorized to view this theses details");
    err.status = 403;
    throw err;
  }

  return {
    thesesId: theses._id,
    title: theses.title,
    committee: theses.committee?.map(c => ({
      professor: {
        id: c.professor._id,
        name: c.professor.name,
        surname: c.professor.surname,
        email: c.professor.email,
        username: c.professor.username
      },
      invitedAt: c.invitedAt,
      acceptedAt: c.acceptedAt,
      rejectedAt: c.rejectedAt,
      status: c.status   
    })) || []
  };
};

const unassignThesisFromStudent = async (thesesId) => {
  const theses = await Theses.findById(thesesId);
  if (!theses) {
    throw new Error("Thesis not found");
  }

  const studentId = theses.student;
  if (!studentId) {
    throw new Error("This thesis is not assigned to any student");
  }
  const isAuthorized =
  theses.professor?._id.toString() === professorId ||
  (theses.committee?.some(c => c.professor._id.toString() === professorId && c.status === "accepted"));

  if (!isAuthorized) {
    const err = new Error("Unauthorized to unassign from this theses");
    err.status = 403;
    throw err;
  }
  if (theses.status !== "pending") {
    throw new Error("Can only unassign theses with status 'pending'");
  }
  theses.student=null;
  theses.status="pending";
  await theses.save();
  return theses;
};

const addNotes = async (thesesId,professorId,text ) => {
  const theses = await Theses.findById(thesesId);
  if (!theses) {
    throw new Error("Thesis not found");
  }
  const isAuthorized =
    theses.professor?.toString() === professorId ||
    theses.committee?.some((c) => {
      const committeeProfId = c.professor._id
        ? c.professor._id.toString() 
        : c.professor.toString();    
      return committeeProfId === professorId && c.status === "accepted";
    });

  if (!isAuthorized) {
    const err = new Error("Unauthorized to add notes to this thesis");
    err.status = 403;
    throw err;
  }
  if (theses.status !== "active" && theses.status !== "under review") {
    throw new Error("Can only add notes to theses with status 'active' or 'under review'");
  }
  const newNote = {
    text,
    professor: professorId,
  };

  theses.notes.push(newNote);
  await theses.save();
};

const viewMyNotes = async (thesesId,professorId) => {
  const theses = await Theses.findById(thesesId).populate('notes.professor', 'name surname email');
  if (!theses) {
    throw new Error("Thesis not found");
  }
  const isAuthorized =
    theses.professor?.toString() === professorId ||
    theses.committee?.some((c) => {
      const committeeProfId = c.professor._id
        ? c.professor._id.toString() 
        : c.professor.toString();    
      return committeeProfId === professorId && c.status === "accepted";
    });

  if (!isAuthorized) {
    const err = new Error("Unauthorized to view notes of this thesis");
    err.status = 403;
    throw err;
  }

  const mynotes = theses.notes.filter(note => note.professor._id.toString() === professorId);
  if (mynotes.length === 0) {
    throw new Error("No notes found for this professor on this thesis");
  }

  return mynotes.map(note => ({
    text: note.text,
    date: note.createdAt
  }));
};

const cancelThesesByProfessor = async(thesisid,professorId,apNumber,apYear) => {
  const theses = await Theses.findById(thesisid);
  if (!theses) {
    throw new Error("Thesis not found");
  }

  

  if (theses.professor.toString() !== professorId) {
    throw new Error("Only the supervising professor can cancel this thesis");
  }
  if (theses.status!== "active") {
    throw new Error("Only active theses can be canceled by the professor");
  }
  const twoYears = new Date(theses.activatedAt);
  twoYears.setFullYear(twoYears.getFullYear() + 2);
  if (new Date() < twoYears) {
    throw new Error("Thesis can only be canceled after 2 years from the assigned date");
  }
  theses.status = "cancelled";
  theses.cancel_reason = 'Απο διδάσκοντα';
  theses.ap_number = apNumber;
  theses.ap_year = apYear;
  await theses.save();
}

const changeToUnderReview = async(thesesId,professorId) => {
  const theses = await Theses.findById(thesesId);
  const professor = await Professor.findById(professorId);
  if (!theses) {
    throw new Error("Thesis not found");
  }

  if (theses.professor.toString() !== professorId) {
    throw new Error("Only the supervising professor can change the status to under review");
  };
  if(theses.status === "under_review"){
    throw new Error("Thesis is already under review");
  }
  if (theses.status !== "active") {
    throw new Error("Thesis status must be 'active' to change to 'under review'");
  };
  theses.status = "under_review";
  await theses.save();
}
export default {
  createTheses,
  getThesesById,
  getActiveAndUnderReviewTheses,
  updateTheses,
  assignThesesToStudent,
  deleteTheses,
  activateThesis,
  cancelThesis,
  completeThesis,
  getThesisByStudent,
  showProfessorInvitations,
  showProfessorTheses,
  inviteProfessors,
  respondInvitation,
  uploadDraft,
  setExamDetails,
  openGrading,
  setGrade,
  getGrades,
  getPraktiko,
  setNimertisLink,
  getCompletedThesis,
  showthesesdetails,
  getInvitedProfessors,
  unassignThesisFromStudent,
  addNotes,
  viewMyNotes,
  cancelThesesByProfessor,
  changeToUnderReview,
  showProfessorAvailableTheses
};
   