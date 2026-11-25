import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string()
    .min(8, 'La contraseña debe tener mínimo 8 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^._\-~+=\[\]])[A-Za-z\d@$!%*?&#^._\-~+=\[\]]{8,128}$/,
      'La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial'
    ),
  documentId: z.string().optional(),
  doc: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'colaborador', 'cliente', 'auditor']).default('cliente'),
  termsAccepted: z.boolean().optional(),
  privacyAccepted: z.boolean().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
});

export const noteSchema = z.object({
  title: z.string().min(2, 'El título es requerido').max(200),
  content: z.string().min(1, 'El contenido no puede estar vacío'),
  category: z.enum(['diagnostico', 'receta', 'confidencial', 'general']).default('general')
});

export const updateNoteSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  content: z.string().min(1).optional(),
  category: z.enum(['diagnostico', 'receta', 'confidencial', 'general']).optional()
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Correo electrónico inválido')
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(10, 'Token inválido'),
  newPassword: z.string()
    .min(8, 'La contraseña debe tener mínimo 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^._\-~+=\[\]])[A-Za-z\d@$!%*?&#^._\-~+=\[\]]{8,128}$/,
      'La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial'
    )
});

export const deletionRequestSchema = z.object({
  password: z.string().min(1, 'Debe ingresar su contraseña para confirmar la identidad'),
  reason: z.string().max(500).optional()
});

export const noteCreateSchema = noteSchema;
export const noteUpdateSchema = updateNoteSchema;

export const roleUpdateSchema = z.object({
  userId: z.number().int().positive('ID de usuario inválido'),
  roleName: z.enum(['admin', 'colaborador', 'cliente', 'auditor'])
});
