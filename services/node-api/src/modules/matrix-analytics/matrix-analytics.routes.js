import { Router } from 'express';
import { MatrixAnalyticsController } from './matrix-analytics.controller.js';

const router = Router();

router.post('/analyze', MatrixAnalyticsController.analyze);

export default router;
