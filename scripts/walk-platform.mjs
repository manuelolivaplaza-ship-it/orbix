import { chromium } from "playwright";

const base = process.env.ORBIX_URL || "http://localhost:3010";
const dir = process.argv[2] || "tmp-verify";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (err) => {
  errors.push(`${page.url()} ${err}`);
  console.error("PAGEERROR", page.url(), err);
});

async function shot(name, path, waitFor) {
  await page.goto(base + path, { waitUntil: "domcontentloaded" });
  if (waitFor) await page.waitForSelector(waitFor, { timeout: 15000 });
  await page.waitForTimeout(400);
  const text = await page.locator("body").innerText();
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
  return text;
}

const dash = await shot("dashboard-ops", "/dashboard", "text=Ingresos cobrados");
if (!dash.includes("$19.504.100")) {
  console.error(dash.slice(0, 1200));
  throw new Error("dash metric");
}
if (!dash.includes("Inbox de trabajo")) throw new Error("missing inbox");

const fact = await shot("facturacion-v2", "/facturacion");
if (!fact.includes("Pipeline")) throw new Error("fact tabs");

const cob = await shot("cobranza", "/facturacion/cobranza");
if (!cob.includes("Cobranza")) throw new Error("cobranza");

const caja = await shot("caja", "/caja");
if (!caja.includes("Cartola")) throw new Error("caja cartola");

const cerrar = await shot("cerrar-mes", "/sueldos/cerrar");
if (!cerrar.includes("Cerrar mes")) throw new Error("cerrar");

const ficha = await shot("ficha-360", "/sueldos/emp-1");
if (!ficha.includes("Camila")) throw new Error("ficha");

const emp = await shot("empresas-cons", "/empresas");
if (!emp.includes("Cobrados")) throw new Error("empresas");

const portal = await shot("portal-cliente", "/p/pt-inv-3");
if (!portal.includes("F-1044")) throw new Error("portal");

await shot("portal-colab", "/mi");
await shot("detalle-factura", "/facturacion/inv-3");
await shot("detalle-cotizacion", "/facturacion/inv-16");

await page.goto(base + "/dashboard", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(400);
await page.keyboard.press("Control+k");
await page.waitForTimeout(500);
await page.screenshot({ path: `${dir}/command-k.png` });

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base + "/dashboard", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(600);
await page.screenshot({ path: `${dir}/dashboard-mobile.png`, fullPage: true });

if (errors.length) {
  console.error("page errors", errors);
  process.exit(1);
}
console.log("walk ok", {
  inbox: dash.includes("Inbox de trabajo"),
  quote: fact.includes("C-0088"),
  cobranza: cob.includes("1–30") || cob.includes("Al día"),
  caja: caja.includes("Saldo en banco"),
  portal: portal.includes("Pagar"),
});
await browser.close();
