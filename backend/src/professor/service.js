import bcrypt from 'bcrypt';
import Professor from './model.js';
import {error} from 'console';
import Theses from '../theses/model.js';


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

const getAllProfessors = async () => {
    return await Professor.find().select('-password');
};

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

const showProfessorTheses = async (username,filters={}) => {
    const professor = await Professor.findOne({ username });
    if (!professor) {
        throw new Error('Professor not found');
    }
    const theses = await Theses.find({professor: professor._id});
    if (!theses || theses.length === 0) {
        throw new Error('No theses assigned to this professor');
    }
    
    const query = {professor: professor._id};

    if(filters.status){
        query.status = filters.status;
    }

    if (filters.role){
        query.role = filters.role;
    }
    return theses;// πρεπει να το συμπληρωσω για την τριμελη επιτροπή
}

const showthesesdetails = async (thesesId) => {
    const theses = await Theses.findById(thesesId)
        .populate('student', 'name surname student_number email')
        // .populate('committee', 'name surname email'); // θα το συμπληρώσεις όταν φτιάξεις το committee
        .lean()
        .exec();

    if (!theses) {
        throw new Error('Thesis not found');
    }

    return {
        id: theses._id,
        title: theses.title,
        description: theses.description,
        status: theses.status,
        statusHistory: theses.statusHistory,
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


export default {
    createProfessor,
    getAllProfessors,
    deleteProfessorByUsername,
    updateProfessorByUsername,
    getProfessorByUsername,
    showProfessorTheses,
    showthesesdetails
};

