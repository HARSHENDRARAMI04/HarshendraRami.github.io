// One command to (re)deploy the payment function:  npm run deploy:worker
// Reads .env, deploys the Worker, stores the Razorpay keys as encrypted secrets on Cloudflare,
// and writes the Worker's public URL into data.js (checkoutEndpoint).
// Add --dry to see what it would do without touching anything.
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const dry = process.argv.includes("--dry");
const fail = m => { console.error("\n" + m + "\n"); process.exit(1); };

let raw; try { raw = readFileSync(process.env.ENV_FILE || ".env", "utf8"); } catch { fail("No .env file found. Copy .env.example to .env and fill it in."); }
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = /^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/.exec(line);
  if (m && !line.trim().startsWith("#")) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const missing = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "SITE_ORIGIN"].filter(k => !env[k]);
if (missing.length) fail("Fill these in .env first: " + missing.join(", "));
if (!/^rzp_(test|live)_\w+$/.test(env.RAZORPAY_KEY_ID)) fail("RAZORPAY_KEY_ID should start with rzp_test_ or rzp_live_.");
if (!/^https:\/\/[^/\s]+$/.test(env.SITE_ORIGIN)) fail("SITE_ORIGIN must be the origin only, like https://yourname.github.io (no path, no trailing slash).");
console.log("Mode:", env.RAZORPAY_KEY_ID.startsWith("rzp_live_") ? "LIVE (real money)" : "TEST (no real money)", "| Site:", env.SITE_ORIGIN);

function wrangler(args, input) {
  if (dry) { console.log("[dry] wrangler " + args.join(" ")); return { status: 0, stdout: "https://coffee-orders.example.workers.dev" }; }
  const r = spawnSync("npx", ["--yes", "wrangler@4", ...args], { input, shell: true, encoding: "utf8" });
  process.stdout.write(r.stdout || ""); process.stderr.write(r.stderr || "");
  return r;
}

const d = wrangler(["deploy", "--var", "ALLOWED_ORIGIN:" + env.SITE_ORIGIN]);
if (d.status !== 0) fail("Deploy failed. If it asked you to log in, run:  npx wrangler login   and try again.");
for (const k of ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"]) {
  const s = wrangler(["secret", "put", k], env[k] + "\n");
  if (s.status !== 0) fail("Could not store " + k + ".");
}

const url = ((d.stdout || "") + (d.stderr || "")).match(/https:\/\/[\w.-]+\.workers\.dev/);
if (!url) fail("Deployed, but I could not read the Worker URL. Copy it from the output above into data.js as checkoutEndpoint.");
if (dry) { console.log("[dry] would set checkoutEndpoint to", url[0]); process.exit(0); }
const data = readFileSync("data.js", "utf8");
if (!/checkoutEndpoint:\s*"[^"]*"/.test(data)) fail("checkoutEndpoint not found in data.js.");
writeFileSync("data.js", data.replace(/checkoutEndpoint:\s*"[^"]*"/, 'checkoutEndpoint: "' + url[0] + '"'));
console.log("\nDone. data.js now points at " + url[0] + "\nNext: git add data.js && git commit -m \"Set payment endpoint\" && git push");
