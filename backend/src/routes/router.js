import { Router } from 'express';
import professorRouter from '../professor/router.js';
const router = Router();

router.use('/professor',professorRouter);
export default router;