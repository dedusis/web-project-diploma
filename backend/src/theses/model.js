import mongoose from "mongoose";

const noteschema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  professor : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Professor",
    required: true
  }
});

const gradeSchema = new mongoose.Schema({
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true },
  criteria: {
    originality: { type: Number, required: true },
    methodology: { type: Number, required: true },
    presentation: { type: Number, required: true },
    knowledge: { type: Number, required: true }
  },
  total: { type: Number, required: true }
}, { timestamps: true });

const thesesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "active", "under_review", "completed", "cancelled"],
      default: "pending"
    },
    assignedDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
      default:null
    },
    professor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professor",
      required: true
    },
    gradingOpen: {
      type: Boolean,
      default: false
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null
    },

    notes:[noteschema],

    statusHistory:[{
      status: String,
      date: { type: Date, default: Date.now }
    }],
    ap_number: {
      type: Number 
    },
    ap_year: {
      type: Number 
    },
    cancel_reason: {
      type: String 
    },
    grades: [gradeSchema],
    nimertis_link: {
      type: String 
    },
    activatedAt:{
      type: Date
    },
    committee: [{
      professor: { type: mongoose.Schema.Types.ObjectId, ref: "Professor" },
      status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
      invitedAt: { type: Date, default: Date.now },
      acceptedAt: { type: Date },
      rejectedAt: { type: Date }
    }],
    readyForActivation: {
      type: Boolean,
      default: false,
    },
    attachment: { 
      type: String 
    },
    draftFile: { 
      type: String 
    }, 
    finalGrade: { type: Number,default: null },
    extraLinks: [String],
    examDate: { type: Date },
    examMode: { type: String, enum: ["in_person", "online"] },
    examLocation: { type: String }, 
  },
  {
    timestamps: true
  }

);


export default mongoose.model("Theses", thesesSchema);
