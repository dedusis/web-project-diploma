import bcrypt from 'bcrypt';
import Professor from './model.js';
import {error} from 'console';

const createProfessor = async(data) => {
    const existing=await Professor.findOne({username:data.username});
    if(existing){
        throw new Error('O καθηγητής είναι ήδη εγγεγραμένος στο σύστημα!');
    }

    const hashedPassword = await bcrypt.hash(data.password,10);

    const newProfessor = new Professor({
        username: data.username,
        password: hashedPassword, // Use hashed password
        name: data.name,
        surname: data.surname, // Add missing fields
        topic: data.topic,     // Add missing fields
        landline: data.landline, // Add missing fields
        mobile: data.mobile,   // Add missing fields
        email: data.email,
        department: data.department,
    });

    return await newProfessor.save();
}

const getProfessorByUsername = async (username) =>
{
    return await Professor.findOne({username});

}

const updateProfessorByUsername = async(username,updates)=> {
    if (updates.password){
        updates.password = await bcrypt.hash(updates.password,10);
    }
    return await Professor.findOneAndUpdate({username},updates,{new:true});
};

const deleteProfessorByUsername = async(username)=>{
    return await Professor.findOneAndDelete({username});

};

export default {
    createProfessor,
    deleteProfessorByUsername,
    updateProfessorByUsername,
    getProfessorByUsername
};

