import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';

const prisma = new PrismaClient();
const PRICE_TABLE = 'C:\\SISTEMPER 2025\\TABELA DE PREÇOS.xlsm';

async function identifyMissing() {
  const missing = await prisma.material.findMany({
    where: { name: { startsWith: 'MISSING-' } },
    include: { KitComponents: { include: { kit: true } } }
  });

  console.log(`Found ${missing.length} Missing Material items.`);
  
  // Sort by popularity (how many kits use it)
  const sorted = missing.sort((a, b) => b.KitComponents.length - a.KitComponents.length);

  for (const m of sorted.slice(0, 15)) {
    console.log(`\nMissing: ${m.baseName} (Used in ${m.KitComponents.length} kits)`);
    console.log(`Example kits: ${m.KitComponents.slice(0, 3).map(c => c.kit.name).join(', ')}`);
    
    // Attempt one last manual search in Excel
    const wb = XLSX.readFile(PRICE_TABLE);
    let found = false;
    wb.SheetNames.forEach(sn => {
        const s = wb.Sheets[sn];
        const d: any[] = XLSX.utils.sheet_to_json(s, {header: 1});
        d.forEach((row, rIdx) => {
            if (row.some((cell: any) => String(cell).toUpperCase().includes(String(m.baseName).toUpperCase()))) {
               console.log(`  [MATCH FOUND] Sheet: ${sn} | Row: ${rIdx} | Content: ${JSON.stringify(row.slice(0, 10))}`);
               found = true;
            }
        });
    });
    if (!found) console.log('  [STILL NOT FOUND IN EXCEL]');
  }

  await prisma.$disconnect();
}

identifyMissing();
