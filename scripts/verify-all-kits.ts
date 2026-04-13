import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verifyAll() {
  console.log('=== SISTEMPER FULL KITS AUDIT ===');
  
  const kits = await prisma.kit.findMany({
    include: {
      components: {
        include: { material: true }
      }
    }
  });

  const zeroKits: any[] = [];
  const partiallyMissingKits: any[] = [];
  let healthyCount = 0;

  for (const kit of kits) {
    let totalCost = 0;
    let missingComps = 0;
    let zeroPriceComps = 0;

    for (const comp of kit.components) {
      const price = Number(comp.material.price);
      if (price > 0) {
        totalCost += price;
      } else {
        if (comp.material.name.startsWith('MISSING-')) {
          missingComps++;
        } else {
          zeroPriceComps++;
        }
      }
    }

    if (kit.components.length === 0 || (totalCost === 0 && kit.components.length > 0)) {
      zeroKits.push({ name: kit.name, id: kit.id });
    } else if (missingComps > 0 || zeroPriceComps > 0) {
      partiallyMissingKits.push({ 
        name: kit.name, 
        missing: missingComps, 
        zero: zeroPriceComps,
        totalComps: kit.components.length 
      });
    } else {
      healthyCount++;
    }
  }

  console.log(`\nAudit Summary:`);
  console.log(`- Healthy Kits (100% Priced): ${healthyCount}`);
  console.log(`- Partially Priced Kits: ${partiallyMissingKits.length}`);
  console.log(`- Kits with ZERO Price: ${zeroKits.length}`);

  if (zeroKits.length > 0) {
    console.log('\n--- Kits with ZERO Price (Top 20) ---');
    zeroKits.slice(0, 20).forEach(k => console.log(`[!] ${k.name}`));
  }

  if (partiallyMissingKits.length > 0) {
    console.log('\n--- Partially Priced Kits (Samples with Issues) ---');
    partiallyMissingKits.slice(0, 10).forEach(k => {
        console.log(`[-] ${k.name}: ${k.missing} missing, ${k.zero} zero-price (Total comps: ${k.totalComps})`);
    });
  }

  await prisma.$disconnect();
}

verifyAll();
