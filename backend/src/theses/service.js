import Theses from "./model.js";

const createTheses = async (data) => {
  const theses = new Theses(data);
  return await theses.save();
};

const getAllTheses = async () => {
  return await Theses.find();
};

const getThesesById = async (id) => {
  return await Theses.findById(id);
};

const updateTheses = async (id, updates) => {
  return await Theses.findByIdAndUpdate(id, updates, { new: true });
};

const deleteTheses = async (id) => {
  return await Theses.findByIdAndDelete(id);
};

export default {
  createTheses,
  getAllTheses,
  getThesesById,
  updateTheses,
  deleteTheses,
};
