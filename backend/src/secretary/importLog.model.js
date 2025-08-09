import mongoose from 'mongoose';

const importLogSchema = new mongoose.Schema(
  {
    filename: { type: String }, // π.χ. 'students_batch_01.json'
    importDate: { type: Date, default: Date.now },
    importedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Secretary',
      required: true
    },
    summary: {
      students: Number,
      professors: Number,
      theses: Number
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('ImportLog', importLogSchema);
