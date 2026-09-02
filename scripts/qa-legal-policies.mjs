import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const base = process.env.LEGAL_BASE_URL || "http://127.0.0.1:4321";
const outputDir = join(process.cwd(), "artifacts", "legal-policy-qa");
mkdirSync(outputDir, { recursive: true });

const policies = [
  { route: "/privacy-policy/", heading: "Privacy Policy", id: "VkRKSFZHNHZiVU5wYkVSck5HYzlQUT09" },
  { route: "/terms/", heading: "Terms of Service", id: "YVVaUVpVb3hVa0ppT1V4UVJYYzlQUT09" },
  { route: "/disclaimer/", heading: "Disclaimer", id: "YlVNMEszZHhZMVkyY0RSQlkxRTlQUT09" },
];

const browser = await chromium.launch({ headless: true });
const report = [];
let failed = false;

for (const viewport of [
  { name: "desktop", width: 1440, height: 1000, isMobile: false },
  { name: "mobile", width: 390, height: 844, isMobile: true },
]) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
    deviceScaleFactor: 1,
  });

  for (const policy of policies) {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console: ${message.text()}`);
    });

    const response = await page.goto(`${base}${policy.route}`, { waitUntil: "load", timeout: 60_000 });
    await page.locator(`#${policy.id}`).waitFor({ state: "visible", timeout: 30_000 });
    await page.waitForFunction(
      (id) => document.getElementById(id)?.getAttribute("aria-busy") === "false",
      policy.id,
      { timeout: 60_000 },
    );

    const state = await page.evaluate(({ id }) => {
      const root = document.getElementById(id);
      const links = [...document.querySelectorAll(".legal-links a")].map((link) => ({
        text: link.textContent?.trim(),
        href: link.getAttribute("href"),
        reload: link.hasAttribute("data-astro-reload"),
      }));
      return {
        title: document.title,
        h1: document.querySelector("h1")?.textContent?.trim(),
        viewportWidth: window.innerWidth,
        documentClientWidth: document.documentElement.clientWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        policyClientWidth: root?.clientWidth,
        policyScrollWidth: root?.scrollWidth,
        busy: root?.getAttribute("aria-busy"),
        providerState: root?.dataset.termageddonState,
        policyHeadings: root ? [...root.querySelectorAll("h1, h2, h3")].map((heading) => heading.textContent?.replace(/\s+/g, " ").trim()) : [],
        visibleText: root ? [...root.querySelectorAll("h1, h2, h3, p, li")].map((element) => element.textContent?.replace(/\s+/g, " ").trim()).filter(Boolean).join(" ") : "",
        links,
      };
    }, { id: policy.id });

    const expectedLinks = ["/privacy-policy/", "/terms/", "/disclaimer/"];
    const checks = {
      http200: response?.status() === 200,
      h1: state.h1 === policy.heading,
      loaded: state.busy === "false" && state.providerState === "loaded",
      substantive: state.visibleText.length > 150 && state.policyHeadings.includes(policy.heading),
      exactViewport: state.viewportWidth === viewport.width,
      noDocumentOverflow: state.documentScrollWidth === state.documentClientWidth,
      noPolicyOverflow: state.policyScrollWidth === state.policyClientWidth,
      footer: expectedLinks.every((href) => state.links.some((link) => link.href === href && link.reload)),
      noFloatingSignupOverlap: await page.locator("[data-email-popup]").count() === 0,
      noConsoleErrors: errors.length === 0,
    };

    const screenshot = join(outputDir, `${viewport.name}-${policy.heading.toLowerCase().replaceAll(" ", "-")}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    const passed = Object.values(checks).every(Boolean);
    if (!passed) failed = true;
    report.push({ viewport: viewport.name, route: policy.route, screenshot, passed, checks, state, errors });
    await page.close();
  }
  await context.close();
}

await browser.close();
writeFileSync(join(outputDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failed) process.exit(1);
