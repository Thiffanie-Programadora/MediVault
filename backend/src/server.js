import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { initDatabaseSchema } from './models/schema.js';
import { runDatabaseSeed } from './models/seed.js';

// OWASP A10: Process-level exception handling (Fail Closed)
process.on('uncaughtException', (err) => {
  logger.error('CRITICAL UNCAUGHT EXCEPTION: Process terminating safely', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('CRITICAL UNHANDLED REJECTION: Promise rejection caught', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined
  });
});

async function startServer() {
  try {
    // 1. Initialize DB Schema
    await initDatabaseSchema();

    // 2. Run initial seed for roles and default accounts
    await runDatabaseSeed();

    // 3. Start HTTP server
    const server = app.listen(env.PORT, () => {
      logger.info(`MediVault Secure Vault Backend running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`Health check active at http://localhost:${env.PORT}/health`);
      logger.info(`API endpoints active at http://localhost:${env.PORT}/api`);
    });

    // 4. Graceful shutdown
    const shutdown = (signal) => {
      logger.info(`Received ${signal}. Shutting down MediVault server gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed. Exiting process.');
        process.exit(0);
      });
      // Force shutdown if taking longer than 10s
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    return server;
  } catch (error) {
    logger.error('Failed to start MediVault server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

startServer();
