import { Router } from 'express';
import candidateRoutes from './candidateRoutes';
import documentRoutes from './documentRoutes';

const router = Router();

// API routes
router.use('/candidates', candidateRoutes);
router.use('/candidates', documentRoutes);

export default router;

