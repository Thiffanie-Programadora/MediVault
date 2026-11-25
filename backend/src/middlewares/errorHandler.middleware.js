import { logger } from '../config/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(`Error procesando solicitud: ${err.message}`, {
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });

  const statusCode = err.status || err.statusCode || 500;
  // OWASP A10: Never leak internal database stack traces to client in production
  const safeMessage = (statusCode === 500 && process.env.NODE_ENV === 'production')
    ? 'Ocurrió un error interno seguro. La operación ha sido registrada.'
    : (err.message || 'Error interno del servidor');

  res.status(statusCode).json({
    success: false,
    error: err.message || err.name || 'InternalServerError',
    message: safeMessage
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada en MediVault API.`
  });
}

export const globalErrorHandler = errorHandler;
