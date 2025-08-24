import mongoose from "mongoose";

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
    grade: {
      type: Number,
      min: 0,
      max: 10 
    },
    nimertis_link: {
      type: String 
    },
    committee: [{
      professor: { type: mongoose.Schema.Types.ObjectId, ref: "Professor" },
      status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
    }],
    attachment: {
      type: String // URL document PDF
    },
    draftFile: { 
      type: String // URL / filename 
    }, 
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
