import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const PRICE_TABLE_PATH = 'C:\\SISTEMPER 2025\\TABELA DE PREÇOS.xlsm';
const MAIN_SYSTEM_PATH = 'C:\\SISTEMPER 2025\\SISTEMPER.xlsm';
const IMAGES_DIR = 'C:\\SISTEMPER 2025\\VIDRO';

async function main() {
  console.log('--- Starting Enhanced Sistemper Migration ---');

  // 1. Tipologies and Images
  console.log('1/4: Mapping Tipologies...');
  if (fs.existsSync(IMAGES_DIR)) {
    const images = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.jpg'));
    for (const imageName of images) {
      const typologyName = path.parse(imageName).name;
      const category = typologyName.includes('PORTA') ? 'Porta' : 
                      typologyName.includes('JANELA') ? 'Janela' : 
                      typologyName.includes('BOX') ? 'Box' : 
                      typologyName.includes('SACADA') ? 'Sacada' : 'Vidro';
      
      await prisma.tipology.upsert({
        where: { id: typologyName },
        update: { imagePath: `/images/vidros/${imageName}`, category },
        create: {
          id: typologyName,
          name: typologyName,
          category,
          imagePath: `/images/vidros/${imageName}`
        }
      });
    }
  }

  // 2. Materials
  console.log('2/4: Processing Materials...');
  if (fs.existsSync(PRICE_TABLE_PATH)) {
    const priceBook = XLSX.readFile(PRICE_TABLE_PATH);
    
    // A. Glass
    const glassSheet = priceBook.Sheets['TABELA VIDROS'];
    if (glassSheet) {
      console.log('Processing Glass Prices...');
      const data: any[] = XLSX.utils.sheet_to_json(glassSheet, { header: 1 });
      for (let i = 4; i < data.length; i++) { // Starting from row 5
        const row = data[i];
        if (!row) continue;
        
        const processGlass = async (name: any, pT: any, pD: any, pB: any) => {
          if (name && typeof name === 'string' && name.trim()) {
            const baseName = name.trim();
            const providers = [
              { name: 'Tempermax', price: pT },
              { name: 'Divinal', price: pD },
              { name: 'Blindex', price: pB }
            ];
            
            for (const prov of providers) {
              if (prov.price !== undefined && prov.price !== null) {
                await prisma.material.upsert({
                  where: { name: `${baseName} (${prov.name})` },
                  update: { 
                    price: Number(prov.price) || 0,
                    baseName,
                    category: 'Vidro'
                  },
                  create: {
                    name: `${baseName} (${prov.name})`,
                    baseName,
                    type: 'Glass',
                    unit: 'm2',
                    price: Number(prov.price) || 0,
                    provider: prov.name,
                    category: 'Vidro',
                    thickness: parseInt(baseName.match(/\d+/)?.[0] || '8'),
                    color: baseName.split(' ')[0]
                  }
                });
              }
            }
          }
        };

        // Two blocks of glass data per row
        await processGlass(row[1], row[2], row[5], row[8]); // First block
        await processGlass(row[22], row[23], row[27], row[31]); // Second block
      }
    }

    // B. Aluminum (ALUMINIOS sheet)
    const alumSheet = priceBook.Sheets['ALUMINIOS'];
    if (alumSheet) {
      console.log('Processing Aluminum Profiles...');
      const data: any[] = XLSX.utils.sheet_to_json(alumSheet, { header: 1 });
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row && row[0]) {
          const name = String(row[0]).trim();
          const price = Number(row[2]) || 0;
          await prisma.material.upsert({
            where: { name: `ALUM-${name}` },
            update: { price, category: 'Perfil' },
            create: {
              name: `ALUM-${name}`,
              baseName: name,
              type: 'Aluminum',
              unit: 'm',
              price,
              category: 'Perfil'
            }
          });
        }
      }
    }

    // C. Accessories (ACESSÓRIOS sheet)
    const accSheet = priceBook.Sheets['ACESSÓRIOS'];
    if (accSheet) {
      console.log('Processing Accessories...');
      const data: any[] = XLSX.utils.sheet_to_json(accSheet, { header: 1 });
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row && row[0]) {
          const name = String(row[0]).trim();
          const price = Number(row[2]) || 0; // Assuming column 2 for base price
          await prisma.material.upsert({
            where: { name: `ACC-${name}` },
            update: { price, category: 'Acessório' },
            create: {
              name: `ACC-${name}`,
              baseName: name,
              type: 'Accessory',
              unit: 'un',
              price,
              category: 'Acessório'
            }
          });
        }
      }
    }
  }

  // 3. Mapping Kits (SISTEMPER.xlsm)
  console.log('3/4: Mapping Kits...');
  // (Same kit mapping logic as before, but ensure it finds materials correctly)
  if (fs.existsSync(MAIN_SYSTEM_PATH)) {
    const mainBook = XLSX.readFile(MAIN_SYSTEM_PATH);
    const glassLogicSheet = mainBook.Sheets['TABELA VIDROS'];
    if (glassLogicSheet) {
      const data: any[] = XLSX.utils.sheet_to_json(glassLogicSheet);
      for (const row of data) {
        const kitName = row['ITEM'] || row['0_1'];
        if (kitName) {
          const kit = await prisma.kit.upsert({
            where: { id: String(kitName) },
            update: { name: String(kitName) },
            create: { id: String(kitName), name: String(kitName) }
          });

          for (let i = 1; i <= 21; i++) {
            const accName = row[`AC${i}`];
            const accQty = row[`QT${i}`];
            if (accName && accName !== 0) {
              const material = await prisma.material.findFirst({
                where: { baseName: { contains: String(accName), mode: 'insensitive' } }
              });

              if (material) {
                await prisma.kitComponent.upsert({
                  where: { id: `${kit.id}-${material.id}` },
                  update: { quantityFormula: String(accQty) },
                  create: {
                    id: `${kit.id}-${material.id}`,
                    kitId: kit.id,
                    materialId: material.id,
                    quantityFormula: String(accQty)
                  }
                });
              }
            }
          }
        }
      }
    }
  }

  console.log('--- Migration Completed! ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
