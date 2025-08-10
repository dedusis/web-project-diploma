import bcrypt from 'bcrypt';
import Professor from './model.js';
import {error} from 'console';

const createProfessor = async(data) => {
    const existing=await Professor.findOne({username:data.username});
    if(existing){
        throw new Error('Professor already exists');
    }


    const newProfessor = new Professor({
        username: data.username,
        password: data.password, 
        name: data.name,
        surname: data.surname, 
        topic: data.topic,     
        landline: data.landline, 
        mobile: data.mobile,   
        email: data.email,
        department: data.department,
        university: data.university,
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

