import { Router } from 'express';
import { getIndicatorTrends } from '../controllers/analytics.controller.js';
import authenticate from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/indicators', authenticate, getIndicatorTrends);

export default router;