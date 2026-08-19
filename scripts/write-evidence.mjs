import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { jsPDF } = require("jspdf");
const XLSX = require("xlsx");

const scratch = process.argv[2];
if (!scratch) {
  console.error("usage: node scripts/write-evidence.mjs <scratch-dir>");
  process.exit(1);
}

mkdirSync(scratch, { recursive: true });

const rows = [
  {
    Folio: "F-1042",
    Cliente: "Mercado Norte SpA",
    Estado: "pagada",
    Emision: "2026-03-04",
    Vencimiento: "2026-04-03",
    Neto: 6050000,
    IVA: 1149500,
    Total: 7199500,
  },
  {
    Folio: "F-1043",
    Cliente: "Clínica del Valle",
    Estado: "enviada",
    Emision: "2026-07-12",
    Vencimiento: "2026-08-11",
    Neto: 1760000,
    IVA: 334400,
    Total: 2094400,
  },
];

const workbook = XLSX.utils.book_new();
const sheet = XLSX.utils.json_to_sheet(rows);
XLSX.utils.book_append_sheet(workbook, sheet, "Facturas");
const excel = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
writeFileSync(resolve(scratch, "export.xlsx"), excel);

const doc = new jsPDF({ unit: "pt", format: "a4" });
doc.setFillColor(10, 10, 10);
doc.rect(0, 0, 595, 72, "F");
doc.setTextColor(245, 78, 0);
doc.setFontSize(18);
doc.text("Orbix", 40, 44);
doc.setTextColor(255, 255, 255);
doc.setFontSize(12);
doc.text("Reportes Orbix", 120, 44);
doc.setTextColor(20, 20, 20);
doc.setFontSize(10);
let y = 100;
for (const row of rows) {
  doc.text(
    `${row.Folio} · ${row.Cliente} · ${row.Estado} · Neto ${row.Neto} · IVA ${row.IVA} · Total ${row.Total}`,
    40,
    y,
  );
  y += 16;
}
writeFileSync(resolve(scratch, "export.pdf"), Buffer.from(doc.output("arraybuffer")));

console.log("wrote", resolve(scratch, "export.xlsx"), resolve(scratch, "export.pdf"));
void dirname;
void pathToFileURL;
