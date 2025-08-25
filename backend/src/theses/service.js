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
  setExamDetails
};
