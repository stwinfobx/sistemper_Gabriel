import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function check() {
  const materials = await prisma.material.findMany({
    where: { 
      OR: [
        { name: { contains: 'TG-001', mode: 'insensitive' } },
        { name: { contains: 'PC-004', mode: 'insensitive' } },
        { name: { contains: 'Incolor 8mm', mode: 'insensitive' } }
      ]
    }
  });
  console.log('--- Material Validation ---');
  materials.forEach(m => {
    console.log(`- ${m.name}: R$ ${m.price} [ID: ${m.id}]`);
  });
  await prisma.$disconnect();
}
check();
