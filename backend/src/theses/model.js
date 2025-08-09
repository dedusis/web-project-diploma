import mongoose, { Schema, model } from 'mongoose';


const thesesSchema = new Schema({
    title: {type:String,
            required:true,
            unique:true},

    supervisor:{type:String,required:true},

    student:{type:String},

    description: {type:String,
        required:true},
        
    pdf:    { 
        data:Buffer,
        contentType:String,
        filename:String
    }
})

export default model('Theses',thesesSchema);