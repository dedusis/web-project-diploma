import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}


const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
 