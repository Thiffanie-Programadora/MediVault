import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { queryOne } from '../config/db.js';

export function authenticateJWT(req, res, next) {
  let token = null;

  // 1. Try Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Try HttpOnly cookie (RF-02)
  if (!token && req.cookies) {
    token = req.cookies.medivault_token || req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token de autenticación requerido. Inicie sesión.'
    });
  }

  try {
    // OWASP A08: strictly enforce HS256 algorithm to prevent "none" or algorithm confusion attacks
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });

    const userId = decoded.id || decoded.sub;
    const user = queryOne(
      `SELECT u.id, u.email, u.name, u.is_active, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [userId]
    );

    if (!user || user.is_active !== 1) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Usuario inactivo o no encontrado.'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role_name
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'TokenExpired',
        message: 'Su sesión ha expirado. Inicie sesión nuevamente.'
      });
    }
    return res.status(401).json({
      error: 'InvalidToken',
      message: 'Token de sesión inválido.'
    });
  }
}

export const authenticateToken = authenticateJWT;
