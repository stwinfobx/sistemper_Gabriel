import * as XLSX from 'xlsx';

const files = [
    'C:/SISTEMPER 2025/TIPOLOGIA VIDRO TEMPERADO.xlsm',
    'C:/SISTEMPER 2025/TIPOLOGIA ESQUADRIAS.xlsm',
    'C:/SISTEMPER 2025/TIPOLOGIA PORTÕES E GRADIL.xlsm',
    'C:/SISTEMPER 2025/SISTEMPER.xlsm'
];

files.forEach(file => {
    try {
        const workbook = XLSX.readFile(file);
        console.log(`File: ${file}`);
        console.log('Sheets:', workbook.SheetNames.join(', '));
        console.log('---');
    } catch (e: any) {
        console.error(`Error reading ${file}:`, e.message);
    }
});
