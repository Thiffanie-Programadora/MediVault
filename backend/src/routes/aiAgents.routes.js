import { Router } from 'express';
import { listAgents, runAgent, getHistory } from '../controllers/aiAgents.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', listAgents);
router.post('/:agentId', runAgent);
router.get('/history/all', getHistory);

export default router;
