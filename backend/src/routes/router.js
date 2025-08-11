import { Router } from 'express';
import professorRouter from '../professor/router.js';
import secretaryRouter from '../secretary/router.js';
import studentRouter from '../student/router.js';
import authRouter from '../auth/router.js';
import thesesRouter from '../theses/router.js';

const router = Router();

router.use('/professor',professorRouter);
router.use('/secretary', secretaryRouter);
router.use('/student', studentRouter);
router.use('/auth', authRouter);
router.use('/theses', thesesRouter);


export default router;