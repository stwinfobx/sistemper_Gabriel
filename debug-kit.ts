import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function audit() {
  const kit = await prisma.kit.findFirst({
    where: { name: { contains: 'BOX 3 FOLHAS', mode: 'insensitive' } },
    include: { components: { include: { material: true } } }
  });
  if (kit) {
    console.log(`Audit for Kit: ${kit.name}`);
    kit.components.forEach(c => {
      console.log(`  - ${c.material.name}: R$ ${c.material.price} (${c.material.category})`);
    });
  } else {
    console.log('Kit not found');
  }
  await prisma.$disconnect();
}
audit();
