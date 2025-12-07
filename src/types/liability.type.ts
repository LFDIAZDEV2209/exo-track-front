import { DataSource } from "./data-source.type";

export interface Liability {
  id: string;
  declarationId: string;
  concept: string;
  amount: number;
  source: DataSource;
  createdAt: Date;
  updatedAt: Date;
}