import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import appRouter from './backend/src/routes/router.js';
import cors from 'cors';
import path from "path";
import { fileURLToPath } from "url";

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500','http://127.0.0.1:3001',
    'http://localhost:3000',],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
}));

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));


app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));
app.use('/', appRouter);


const swaggerDocs = YAML.load('./swagger.yaml');
    
swaggerDocs.servers = [
  {
    url: `http://localhost:${port}`, 
  },
];

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

    
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});