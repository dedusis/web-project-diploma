import { Router } from 'express';
import secretaryRouter from '../secretary/router.js';

const router = Router();

router.use('/secretary', secretaryRouter);

export default router;