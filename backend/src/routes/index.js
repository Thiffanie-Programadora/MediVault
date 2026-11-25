import { Router } from 'express';
import authRoutes from './auth.routes.js';
import notesRoutes from './notes.routes.js';
import adminRoutes from './admin.routes.js';
import governanceRoutes from './governance.routes.js';
import aiAgentsRoutes from './aiAgents.routes.js';
import externalApisRoutes from './externalApis.routes.js';
import healthRoutes from './health.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/notes', notesRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/governance', governanceRoutes);
apiRouter.use('/ai-agents', aiAgentsRoutes);
apiRouter.use('/external', externalApisRoutes);
apiRouter.use('/', healthRoutes);

export default apiRouter;
