import { Client, Declaration, Asset, Income, Liability, User } from '@/types';

// Mock users for authentication
export const mockUsers: User[] = [
  {
    id: '1',
    documentNumber: '1234567890',
    fullName: 'Carlos Administrador',
    email: 'admin@exotrack.com',
    phoneNumber: '3001234567',
    role: 'admin',
  },
  {
    id: '2',
    documentNumber: '1098765432',
    fullName: 'María García López',
    email: 'maria@email.com',
    phoneNumber: '3107654321',
    role: 'cliente',
  },
  {
    id: '3',
    documentNumber: '1029384756',
    fullName: 'Juan Pérez Rodríguez',
    email: 'juan@email.com',
    phoneNumber: '3159876543',
    role: 'cliente',
  },
];

export const mockClients: Client[] = [
  {
    id: '2',
    documentNumber: '1098765432',
    fullName: 'María García López',
    email: 'maria@email.com',
    phoneNumber: '3107654321',
    totalDeclarations: 3,
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '3',
    documentNumber: '1029384756',
    fullName: 'Juan Pérez Rodríguez',
    email: 'juan@email.com',
    phoneNumber: '3159876543',
    totalDeclarations: 2,
    createdAt: new Date('2023-03-20'),
  },
  {
    id: '4',
    documentNumber: '1234098765',
    fullName: 'Ana Martínez Silva',
    email: 'ana@email.com',
    phoneNumber: '3201239876',
    totalDeclarations: 2,
    createdAt: new Date('2023-05-10'),
  },
  {
    id: '5',
    documentNumber: '1098234567',
    fullName: 'Carlos Ramírez Gómez',
    email: 'carlos@email.com',
    phoneNumber: '3182345678',
    totalDeclarations: 1,
    createdAt: new Date('2023-08-22'),
  },
  {
    id: '6',
    documentNumber: '1029876543',
    fullName: 'Laura Sánchez Torres',
    email: 'laura@email.com',
    phoneNumber: '3124567890',
    totalDeclarations: 2,
    createdAt: new Date('2024-02-14'),
  },
];

export const mockDeclarations: Declaration[] = [
  {
    id: 'd1',
    userId: '2',
    userFullName: 'María García López',
    taxableYear: 2024,
    status: 'borrador',
    description: 'Pendiente de revisar ingresos adicionales',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'd2',
    userId: '2',
    userFullName: 'María García López',
    taxableYear: 2023,
    status: 'finalizada',
    description: 'Declaración completa y presentada',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
  },
  {
    id: 'd3',
    userId: '2',
    userFullName: 'María García López',
    taxableYear: 2022,
    status: 'finalizada',
    description: '',
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-03-10'),
  },
  {
    id: 'd4',
    userId: '3',
    userFullName: 'Juan Pérez Rodríguez',
    taxableYear: 2024,
    status: 'borrador',
    description: 'Falta información de patrimonio inmobiliario',
    createdAt: new Date('2024-10-20'),
    updatedAt: new Date('2024-10-20'),
  },
  {
    id: 'd5',
    userId: '3',
    userFullName: 'Juan Pérez Rodríguez',
    taxableYear: 2023,
    status: 'finalizada',
    description: '',
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-04-05'),
  },
];

export const mockAssets: Asset[] = [
  {
    id: 'p1',
    declarationId: 'd1',
    concept: 'Apartamento en Bogotá - Chapinero',
    amount: 350000000,
    source: 'manual',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'p2',
    declarationId: 'd1',
    concept: 'Vehículo Mazda CX-5 2020',
    amount: 85000000,
    source: 'exogeno',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'p3',
    declarationId: 'd1',
    concept: 'Inversiones en CDT Bancolombia',
    amount: 120000000,
    source: 'exogeno',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'p4',
    declarationId: 'd1',
    concept: 'Cuenta de ahorros Banco de Bogotá',
    amount: 45000000,
    source: 'exogeno',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'p5',
    declarationId: 'd1',
    concept: 'Acciones en la Bolsa de Valores',
    amount: 65000000,
    source: 'manual',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
];

export const mockIncomes: Income[] = [
  {
    id: 'i1',
    declarationId: 'd1',
    concept: 'Salario empresa ABC S.A.S.',
    amount: 96000000,
    source: 'exogeno',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'i2',
    declarationId: 'd1',
    concept: 'Consultoría independiente',
    amount: 24000000,
    source: 'manual',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'i3',
    declarationId: 'd1',
    concept: 'Dividendos acciones',
    amount: 8500000,
    source: 'exogeno',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'i4',
    declarationId: 'd1',
    concept: 'Rendimientos financieros CDT',
    amount: 6200000,
    source: 'exogeno',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
];

export const mockLiabilities: Liability[] = [
  {
    id: 'de1',
    declarationId: 'd1',
    concept: 'Crédito hipotecario apartamento - Banco Davivienda',
    amount: 180000000,
    source: 'exogeno',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'de2',
    declarationId: 'd1',
    concept: 'Crédito vehículo - Banco Colpatria',
    amount: 35000000,
    source: 'exogeno',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'de3',
    declarationId: 'd1',
    concept: 'Saldo tarjeta de crédito - BBVA',
    amount: 8500000,
    source: 'manual',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
];

// Helper to format Colombian currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
