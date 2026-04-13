import * as XLSX from "xlsx"
import * as path from "path"

const filePath = "C:\\SISTEMPER 2025\\SISTEMPER.xlsm"

async function analyze() {
  try {
    const workbook = XLSX.readFile(filePath)
    const sheets = workbook.SheetNames
    console.log("Sheets:", sheets)

    const glassSheetName = sheets.find(s => s.toLowerCase().includes("vidro"))
    if (glassSheetName) {
      const sheet = workbook.Sheets[glassSheetName]
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      console.log(`Sample from ${glassSheetName}:`, JSON.stringify(data.slice(0, 10), null, 2))
    }

    const aluminumSheetName = sheets.find(s => s.toLowerCase().includes("esquadria") || s.toLowerCase().includes("perfil"))
    if (aluminumSheetName) {
      const sheet = workbook.Sheets[aluminumSheetName]
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      console.log(`Sample from ${aluminumSheetName}:`, JSON.stringify(data.slice(0, 10), null, 2))
    }
  } catch (error) {
    console.error("Error reading Excel:", error)
  }
}

analyze()
