import mongoose from "mongoose";
import '../import/model.js';


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

secretarySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model('Secretary', secretarySchema);