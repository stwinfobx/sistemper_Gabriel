const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const PRICE_TABLE_PATH = 'C:\\SISTEMPER 2025\\TABELA DE PREÇOS.xlsm';
const MAIN_SYSTEM_PATH = 'C:\\SISTEMPER 2025\\SISTEMPER.xlsm';
const IMAGES_DIR = 'C:\\SISTEMPER 2025\\VIDRO';

async function main() {
  console.log('--- Starting Final Sistemper Migration (Fix 1) ---');

  // 1. Tipologies
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
  console.log('2/4: Processing Materials and Costs...');
  if (fs.existsSync(PRICE_TABLE_PATH)) {
    const priceBook = XLSX.readFile(PRICE_TABLE_PATH);
    
    // A. Glass
    const glassSheet = priceBook.Sheets['TABELA VIDROS'];
    if (glassSheet) {
      const data = XLSX.utils.sheet_to_json(glassSheet, { header: 1 });
      for (let i = 4; i < data.length; i++) {
        const row = data[i];
        if (!row) continue;
        
        const processGlass = async (name, pT, pD, pB) => {
          if (name && typeof name === 'string' && name.trim()) {
            const baseName = name.trim();
            const providers = [
              { name: 'Tempermax', price: pT },
              { name: 'Divinal', price: pD },
              { name: 'Blindex', price: pB }
            ];
            
            for (const prov of providers) {
              const priceNum = String(prov.price).replace(',', '.');
              if (prov.price !== undefined && prov.price !== null && !isNaN(parseFloat(priceNum))) {
                await prisma.material.upsert({
                  where: { name: `${baseName} (${prov.name})` },
                  update: { 
                    price: parseFloat(priceNum), 
                    baseName, 
                    category: 'Vidro' 
                  },
                  create: {
                    name: `${baseName} (${prov.name})`,
                    baseName,
                    type: 'Glass',
                    unit: 'm2',
                    price: parseFloat(priceNum),
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
        await processGlass(row[1], row[2], row[5], row[8]);
        await processGlass(row[22], row[23], row[27], row[31]);
      }
    }

    // B. Aluminum
    const alumSheet = priceBook.Sheets['ALUMINIOS'];
    if (alumSheet) {
      const data = XLSX.utils.sheet_to_json(alumSheet, { header: 1 });
      for (let i = 2; i < data.length; i++) {
        const row = data[i];
        if (row && row[0] && row[0] !== 'DESCRITIVO') {
          const name = String(row[0]).trim();
          const pRaw = row[3] || row[2] || 0;
          const price = parseFloat(String(pRaw).replace(',', '.'));
          if (price > 0 && name.length > 2) {
            await prisma.material.upsert({
              where: { name: `ALUM-${name}` },
              update: { price, baseName: name, category: 'Perfil' },
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
    }

    // C. Accessories
    const accSheet = priceBook.Sheets['ACESSÓRIOS'];
    if (accSheet) {
      const data = XLSX.utils.sheet_to_json(accSheet, { header: 1 });
      const columns = [0, 3, 6, 9];
      for (const colIdx of columns) {
        for (let i = 4; i < data.length; i++) {
          const row = data[i];
          if (row && row[colIdx]) {
            const name = String(row[colIdx]).trim();
            const pRaw = row[colIdx + 1] || 0;
            const price = parseFloat(String(pRaw).replace(',', '.'));
            if (price > 0 && name !== '0' && name.length > 2) {
              await prisma.material.upsert({
                where: { name: `ACC-${name}` },
                update: { price, baseName: name, category: 'Acessório' },
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
    }
  }

  // 3. Kits
  console.log('3/4: Mapping Kits and Components...');
  if (fs.existsSync(MAIN_SYSTEM_PATH)) {
    const mainBook = XLSX.readFile(MAIN_SYSTEM_PATH);
    const glassLogicSheet = mainBook.Sheets['TABELA VIDROS'];
    if (glassLogicSheet) {
      const data = XLSX.utils.sheet_to_json(glassLogicSheet, { header: 1 });
      for (let i = 3; i < data.length; i++) {
        const row = data[i];
        if (row && row[1]) {
          const kitName = String(row[1]).trim();
          const kit = await prisma.kit.upsert({
            where: { id: kitName },
            update: { name: kitName },
            create: { id: kitName, name: kitName }
          });

          for (let j = 2; j < row.length; j += 2) {
            const partName = row[j];
            const partQty = row[j+1];
            if (partName && partName !== 0 && String(partName).trim() !== '') {
              const material = await prisma.material.findFirst({
                where: { baseName: { contains: String(partName).trim(), mode: 'insensitive' } }
              });

              if (material) {
                await prisma.kitComponent.upsert({
                  where: { id: `${kit.id}-${material.id}` },
                  update: { quantityFormula: String(partQty) },
                  create: {
                    id: `${kit.id}-${material.id}`,
                    kitId: kit.id,
                    materialId: material.id,
                    quantityFormula: String(partQty)
                  }
                });
              }
            }
          }
        }
      }
    }
  }

  console.log('--- Final Migration Completed! ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
