import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import appRouter from './backend/src/routes/router.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}


const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));


app.use(express.json());
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