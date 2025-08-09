import { Router } from 'express';
import secretaryRouter from '../secretary/router.js';
import studentRouter from '../student/router.js';

const router = Router();

router.use('/secretary', secretaryRouter);
router.use('/student', studentRouter);

export default router;