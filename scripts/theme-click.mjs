import { chromium } from "playwright";

const base = process.env.ORBIX_URL || "http://localhost:3010";
const scratch = process.argv[2] || "tmp-verify";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (err) => errors.push(String(err)));

await page.addInitScript(() => localStorage.setItem("orbix-theme", "light"));
await page.goto(base + "/", { waitUntil: "domcontentloaded" });
await page.waitForSelector("h1", { timeout: 20000 });
await page.waitForTimeout(1200);

const landing = await page.locator("body").innerText();
const htmlClass = await page.locator("html").getAttribute("class");
const hasPreview = landing.includes("Escritorio") || landing.includes("Andes Tecnología");
await page.screenshot({ path: `${scratch}/light-landing-wait.png`, fullPage: false });

const toggle = page.getByRole("button", { name: /Cambiar a modo oscuro/i });
await toggle.click();
await page.waitForTimeout(400);
const afterClass = await page.locator("html").getAttribute("class");
await page.screenshot({ path: `${scratch}/toggle-to-dark.png`, fullPage: false });

await page.goto(base + "/configuracion", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(800);
await page.getByRole("tab", { name: /Cuenta/i }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${scratch}/light-cuenta.png`, fullPage: false });

console.log(
  JSON.stringify(
    {
      hasPreview,
      htmlClass,
      afterClass,
      errors,
      landingHasConoce: landing.includes("Conoce a"),
    },
    null,
    2,
  ),
);
if (!hasPreview) process.exitCode = 1;
if (!afterClass?.includes("dark")) process.exitCode = 1;
await browser.close();
