import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const codeMap = new Map<string, string>(); // código -> id do material

const PRICE_TABLE = 'C:\\SISTEMPER 2025\\TABELA DE PREÇOS.xlsm';
const GLASS_TIPOLOGY = 'C:\\SISTEMPER 2025\\TIPOLOGIA VIDRO TEMPERADO.xlsm';
const ALUM_TIPOLOGY = 'C:\\SISTEMPER 2025\\TIPOLOGIA ESQUADRIAS.xlsm';
const PORT_TIPOLOGY = 'C:\\SISTEMPER 2025\\TIPOLOGIA PORTÕES E GRADIL.xlsm';
const MAPPINGS_FILE = path.join(process.cwd(), 'scripts', 'mappings.json');
const mappings = fs.existsSync(MAPPINGS_FILE) ? JSON.parse(fs.readFileSync(MAPPINGS_FILE, 'utf8')) : {};

const LOG_FILE = path.join(process.cwd(), 'docs', 'seed-errors.log');

function logError(message: string) {
  fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - ${message}\n`);
}

function normalize(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

async function clearDatabase() {
  console.log('Cleaning database...');
  await prisma.kitComponent.deleteMany();
  await prisma.kit.deleteMany();
  await prisma.tipology.deleteMany();
  await prisma.materialAdjustment.deleteMany();
  await prisma.material.deleteMany();
  codeMap.clear();
}

async function importMaterials() {
  console.log('Importing materials from base price table...');
  if (!fs.existsSync(PRICE_TABLE)) {
    throw new Error(`Price table not found at ${PRICE_TABLE}`);
  }

  const workbook = XLSX.readFile(PRICE_TABLE);

  // A. Glass
  const glassSheet = workbook.Sheets['TABELA VIDROS'];
  if (glassSheet) {
    const data: any[] = XLSX.utils.sheet_to_json(glassSheet, { header: 1 });
    for (let i = 4; i < data.length; i++) {
      const row = data[i];
      const processGlass = async (name: any, pT: any, pD: any, pB: any) => {
        if (!name || typeof name !== 'string' || !name.trim()) return;
        const baseName = name.trim();
        const providers = [
          { name: 'Tempermax', price: pT },
          { name: 'Divinal', price: pD },
          { name: 'Blindex', price: pB }
        ];
        for (const prov of providers) {
          const price = Number(prov.price);
          if (!isNaN(price) && price !== 0) {
            const normalized = normalize(baseName + prov.name);
            const mat = await prisma.material.upsert({
              where: { name: `${baseName} (${prov.name})` },
              update: { price, normalizedName: normalized },
              create: {
                name: `${baseName} (${prov.name})`,
                baseName,
                normalizedName: normalized,
                type: 'Glass',
                unit: 'm2',
                price,
                provider: prov.name,
                category: 'Vidro',
                thickness: parseInt(baseName.match(/\d+/)?.[0] || '8'),
                color: baseName.split(' ')[0]
              }
            });
            codeMap.set(normalized, mat.id);
          }
        }
      };
      await processGlass(row[1], row[2], row[5], row[8]);
      await processGlass(row[22], row[23], row[27], row[31]);
    }
  }

  // B. Aluminum
  const alumSheet = workbook.Sheets['ALUMINIOS'];
  if (alumSheet) {
    const data: any[] = XLSX.utils.sheet_to_json(alumSheet, { header: 1 });
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[5]) continue;
      
      const name = String(row[5]).trim();
      const price = Number(row[6] || row[8] || 0);
      
      if (name.length > 2 && !isNaN(price)) {
        const normalized = normalize(name);
        const mat = await prisma.material.upsert({
          where: { name: `ALUM-${name}` },
          update: { price, normalizedName: normalized },
          create: {
            name: `ALUM-${name}`,
            baseName: name,
            normalizedName: normalized,
            type: 'Aluminum',
            unit: 'm',
            price,
            category: 'Perfil'
          }
        });
        codeMap.set(normalized, mat.id);
      }
    }
  }

  // B2. Drawings/Profiles (Gold/Suprema)
  const drawSheet = workbook.Sheets['DESENHOSPERFIL'];
  if (drawSheet) {
    const data: any[] = XLSX.utils.sheet_to_json(drawSheet, { header: 1 });
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[5]) continue; 
      const name = String(row[5]).trim();
      const price = Number(row[6] || row[7] || 0);
      if (name.length > 2 && !isNaN(price)) {
        const normalized = normalize(name);
        const mat = await prisma.material.upsert({
          where: { name: `ALUM-${name}` },
          update: { price, normalizedName: normalized },
          create: {
            name: `ALUM-${name}`,
            baseName: name,
            normalizedName: normalized,
            type: 'Aluminum',
            unit: 'm',
            price,
            category: 'Perfil'
          }
        });
        codeMap.set(normalized, mat.id);
      }
    }
  }

  // C. Accessories (Horizontal Scraping)
  const accSheet = workbook.Sheets['ACESSÓRIOS'];
  if (accSheet) {
    const data: any[] = XLSX.utils.sheet_to_json(accSheet, { header: 1 });
    console.log('Scraping ACESSÓRIOS horizontally...');
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      if (!row) continue;
      
      for (let c = 0; c < row.length; c++) {
        const cell = row[c];
        if (cell && typeof cell === 'string' && cell.trim().length > 3) {
          const name = cell.trim();
          if (/^\d+$/.test(name)) continue;

          let price = 0;
          for (let p = 1; p <= 4; p++) {
             const val = Number(row[c + p]);
             if (val && !isNaN(val) && val > 0) {
               price = val;
               break;
             }
          }

          if (price > 0) {
            const normalized = normalize(name);
            const mat = await prisma.material.upsert({
              where: { name: `ACC-${name}` },
              update: { price, normalizedName: normalized },
              create: {
                name: `ACC-${name}`,
                baseName: name,
                normalizedName: normalized,
                type: 'Accessory',
                unit: 'un',
                price,
                category: 'Acessório'
              }
            });
            codeMap.set(normalized, mat.id);
            
            const prev = row[c-1];
            if (prev && (typeof prev === 'string' || typeof prev === 'number')) {
               codeMap.set(normalize(String(prev)), mat.id);
            }
          }
        }
      }
    }
  }
}

async function importPortMaterials() {
  console.log('Importing special Portões materials (CADASTRO_PORTAO)...');
  if (!fs.existsSync(PORT_TIPOLOGY)) return;
  const workbook = XLSX.readFile(PORT_TIPOLOGY);
  const sheet = workbook.Sheets['CADASTRO_PORTAO'];
  if (!sheet) return;
  
  const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[1]) continue;
    const name = String(row[1]).trim();
    const pricePerBar = Number(row[3] || 0);
    const metersPerBar = Number(row[4] || 6);
    const price = pricePerBar / metersPerBar;
    
    if (name.length > 1) {
      const mat = await prisma.material.upsert({
        where: { name: `PORT-${name}` },
        update: { price },
        create: {
          name: `PORT-${name}`,
          baseName: name,
          normalizedName: normalize(name),
          type: 'Aluminum',
          unit: 'm',
          price,
          category: 'Perfil'
        }
      });
      codeMap.set(normalize(name), mat.id);
    }
  }
}

async function findMaterial(name: string) {
  const cleanName = name.trim();
  const norm = normalize(cleanName);

  const codeMatId = codeMap.get(norm);
  if (codeMatId) {
    const mat = await prisma.material.findUnique({ where: { id: codeMatId } });
    if (mat) return mat;
  }

  let mat = await prisma.material.findFirst({
    where: { 
      OR: [
        { normalizedName: { contains: norm } },
        { name: { contains: cleanName, mode: 'insensitive' } }
      ]
    }
  });
  if (mat) return mat;

  const parts = cleanName.split(' ');
  if (parts.length > 1) {
    const baseCode = parts[0];
    const baseNorm = normalize(baseCode);
    const fallbackMat = await prisma.material.findFirst({
       where: { 
         OR: [
           { normalizedName: baseNorm },
           { baseName: { equals: baseCode, mode: 'insensitive' } }
         ]
       }
    });
    if (fallbackMat) return fallbackMat;
  }

  const mappedName = mappings[cleanName] || mappings[norm.toUpperCase()] || mappings[cleanName.toUpperCase()];
  if (mappedName) {
    const m = await prisma.material.findFirst({
        where: { 
            OR: [
                { name: { contains: mappedName, mode: 'insensitive' } },
                { normalizedName: normalize(mappedName) }
            ]
        }
    });
    if (m) return m;
  }

  logError(`Material not found: ${cleanName} (norm: ${norm}). Created placeholder.`);
  return await prisma.material.create({
    data: {
      name: `MISSING-${cleanName}`,
      baseName: cleanName,
      normalizedName: norm,
      type: 'Unknown',
      unit: 'un',
      price: 0,
      category: 'Desconhecido'
    }
  });
}

function getImagePath(kitName: string): string | null {
  const imageName = `${kitName}.jpg`;
  const fullPath = path.join(process.cwd(), 'public', 'tipologias', imageName);
  if (fs.existsSync(fullPath)) {
    return `/tipologias/${encodeURIComponent(imageName)}`;
  }
  return null;
}

async function importGlassKits() {
  console.log('Importing Glass kits...');
  if (!fs.existsSync(GLASS_TIPOLOGY)) return;
  const workbook = XLSX.readFile(GLASS_TIPOLOGY);
  const sheet = workbook.Sheets['BANCO DE DADOS'] || workbook.Sheets['ACESSÓRIOS'] || workbook.Sheets['Plan1'];
  if (!sheet) return;
  const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const headers = data[0] as string[];
  const getCol = (name: string) => headers.findIndex(h => h && String(h).trim().toUpperCase() === name.toUpperCase());

  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    if (!row) continue;
    const kitName = row[1] || row[getCol('NOME')];
    if (!kitName || typeof kitName !== 'string') continue;

    const imagePath = getImagePath(kitName);

    const tipology = await prisma.tipology.upsert({
      where: { id: kitName },
      update: { category: 'Vidro', imagePath },
      create: { id: kitName, name: kitName, category: 'Vidro', imagePath }
    });

    const kit = await prisma.kit.upsert({
      where: { id: kitName },
      update: { tipologyId: tipology.id },
      create: { id: kitName, name: kitName, tipologyId: tipology.id }
    });

    await prisma.kitComponent.deleteMany({ where: { kitId: kit.id } });

    const addComp = async (name: any, formula: string) => {
      if (!name) return;
      const material = await findMaterial(String(name));
      await prisma.kitComponent.create({
        data: { kitId: kit.id, materialId: material.id, quantityFormula: formula }
      });
    };

    for (let i = 1; i <= 10; i++) {
      const acIdx = getCol(`ACE-${i}`);
      const qtIdx = getCol(`QTDACE-${i}`);
      if (acIdx !== -1 && row[acIdx]) {
        await addComp(row[acIdx], String(row[qtIdx] || 1));
      }
    }

    for (let i = 1; i <= 10; i++) {
      const plIdx = getCol(`PL8-${i}`);
      const qtlIdx = getCol(`QTL8-${i}`);
      if (plIdx !== -1 && row[plIdx]) {
        await addComp(row[plIdx], `(W/1000)*${row[qtlIdx] || 1}`);
      }
      const paIdx = getCol(`PA8-${i}`);
      const qtaIdx = getCol(`QTA8-${i}`);
      if (paIdx !== -1 && row[paIdx]) {
        await addComp(row[paIdx], `(H/1000)*${row[qtaIdx] || 1}`);
      }
    }
  }
}

async function importAlumKits() {
  console.log('Importing Aluminum (Esquadrias) kits...');
  if (!fs.existsSync(ALUM_TIPOLOGY)) return;
  const workbook = XLSX.readFile(ALUM_TIPOLOGY);
  const sheet = workbook.Sheets['BANCO DE DADOS'];
  if (!sheet) return;
  const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const headers = data[0] as string[];
  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    if (!row || !row[1]) continue;
    const kitName = String(row[1]).trim();
    const imagePath = getImagePath(kitName);

    const tipology = await prisma.tipology.upsert({
      where: { id: kitName },
      update: { category: 'Esquadria', imagePath },
      create: { id: kitName, name: kitName, category: 'Esquadria', imagePath }
    });
    const kit = await prisma.kit.upsert({
      where: { id: kitName },
      update: { tipologyId: tipology.id },
      create: { id: kitName, name: kitName, tipologyId: tipology.id }
    });

    await prisma.kitComponent.deleteMany({ where: { kitId: kit.id } });

    const addComp = async (name: any, formula: string) => {
      if (!name) return;
      const material = await findMaterial(String(name));
      await prisma.kitComponent.create({
        data: { kitId: kit.id, materialId: material.id, quantityFormula: formula }
      });
    };
    for (let c = 2; c < headers.length; c++) {
      const h = String(headers[c]).toUpperCase();
      const val = row[c];
      if (!val) continue;
      if (h.startsWith('PL')) {
        const qtl = headers.findIndex(x => String(x).toUpperCase() === h.replace('PL', 'QTL'));
        const qty = qtl !== -1 ? (row[qtl] || 1) : 1;
        await addComp(val, `(W/1000)*${qty}`);
      } else if (h.startsWith('PA')) {
        const qtda = headers.findIndex(x => String(x).toUpperCase() === h.replace('PA', 'QTDA'));
        const qty = qtda !== -1 ? (row[qtda] || 1) : 1;
        await addComp(val, `(H/1000)*${qty}`);
      } else if (h.startsWith('ACE')) {
        const qtdace = headers.findIndex(x => String(x).toUpperCase() === h.replace('ACE', 'QTDACE'));
        const qty = qtdace !== -1 ? (row[qtdace] || 1) : 1;
        await addComp(val, `${qty}`);
      }
    }
  }
}

async function importPortKits() {
  console.log('Importing Portões kits...');
  if (!fs.existsSync(PORT_TIPOLOGY)) return;
  const workbook = XLSX.readFile(PORT_TIPOLOGY);
  const sheet = workbook.Sheets['LANCAR_PORTÃO'];
  if (!sheet) return;
  const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const headers = data[0] as string[];
  const getCol = (name: string) => headers.findIndex(h => String(h).trim().toUpperCase() === name);
  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    if (!row || (!row[0] && !row[getCol('MODELO DE PORTÃO')])) continue;
    const kitName = String(row[0] || row[getCol('MODELO DE PORTÃO')]).trim();
    const imagePath = getImagePath(kitName);

    const tipology = await prisma.tipology.upsert({
      where: { id: kitName },
      update: { category: 'Portão', imagePath },
      create: { id: kitName, name: kitName, category: 'Portão', imagePath }
    });
    const kit = await prisma.kit.upsert({
      where: { id: kitName },
      update: { tipologyId: tipology.id },
      create: { id: kitName, name: kitName, tipologyId: tipology.id }
    });

    await prisma.kitComponent.deleteMany({ where: { kitId: kit.id } });

    const addComp = async (name: any, formula: string) => {
      if (!name) return;
      const material = await findMaterial(String(name));
      await prisma.kitComponent.create({
        data: { kitId: kit.id, materialId: material.id, quantityFormula: formula }
      });
    };

    const xlarg = getCol('XLARG');
    const xalt = getCol('XALT');
    const quadro = getCol('QUADRO');
    if (quadro !== -1 && row[quadro]) {
      const xlVal = xlarg !== -1 ? (row[xlarg] || 1) : 1;
      const xaVal = xalt !== -1 ? (row[xalt] || 1) : 1;
      await addComp(row[quadro], `((W/1000)*${xlVal}) + ((H/1000)*${xaVal})`);
    }
    const vareta = getCol('VARETA');
    const pos = getCol('POSIÇÃO');
    const largPerf = getCol('LARG.PERFIL');
    if (vareta !== -1 && row[vareta]) {
      const lVal = largPerf !== -1 ? (row[largPerf] || 50) : 50;
      const pVal = pos !== -1 ? String(row[pos]).toUpperCase() : 'VERTICAL';
      if (pVal.includes('VERTICAL')) {
        await addComp(row[vareta], `Math.ceil(W/${lVal})*(H/1000)`);
      } else {
        await addComp(row[vareta], `Math.ceil(H/${lVal})*(W/1000)`);
      }
    }

    const socialIdx = getCol('SOCIAL');
    const mataIdx = getCol('MATA CACHORRO');
    const flags: any = {};
    if (socialIdx !== -1 && String(row[socialIdx]).toUpperCase().includes('SIM')) flags.hasSocial = true;
    if (mataIdx !== -1 && String(row[mataIdx]).toUpperCase().includes('SIM')) flags.hasMataCachorro = true;
    
    await prisma.kit.update({
      where: { id: kit.id },
      data: { flags }
    });

    for (let i = 1; i <= 21; i++) {
      const ac = getCol(`AC${i}`);
      const qt = getCol(`QT${i}`);
      if (ac !== -1 && row[ac]) {
        const qVal = qt !== -1 ? (row[qt] || 1) : 1;
        await addComp(row[ac], `${qVal}`);
      }
    }
  }
}

async function importSecondaryMaterials(filePath: string, type: 'Aluminum' | 'Accessory') {
  if (!fs.existsSync(filePath)) return;
  console.log(`Importing secondary ${type} from ${path.basename(filePath)}...`);
  const workbook = XLSX.readFile(filePath);
  const sheetName = type === 'Aluminum' ? 'ALUMINIOS' : 'ACESSÓRIOS';
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return;

  const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    if (!row) continue;
    
    let name: string | null = null;
    let code: string | null = null;
    let price: number = 0;

    if (type === 'Aluminum') {
      code = String(row[1] || row[13] || '').trim();
      name = code;
      price = Number(row[2] || row[4] || 0);
      if (code && code.length > 2 && !isNaN(price)) {
        try {
          const matName = `ALUM-${code}`;
          const normalized = normalize(code);
          const mat = await prisma.material.upsert({
            where: { name: matName },
            update: {
              price: price > 0 ? price : undefined,
              normalizedName: normalized
            }, 
            create: {
              name: matName,
              baseName: code,
              normalizedName: normalized,
              type: 'Aluminum',
              unit: 'm',
              price,
              category: 'Perfil'
            }
          });
          codeMap.set(normalized, mat.id);
        } catch (e) {
          logError(`Error upserting ALUM-${code}: ${e}`);
        }
      }
    } else {
      name = String(row[1] || '').trim();
      code = String(row[2] || '').trim();
      price = Number(row[3] || 0);
      if (name && name.length > 2 && !isNaN(price)) {
        try {
          const matName = `ACC-${name}`;
          const normalized = normalize(name);
          const mat = await prisma.material.upsert({
            where: { name: matName },
            update: {
              price: price > 0 ? price : undefined,
              normalizedName: normalized
            },
            create: {
              name: matName,
              baseName: name,
              normalizedName: normalized,
              type: 'Accessory',
              unit: 'un',
              price,
              category: 'Acessório'
            }
          });
          codeMap.set(normalized, mat.id);
          if (code) codeMap.set(normalize(code), mat.id);
        } catch (e) {
          logError(`Error upserting ACC-${name}: ${e}`);
        }
      }
    }
  }
}

async function main() {
  try {
    if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);
    await clearDatabase();
    await importMaterials();
    await importPortMaterials();
    
    await importSecondaryMaterials(ALUM_TIPOLOGY, 'Aluminum');
    await importSecondaryMaterials(ALUM_TIPOLOGY, 'Accessory');
    await importSecondaryMaterials(GLASS_TIPOLOGY, 'Aluminum');
    await importSecondaryMaterials(GLASS_TIPOLOGY, 'Accessory');
    
    await importGlassKits();
    await importAlumKits();
    await importPortKits();
    
    console.log('Seed completed successfully.');
  } catch (err: any) {
    console.error('Fatal Seed Error:', err);
    process.exit(1);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
