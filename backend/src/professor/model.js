import mongoose, { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const ProfessorSchema=new Schema({
name:{type:String,required:true},
surname:{type:String,required:true},
topic:{type:String,required:true},
landline:{type:String,required:true},
mobile:{type:String,required:true},
email:{type:String,required:true,unique:true},
department:{type:String,required:true},
username:{
    type:String,
    unique:true,
    required:true
},

password:{
    type:String,
    required:true
}
});

ProfessorSchema.pre('save',async function(next){
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt);
        next();

    }catch (err) {
        next(err);
    }

})

export default model('Professor',ProfessorSchema);