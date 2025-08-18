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
      enum: ["pending", "approved", "completed","rejected"],
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

    committeeApproval: {
      type: Boolean,
      default: false
    }
  }
);

export default mongoose.model("Theses", thesesSchema);
