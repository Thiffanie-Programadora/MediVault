import { Router } from 'express';
import { getBccrRate, lookupContributor, getWeatherAlerts } from '../controllers/externalApis.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/exchange-rate', getBccrRate);
router.get('/taxpayer', lookupContributor);
router.get('/weather', getWeatherAlerts);

export default router;
