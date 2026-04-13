import { Kit, CalculationResult, CalculatedComponent } from '../../types';

/**
 * Core Calculation Engine for SISTEMPER 2025
 * Translates Excel-style formulas stored in the database into real costs.
 */

export function calculateKit(
  kit: Kit,
  params: {
    width: number; // in mm
    height: number; // in mm
    quantity: number;
    optimizeCut?: boolean;
    flags?: Record<string, boolean>;
  }
): CalculationResult {
  const { width: W, height: H, quantity, optimizeCut = false } = params;
  const components: CalculatedComponent[] = [];
  let baseCost = 0;

  for (const comp of kit.components) {
    if (!comp.quantityFormula) continue;

    try {
      // Create a safe evaluation environment for the formula
      // Formulas use W (width mm) and H (height mm)
      const formulaFunc = new Function('W', 'H', 'Math', `return ${comp.quantityFormula};`);
      let calculatedQuantity = formulaFunc(W, H, Math);

      // Apply waste/optimization if requested
      // For Profiles (Aluminum) we usually add 7% if not optimized
      // For Glass we usually add 5% for safety
      if (optimizeCut) {
        if (comp.material.type === 'Aluminum') calculatedQuantity *= 1.07;
        if (comp.material.type === 'Glass') calculatedQuantity *= 1.05;
      }

      const unitPrice = Number(comp.material.price) || 0;
      const totalCost = calculatedQuantity * unitPrice;

      components.push({
        componentId: comp.id,
        materialName: comp.material.name,
        materialCategory: comp.material.category || 'N/A',
        unitPrice,
        calculatedQuantity,
        totalCost
      });

      baseCost += totalCost;
    } catch (error) {
      console.error(`Error calculating formula "${comp.quantityFormula}" for material ${comp.material.name}:`, error);
    }
  }

  return {
    kitId: kit.id,
    kitName: kit.name,
    baseCost,
    totalCost: baseCost * quantity,
    components
  };
}

/**
 * Specialized calculator for Glass Tipologies
 * (Often involves area calculation + standard kit)
 */
export function calculateGlassTipology(
  glassMaterial: any,
  kit: Kit,
  params: { width: number; height: number; quantity: number }
): CalculationResult {
  const { width, height, quantity } = params;
  
  // 1. Calculate the area cost
  const areaM2 = (width * height) / 1000000;
  const glassUnitPrice = Number(glassMaterial.price) || 0;
  const glassCost = areaM2 * glassUnitPrice;

  // 2. Calculate the kit components (accessories/ferragens)
  const kitResult = calculateKit(kit, { width, height, quantity: 1 });

  // 3. Merge results
  const components: CalculatedComponent[] = [
    {
      componentId: glassMaterial.id,
      materialName: glassMaterial.name,
      materialCategory: 'Vidro',
      unitPrice: glassUnitPrice,
      calculatedQuantity: areaM2,
      totalCost: glassCost
    },
    ...kitResult.components
  ];

  const baseCost = glassCost + kitResult.baseCost;

  return {
    kitId: kit.id,
    kitName: `Tipologia: ${glassMaterial.name} + ${kit.name}`,
    baseCost,
    totalCost: baseCost * quantity,
    components
  }
}
