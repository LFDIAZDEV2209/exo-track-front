export type ItemScope = 'income' | 'asset' | 'liability' | 'custom';

export interface ConceptSubtype {
  id: string;
  name: string;
  description: string | null;
  scope: ItemScope;
  conceptType: { id: string; name: string } | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
