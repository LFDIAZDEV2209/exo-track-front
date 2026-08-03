import { DataSource } from "./data-source.type";

export interface Asset {
  id: string;
  declarationId: string;
  concept: string;
  amount: number;
  source: DataSource;
  sourceDetail?: string;
  createdAt: Date;
  updatedAt: Date;
}