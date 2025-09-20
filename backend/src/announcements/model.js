import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  thesis: { type: mongoose.Schema.Types.ObjectId, ref: "Theses", required: true },
  professor: { type: mongoose.Schema.Types.ObjectId, ref: "Professor", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Announcement", announcementSchema);
