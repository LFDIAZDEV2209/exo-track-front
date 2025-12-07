import { DeclarationStatus } from "./declaration-status.type";

export interface Declaration {
  id: string;
  userId: string;  // Asegurar que esté presente
  taxableYear: number;
  status: DeclarationStatus;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}