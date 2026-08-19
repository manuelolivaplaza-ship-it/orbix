import { chromium } from "playwright";

const base = process.env.ORBIX_URL || "http://localhost:3010";
const scratch = process.argv[2];
if (!scratch) {
  console.error("usage: node scripts/theme-probe.mjs <scratch>");
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });

async function shot(theme, name, path, extra) {
  const page = await browser.newPage({
    viewport: name.includes("mobile") ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  });
  await page.addInitScript((t) => {
    localStorage.setItem("orbix-theme", t);
  }, theme);
  await page.goto(base + path, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  if (extra) await extra(page);
  await page.screenshot({ path: `${scratch}/${theme}-${name}.png`, fullPage: name !== "dashboard-fold" });
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.close();
  return bg;
}

const lightBg = await shot("light", "landing", "/");
const darkBg = await shot("dark", "landing", "/");
await shot("light", "login", "/login");
await shot("light", "dashboard", "/dashboard");
await shot("light", "dashboard-mobile", "/dashboard");
await shot("light", "config", "/configuracion");
await shot("light", "facturacion", "/facturacion");
await shot("dark", "dashboard", "/dashboard");

console.log("theme-probe ok", { lightBg, darkBg });
if (lightBg === darkBg) {
  console.error("light and dark body backgrounds are identical");
  process.exit(1);
}
await browser.close();
