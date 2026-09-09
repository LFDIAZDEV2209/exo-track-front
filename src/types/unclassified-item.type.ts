import { DataSource } from "./data-source.type";

export interface UnclassifiedItem {
  id: string;
  declarationId: string;
  concept: string;
  amount: number;
  source: DataSource;
  sourceDetail?: string;
  reporterName?: string | null;
  reporterNit?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
