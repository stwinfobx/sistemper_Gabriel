import { PrismaClient } from '@prisma/client';
import { calculateKit } from '../lib/engine/calculator';

const prisma = new PrismaClient();

async function test() {
  console.log('Testing calculation engine...');

  // 1. Pick a gate kit (They usually have complex formulas)
  const kit = await prisma.kit.findFirst({
    where: { 
      tipology: { 
        category: 'Portão' 
      }
    },
    include: {
      components: {
        include: {
          material: true
        }
      }
    }
  });

  if (!kit) {
    console.error('No gate kit found for testing. Run seed first.');
    return;
  }

  console.log(`Testing Kit: ${kit.name}`);
  console.log(`Flags: ${JSON.stringify(kit.flags)}`);

  // 2. Calculate for 2000x1500
  const result = calculateKit(kit as any, {
    width: 2000,
    height: 1500,
    quantity: 1
  });

  console.log('--- Results ---');
  console.log(`Base Cost: R$ ${result.baseCost.toFixed(2)}`);
  console.log('Components Breakdown:');
  result.components.forEach(c => {
    console.log(`- ${c.materialName} (${c.materialCategory}): Qty ${c.calculatedQuantity.toFixed(2)} | Cost R$ ${c.totalCost.toFixed(2)}`);
  });
}

test().catch(console.error).finally(() => prisma.$disconnect());
