import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function runAudit() {
  console.log('=== SISTEMPER FINAL DATABASE AUDIT ===');
  
  const categories = ['Vidro', 'Perfil', 'Acessório'];
  
  for (const cat of categories) {
    const total = await prisma.material.count({ where: { category: cat } });
    const zero = await prisma.material.count({ where: { category: cat, price: 0 } });
    const missing = await prisma.material.count({ where: { name: { startsWith: 'MISSING-' }, category: cat } });
    
    console.log(`\nCategory: ${cat}`);
    console.log(`- Total Items: ${total}`);
    console.log(`- Items with Price 0: ${zero}`);
    console.log(`- "MISSING" Placeholders: ${missing}`);
    
    if (zero > 0) {
        const samples = await prisma.material.findMany({ 
            where: { category: cat, price: 0 }, 
            take: 5 
        });
        console.log(`  Samples with Price 0: ${samples.map(s => s.name).join(', ')}`);
    }
  }

  // Check specific Gate materials
  const gateMats = await prisma.material.findMany({
    where: { OR: [{ name: { contains: 'TG-001' } }, { name: { contains: 'PC-004' } }] }
  });
  console.log('\n--- Specific Gate Materials ---');
  gateMats.forEach(m => console.log(`- ${m.name}: R$ ${m.price}`));

  // Check Box Kits
  const boxKits = await prisma.kit.findMany({
    where: { name: { contains: 'BOX', mode: 'insensitive' } },
    include: { components: { include: { material: true } } },
    take: 3
  });
  console.log('\n--- Box Kits (Sample) ---');
  boxKits.forEach(k => {
    const totalCost = k.components.reduce((acc, c) => acc + Number(c.material.price), 0);
    console.log(`- Kit: ${k.name} | Est. Material Cost: R$ ${totalCost.toFixed(2)}`);
  });

  await prisma.$disconnect();
}

runAudit();
