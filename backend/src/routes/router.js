import { Router } from 'express';
import professorRouter from '../professor/router.js';
import secretaryRouter from '../secretary/router.js';
import studentRouter from '../student/router.js';
import authRouter from '../auth/router.js';
import thesesRouter from '../theses/router.js';
import importRouter from '../import/router.js';
import exportRouter from '../export/router.js';
import announcementsRouter from "../announcements/router.js";


const router = Router();
router.use('/announcements', announcementsRouter);
router.use('/professor',professorRouter);
router.use('/secretary', secretaryRouter);
router.use('/student', studentRouter);
router.use('/auth', authRouter);
router.use('/theses', thesesRouter);
router.use('/import', importRouter);
router.use('/theses', exportRouter);


export default router;

