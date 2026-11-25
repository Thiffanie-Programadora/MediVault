import {
  registerUser,
  loginUser,
  requestPasswordReset,
  confirmPasswordReset
} from '../services/auth.service.js';
import { getUserProfile } from '../services/governance.service.js';
import { env } from '../config/env.js';

export async function register(req, res, next) {
  try {
    const result = await registerUser({
      ...req.body,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    });

    res.cookie('medivault_token', result.token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente bajo estándares OWASP y Ley N.° 8968.',
      ...result
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await loginUser({
      email,
      password,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    res.cookie('medivault_token', result.token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Autenticación exitosa.',
      ...result
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie('medivault_token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  res.status(200).json({
    success: true,
    message: 'Sesión finalizada e invalidada correctamente.'
  });
}

export async function getProfile(req, res, next) {
  try {
    const { reveal, password } = req.query;
    const profile = await getUserProfile(req.user.id, reveal === 'true', password);
    res.status(200).json({
      success: true,
      profile
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const result = await requestPasswordReset(email, req.ip);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    const result = await confirmPasswordReset({
      token,
      newPassword,
      ip: req.ip
    });
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
}

export async function setupMfa(req, res, next) {
  try {
    const { setupUserTotp } = await import('../services/auth.service.js');
    const result = await setupUserTotp(req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function enableMfa(req, res, next) {
  try {
    const { enableUserTotp } = await import('../services/auth.service.js');
    const result = await enableUserTotp({ userId: req.user.id, token: req.body.token, ip: req.ip });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function disableMfa(req, res, next) {
  try {
    const { disableUserTotp } = await import('../services/auth.service.js');
    const result = await disableUserTotp({ userId: req.user.id, password: req.body.password, ip: req.ip });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
