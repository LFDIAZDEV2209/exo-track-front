import { DataSource } from "./data-source.type";
import type { ConceptType } from "./concept-type.type";

export interface CustomItem {
  id: string;
  declarationId: string;
  concept: string;
  amount: number;
  source: DataSource;
  sourceDetail?: string;
  conceptType: ConceptType;
  createdAt: Date;
  updatedAt: Date;
}
