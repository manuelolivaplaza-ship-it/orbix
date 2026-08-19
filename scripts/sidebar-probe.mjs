import { chromium } from "playwright";

const base = process.env.ORBIX_URL || "http://localhost:3010";
const scratch = process.argv[2] || "tmp-verify";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (err) => errors.push(String(err)));

await page.goto(base + "/dashboard", { waitUntil: "domcontentloaded" });
await page.waitForSelector("text=Ingresos cobrados", { timeout: 20000 });
await page.waitForTimeout(1400);

const metrics = await page.evaluate(() => {
  const aside = document.querySelector('[data-slot="sidebar"]') || document.querySelector('[data-sidebar="sidebar"]');
  const inner = document.querySelector('[data-slot="sidebar-inner"]') || document.querySelector('[data-sidebar="sidebar"]');
  const orb = document.querySelector('[data-sidebar="header"] svg');
  const icon = document.querySelector('[data-sidebar="menu-button"] .sidebar-icon svg');
  const rect = (inner || aside)?.getBoundingClientRect();
  return {
    width: rect ? Math.round(rect.width) : null,
    orb: orb ? Math.round(orb.getBoundingClientRect().width) : null,
    icon: icon ? Math.round(icon.getBoundingClientRect().width) : null,
    pathLength: icon?.querySelector("path")?.getAttribute("pathLength"),
  };
});

await page.screenshot({ path: `${scratch}/sidebar.png` });

const facturacion = page.locator('[data-sidebar="menu-button"]', { hasText: "Facturación" }).first();
await facturacion.hover();
await page.waitForTimeout(280);
await page.screenshot({ path: `${scratch}/sidebar-hover.png` });

console.log(JSON.stringify({ metrics, errors }, null, 2));
if (metrics.width && metrics.width > 230) {
  console.error("sidebar still too wide", metrics.width);
  process.exitCode = 1;
}
if (metrics.orb && metrics.orb < 32) {
  console.error("orb not larger", metrics.orb);
  process.exitCode = 1;
}
await browser.close();
