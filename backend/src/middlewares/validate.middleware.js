import { logger } from '../config/logger.js';

export function validate(schema) {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      logger.warn('Input validation failed', {
        path: req.originalUrl,
        errors: JSON.stringify(error.errors || error.issues)
      });
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Los datos suministrados no cumplen con el formato requerido.',
        details: error.errors || error.issues
      });
    }
  };
}
