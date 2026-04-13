import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';

const prisma = new PrismaClient();
const PRICE_TABLE = 'C:\\SISTEMPER 2025\\TABELA DE PREÇOS.xlsm';
const PORT_TIPOLOGY = 'C:\\SISTEMPER 2025\\TIPOLOGIA PORTÕES E GRADIL.xlsm';

async function audit() {
  console.log('--- SISTEMPER PRICE AUDIT ---');
  
  // 1. Read Port Tipology to see what it asks for
  const portWb = XLSX.readFile(PORT_TIPOLOGY);
  const portSheet = portWb.Sheets['LANCAR_PORTÃO'];
  const portData: any[] = XLSX.utils.sheet_to_json(portSheet, {header: 1});
  
  // Let's pick a few materials usually used
  const sampleMaterials = ['TG-001', 'PC-004', 'TRILHO DE PORTÃO', 'ROLDANA', 'GONZO'];
  
  // 2. Search in Price Table (ALUMINIOS + ACESSÓRIOS)
  const priceWb = XLSX.readFile(PRICE_TABLE);
  
  const searchInExcel = (name: string) => {
    const results: any[] = [];
    priceWb.SheetNames.forEach(sheetName => {
      const s = priceWb.Sheets[sheetName];
      const d = XLSX.utils.sheet_to_json(s, {header: 1});
      d.forEach((row: any, i: number) => {
        if (row.some((cell: any) => String(cell).toUpperCase().includes(name.toUpperCase()))) {
          results.push({ sheet: sheetName, line: i, content: row });
        }
      });
    });
    return results;
  };

  for (const mName of sampleMaterials) {
    console.log(`\nAuditing Material: [${mName}]`);
    
    // Check Database
    const dbMats = await prisma.material.findMany({
      where: { OR: [
        { name: { contains: mName, mode: 'insensitive' } },
        { baseName: { contains: mName, mode: 'insensitive' } }
      ]}
    });
    
    console.log(`- Database Hits: ${dbMats.length}`);
    dbMats.forEach(m => console.log(`  > DB ID: ${m.id} | Name: ${m.name} | Price: R$ ${m.price}`));
    
    // Check Excel
    const exHits = searchInExcel(mName);
    console.log(`- Excel Hits: ${exHits.length}`);
    exHits.slice(0, 3).forEach(h => {
        console.log(`  > Sheet: ${h.sheet} | Line: ${h.line} | Found Sample: ${JSON.stringify(h.content.slice(0, 10))}`);
    });
  }
}

audit().finally(() => prisma.$disconnect());
