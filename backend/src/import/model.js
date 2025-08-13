import mongoose from 'mongoose';

const importLogSchema = new mongoose.Schema(
  {
    filename: { 
      type: String, 
      required: true 
    }, 
    
    type: { 
      type: String, 
      enum: ['students', 'professors', 'theses', 'mixed'], 
      required: true 
    }, 

    description: { 
      type: String 
    }, 

    importDate: { 
      type: Date, 
      default: Date.now 
    },

    importedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Secretary',
      required: true
    },

    summary: {
      students: { type: Number, default: 0 },
      professors: { type: Number, default: 0 },
      theses: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('ImportLog', importLogSchema);
