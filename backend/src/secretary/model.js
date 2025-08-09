import mongoose from "mongoose";
import './importLog.model.js';


const secretarySchema = new mongoose.Schema(
    {
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    department: {
      type: String
    },
    createdImports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ImportLog'
      }
    ]
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Secretary', secretarySchema);