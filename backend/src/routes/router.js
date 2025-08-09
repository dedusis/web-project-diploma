import { Router } from 'express';
import professorRouter from '../professor/router.js';
import secretaryRouter from '../secretary/router.js';

const router = Router();

router.use('/professor',professorRouter);
router.use('/secretary', secretaryRouter);


export default router;