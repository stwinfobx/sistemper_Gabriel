export interface Material {
  id: string;
  name: string;
  baseName: string;
  type: string;
  unit: string;
  price: number;
  provider?: string | null;
  category?: string | null;
  thickness?: number | null;
  color?: string | null;
}

export interface KitComponent {
  id: string;
  kitId: string;
  materialId: string;
  quantityFormula: string | null;
  material: Material;
}

export interface Kit {
  id: string;
  name: string;
  tipologyId?: string | null;
  components: KitComponent[];
  flags?: any; // JSON field for social_gate, etc.
}

export interface Tipology {
  id: string;
  name: string;
  category: string;
  imagePath?: string | null;
  kits?: Kit[];
}

export interface CalculatedComponent {
  componentId: string;
  materialName: string;
  materialCategory: string;
  unitPrice: number;
  calculatedQuantity: number;
  totalCost: number;
}

export interface CalculationResult {
  kitId: string;
  kitName: string;
  baseCost: number;
  totalCost: number;
  components: CalculatedComponent[];
}

export interface BudgetItem {
  id: string;
  budgetId: string;
  tipologyId: string;
  name: string;
  width: number;
  height: number;
  quantity: number;
  unitPrice: number;
  details: any; // JSON snapshot of CalculationResult
}

export interface Budget {
  id: string;
  number: number;
  clientId: string;
  status: string;
  totalValue: number;
  createdAt: Date;
  items: BudgetItem[];
}
