import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Demasiados intentos de acceso desde esta IP. Intente de nuevo más tarde.'
  },
  skip: () => process.env.NODE_ENV === 'test'
});

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Demasiadas solicitudes de restablecimiento de contraseña. Intente más tarde.'
  },
  skip: () => process.env.NODE_ENV === 'test'
});

export const authLimiter = loginLimiter;

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Límite de tasa de solicitudes excedido.'
  },
  skip: () => process.env.NODE_ENV === 'test'
});

export const generalLimiter = apiLimiter;
