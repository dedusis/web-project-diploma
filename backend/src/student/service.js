import bcrypt from 'bcrypt';
import Student from './model.js';

const createStudent = async (data) => {
  const existing = await Student.findOne({ username: data.username });
  if (existing) {
    throw new Error('Username already exists');
  }


  const newStudent = new Student({
    username: data.username,
    password: data.password,
    name: data.name,
    surname: data.surname,
    student_number: data.student_number,
    street: data.street,
    number: data.number,
    city: data.city,
    postcode: data.postcode,
    father_name: data.father_name,
    landline_telephone: data.landline_telephone,
    mobile_telephone: data.mobile_telephone,
    email: data.email
  });

  return await newStudent.save();
};

const getAllStudents = async () => {
    return await Student.find().select('-password');
};


const getStudentByUsername = async (username) => {
  return await Student.findOne({ username });
};

const updateStudentByUsername = async (username, updates) => {
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }
  return await Student.findOneAndUpdate({ username }, updates, { new: true });
};

const deleteStudentByUsername = async (username) => {
  return await Student.findOneAndDelete({ username });
};

export default {
  createStudent,
  getAllStudents,
  getStudentByUsername,
  updateStudentByUsername,
  deleteStudentByUsername
};
