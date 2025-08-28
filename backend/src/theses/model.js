import mongoose from "mongoose";

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
      default: Date.now
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
    committee: [{
      professor: { type: mongoose.Schema.Types.ObjectId, ref: "Professor" },
      status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
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
    finalGrade: { type: Number },
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
