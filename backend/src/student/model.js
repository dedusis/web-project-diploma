import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
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
      required: true,
      trim: true
    },
    surname: {
      type: String,
      required: true,
      trim: true
    },
    student_number: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    street: {
      type: String,
      trim: true
    },
    number: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    postcode: {
      type: String,
      trim: true
    },
    father_name: {
      type: String,
      trim: true
    },
    landline_telephone: {
      type: String,
      trim: true
    },
    mobile_telephone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model('Student', studentSchema);
