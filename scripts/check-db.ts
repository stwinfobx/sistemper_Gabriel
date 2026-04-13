import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const [mats, tips, kits] = await Promise.all([
    prisma.material.count(),
    prisma.tipology.count(),
    prisma.kit.count()
  ]);
  console.log(`\n=== BANCO DE DADOS SISTEMPER ===`);
  console.log(`Materials: ${mats} | Tipologies: ${tips} | Kits: ${kits}`);

  // Materials by type
  const byType = await prisma.material.groupBy({ by: ['type'], _count: true });
  console.log('\n[Materiais por tipo]');
  byType.forEach((t: any) => console.log(`  ${t.type}: ${t._count} itens`));

  // Materials with price > 0
  const withPrice = await prisma.material.count({ where: { price: { gt: 0 } } });
  console.log(`\n  Com preço > 0: ${withPrice} | Com preço = 0: ${mats - withPrice}`);

  // Sample of glass materials
  const glass = await prisma.material.findMany({
    where: { type: 'Glass' },
    take: 5,
    select: { name: true, baseName: true, price: true, provider: true }
  });
  console.log('\n[Amostra de materiais de Vidro]');
  glass.forEach((m: any) => console.log(`  ${m.name} | provider: ${m.provider} | R$ ${m.price}`));

  // Tipologies by category
  const byCategory = await prisma.tipology.groupBy({ by: ['category'], _count: true });
  console.log('\n[Tipologias por categoria]');
  byCategory.forEach((t: any) => console.log(`  ${t.category}: ${t._count} tipologias`));

  // Sample tipology with kits + components
  const tipWithKit = await prisma.tipology.findFirst({
    where: { category: { contains: 'Vidro', mode: 'insensitive' } },
    include: { Kits: { include: { components: { include: { material: { select: { name: true, price: true } } } } } } }
  });
  if (tipWithKit) {
    console.log(`\n[Exemplo tipologia Vidro: "${tipWithKit.name}"]`);
    console.log(`  Kits: ${tipWithKit.Kits.length}`);
    tipWithKit.Kits.forEach((k: any) => {
      console.log(`  Kit "${k.name}" - ${k.components.length} componentes`);
      k.components.slice(0, 3).forEach((c: any) => console.log(`    - ${c.material?.name} | R$ ${c.material?.price} | formula: ${c.quantityFormula}`));
    });
  } else {
    console.log('\n[!] Nenhuma tipologia com categoria "Vidro" encontrada!');
    const all = await prisma.tipology.findMany({ select: { name: true, category: true }, take: 10 });
    console.log('Primeiras 10 tipologias:');
    all.forEach((t: any) => console.log(`  "${t.name}" — "${t.category}"`));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
