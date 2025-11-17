// User types
export type UserRole = 'admin' | 'cliente';

export interface User {
  id: string;
  documentNumber: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  passwordHash?: string; // Optional in frontend, required in backend
  role: UserRole;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Client types (for admin view)
export interface Client {
  id: string;
  documentNumber: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  totalDeclarations: number;
  createdAt: Date;
}

// Declaration types
export type DeclarationStatus = 'borrador' | 'finalizada';

export type DataSource = 'exogeno' | 'manual';

export interface Declaration {
  id: string;
  userId: string;
  userFullName: string;
  taxableYear: number;
  status: DeclarationStatus;
  description: string;
  filePath?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Income types
export interface Income {
  id: string;
  declarationId: string;
  concept: string;
  amount: number;
  source: DataSource;
  createdAt: Date;
  updatedAt: Date;
}

// Asset types
export interface Asset {
  id: string;
  declarationId: string;
  concept: string;
  amount: number;
  source: DataSource;
  createdAt: Date;
  updatedAt: Date;
}

// Liability types
export interface Liability {
  id: string;
  declarationId: string;
  concept: string;
  amount: number;
  source: DataSource;
  createdAt: Date;
  updatedAt: Date;
}

