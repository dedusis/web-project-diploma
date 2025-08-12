import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Student from '../student/model.js';
import Professor from '../professor/model.js';
import Secretary from '../secretary/model.js';

const login = async (username, password) => {
    let user = await Student.findOne({ username });
    let role = null;

    if (user) {
        role = 'student';
    } else {
        user = await Professor.findOne({ username });
        if (user) {
            role = 'professor';
        } else {
            user = await Secretary.findOne({ username });
            if (user) {
                role = 'secretary';
            }
        }
    }

    if (!user) {
        throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid password');
    }

    const token = jwt.sign(
        {
            id: user._id,
            username: user.username,
            role
        },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return { role, user, token };
}

const getProfile = async (role, username) => {
    let user;

    if (role === 'student') {
        user = await Student.findOne({ username }).select('-password');
    } else if (role === 'professor') {
        user = await Professor.findOne({ username }).select('-password');
    } else if (role === 'secretary') {
        user = await Secretary.findOne({ username }).select('-password');
    }

    return user;
}

export default { login, getProfile };