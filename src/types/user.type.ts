import { UserRole } from ".";

export interface User {
  id: string;
  documentNumber: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}