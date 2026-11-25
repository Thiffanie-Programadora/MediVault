import { logger } from '../config/logger.js';

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Unauthorized', message: 'No autenticado.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Access denied: insufficient privileges', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        url: req.originalUrl
      });
      return res.status(403).json({
        error: 'Forbidden',
        message: `Acceso denegado: Se requiere uno de los siguientes roles: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
}

export const requireRoles = requireRole;
