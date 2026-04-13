import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function test() {
  try {
    console.log('Testing Material upsert...');
    await prisma.material.upsert({
      where: { name: 'TEST-1' },
      update: { price: 10.5 },
      create: { 
        name: 'TEST-1', 
        type: 'Aluminum', 
        unit: 'm', 
        price: 10.5,
        normalizedName: 'test1',
        category: 'Perfil'
      }
    });
    console.log('Upsert OK');
  } catch (e: any) {
    console.error('Validation Error Details:');
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
