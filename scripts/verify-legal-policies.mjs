import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

const policies = [
  {
    file: "src/components/PrivacyPolicyContent.astro",
    id: "VkRKSFZHNHZiVU5wYkVSck5HYzlQUT09",
    route: "/privacy-policy/",
  },
  {
    file: "src/pages/terms.astro",
    id: "YVVaUVpVb3hVa0ppT1V4UVJYYzlQUT09",
    route: "/terms/",
  },
  {
    file: "src/pages/disclaimer.astro",
    id: "YlVNMEszZHhZMVkyY0RSQlkxRTlQUT09",
    route: "/disclaimer/",
  },
];

for (const policy of policies) {
  const source = read(policy.file);
  assert.match(source, new RegExp(policy.id), `${policy.file} must use the supplied Termageddon policy ID`);
  assert.match(source, /TermageddonPolicy/, `${policy.file} must render the shared policy loader`);
  if (policy.file.startsWith("src/pages/")) {
    assert.match(source, /hideEmailSignup=\{true\}/, `${policy.file} must suppress the floating signup tab`);
  }
  assert.doesNotMatch(source, /Draft legal page|\[APPROVAL REQUIRED:/, `${policy.file} must not contain placeholder legal copy`);
}

const component = read("src/components/TermageddonPolicy.astro");
assert.match(component, /https:\/\/policies\.termageddon\.com\/api\/policy\//, "fallback policy URL must use HTTPS");
assert.match(component, /https:\/\/embed\.termageddon\.com\/api\/render\//, "loader must call the resilient render endpoint");
assert.match(component, /aria-busy="true"/, "policy must announce its initial loading state");
assert.match(component, /response\.ok/, "loader must reject unsuccessful provider responses");
assert.match(component, /aria-busy.*false/, "policy must clear its busy state after loading");

assert.match(read("src/pages/privacy-policy.astro"), /hideEmailSignup=\{true\}/, "privacy page must suppress the floating signup tab");

const footer = read("src/components/Footer.astro");
for (const { route } of policies) {
  assert.match(footer, new RegExp(`href=["']${route.replaceAll("/", "\\/")}["']`), `footer must link to ${route}`);
}
assert.match(footer, /data-astro-reload/, "legal footer links must force a clean document load");

const routes = read("src/lib/site.ts");
assert.match(routes, /path: "\/disclaimer\/"/, "public routes must include the disclaimer");
assert.match(routes, /path: "\/terms\/", label: "Terms of Service"/, "public routes must name the Terms of Service");

console.log("Legal policy acceptance contract passed for 3 Termageddon routes.");
