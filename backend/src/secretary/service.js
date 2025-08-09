import bcrypt from 'bcrypt';
import Secretary from './model.js';

const createSecretary = async (data) => {
    const existing = await Secretary.findOne({ username: data.username });
    if (existing) {
        throw new Error('User name already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newSecretary = new Secretary({
        username: data.username,
        password: hashedPassword,
        name: data.name,
        email: data.email,
        department: data.department
    });

    return await newSecretary.save();
}

const getSecretaryByUsername = async (username) => {
    return await Secretary.findOne({ username }).populate('createdImports');
}

const updateSecretaryByUsername = async (username, updates) => {
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }
  return await Secretary.findOneAndUpdate({ username }, updates, { new: true });
};

const deleteSecretaryByUsername = async (username) => {
  return await Secretary.findOneAndDelete({ username });
};

export default {
  createSecretary,
  getSecretaryByUsername,
  updateSecretaryByUsername,
  deleteSecretaryByUsername
};