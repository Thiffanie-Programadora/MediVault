import { Router } from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  setupMfa,
  enableMfa,
  disableMfa
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema
} from '../middlewares/schemas.js';
import { loginLimiter, passwordResetLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

router.post('/register', loginLimiter, validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, getProfile);
router.post('/forgot-password', passwordResetLimiter, validate(passwordResetRequestSchema), forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate(passwordResetConfirmSchema), resetPassword);
router.get('/mfa/setup', authenticateToken, setupMfa);
router.post('/mfa/enable', authenticateToken, enableMfa);
router.post('/mfa/disable', authenticateToken, disableMfa);

export default router;
