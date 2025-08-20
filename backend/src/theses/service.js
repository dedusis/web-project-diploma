import Theses from "./model.js";
import Student from "../student/model.js";
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
};
