import { Router } from 'express';
import { requestDeletion, getLegalInformation } from '../controllers/governance.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { deletionRequestSchema } from '../middlewares/schemas.js';

const router = Router();

router.get('/legal', getLegalInformation);
router.post('/deletion-request', authenticateToken, validate(deletionRequestSchema), requestDeletion);

export default router;
