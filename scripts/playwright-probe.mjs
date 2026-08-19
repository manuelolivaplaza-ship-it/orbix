import { chromium } from "playwright";

const base = process.env.ORBIX_URL || "http://localhost:3010";
const scratch = process.argv[2];
if (!scratch) {
  console.error("usage: node scripts/playwright-probe.mjs <scratch>");
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (err) => errors.push(String(err)));

await page.goto(base + "/", { waitUntil: "domcontentloaded" });
await page.waitForSelector("h1", { timeout: 15000 });
const landingText = await page.locator("body").innerText();
if (!landingText.includes("Conoce a") || !landingText.includes("Orbix")) {
  throw new Error("landing missing headline");
}
if (landingText.includes("manuela@andestec.cl") || landingText.includes("orbix123")) {
  throw new Error("landing still exposes demo credentials");
}
await page.screenshot({ path: `${scratch}/landing.png`, fullPage: true });

await page.goto(base + "/login", { waitUntil: "domcontentloaded" });
await page.waitForSelector("form", { timeout: 15000 });
const loginText = await page.locator("body").innerText();
if (loginText.includes("manuela@andestec.cl") || loginText.includes("orbix123")) {
  throw new Error("login still prefilled with demo credentials");
}
const emailValue = await page.locator("input[type=email]").inputValue();
const passValue = await page.locator("input[type=password]").inputValue();
if (emailValue || passValue) throw new Error("login fields must start empty");
await page.screenshot({ path: `${scratch}/login.png`, fullPage: false });

await page.goto(base + "/dashboard", { waitUntil: "domcontentloaded" });
await page.waitForURL(/\/login/, { timeout: 15000 });
await page.screenshot({ path: `${scratch}/dashboard-redirect.png`, fullPage: false });

await page.mouse.move(200, 200);
await page.mouse.move(800, 400);

if (errors.length) {
  console.error("page errors", errors);
  process.exit(1);
}
console.log("playwright ok", { landing: landingText.slice(0, 80), loginRedirects: true });
await browser.close();
