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
    .populate("student", "name surname email");

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

  // if >= 2 accepted -> thesis.active
  const acceptedCount = thesis.committee.filter(
    (inv) => inv.status === "accepted"
  ).length;

  if (acceptedCount >= 2) {
    thesis.status = "active";
    thesis.assignedDate = new Date();
  } else {
    thesis.status = "pending"; // <--- γύρνα το πάλι σε pending
  }


  await thesis.save();
  return thesis.populate("committee.professor", "name surname email");
};
const showProfessorTheses = async (professorId,filters={}) => {
    const theses = await Theses.find({
        $or:[
        {professor: professorId},
        { "committee.professor": professorId }
        ]
    })
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
}

const showthesesdetails = async (thesesId,professorId = null) => {
  const theses = await Theses.findById(thesesId)
      .populate('student', 'name surname student_number email')
      // .populate('committee', 'name surname email'); // θα το συμπληρώσεις όταν φτιάξεις το committee
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
          : null, // αν δεν υπάρχει φοιτητής, θα επιστρέφει null
      committee: theses.committee || [], // άδειος πίνακας αν δεν υπάρχει committee
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

  theses.student=null;
  theses.status="pending";
  await theses.save();
  return theses;
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
  showProfessorInvitations,
  showProfessorTheses,
  inviteProfessors,
  respondInvitation,
  showthesesdetails,
  getInvitedProfessors,
  unassignThesisFromStudent
};
   