import { z } from 'zod';

export const loginSchema = z.object({
  cedula: z
    .string()
    .min(6, 'La cédula debe tener al menos 6 caracteres')
    .max(12, 'La cédula no puede tener más de 12 caracteres')
    .regex(/^\d+$/, 'La cédula debe contener solo números'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const clientSchema = z.object({
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  documentNumber: z
    .string()
    .min(6, 'La cédula debe tener al menos 6 caracteres')
    .max(12, 'La cédula no puede tener más de 12 caracteres')
    .regex(/^\d+$/, 'La cédula debe contener solo números'),
  email: z.string().email('Email inválido'),
  phoneNumber: z
    .string()
    .min(7, 'El teléfono debe tener al menos 7 caracteres')
    .max(10, 'El teléfono no puede tener más de 10 caracteres'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(),
});

export const declarationSchema = z.object({
  taxableYear: z.number().min(2000).max(2100),
  description: z.string().optional(),
});

export const assetSchema = z.object({
  concept: z.string().min(3, 'El concepto debe tener al menos 3 caracteres'),
  amount: z.number().positive('El valor debe ser positivo').max(999999999999, 'Valor demasiado grande'),
  source: z.enum(['exogeno', 'manual']),
});

export const incomeSchema = z.object({
  concept: z.string().min(3, 'El concepto debe tener al menos 3 caracteres'),
  amount: z.number().positive('El valor debe ser positivo').max(999999999999, 'Valor demasiado grande'),
  source: z.enum(['exogeno', 'manual']),
});

export const liabilitySchema = z.object({
  concept: z.string().min(3, 'El concepto debe tener al menos 3 caracteres'),
  amount: z.number().positive('El valor debe ser positivo').max(999999999999, 'Valor demasiado grande'),
  source: z.enum(['exogeno', 'manual']),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ClientFormData = z.infer<typeof clientSchema>;
export type DeclarationFormData = z.infer<typeof declarationSchema>;
export type AssetFormData = z.infer<typeof assetSchema>;
export type IncomeFormData = z.infer<typeof incomeSchema>;
export type LiabilityFormData = z.infer<typeof liabilitySchema>;
