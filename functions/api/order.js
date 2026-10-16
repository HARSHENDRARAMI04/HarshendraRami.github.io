// POST /api/order  { amount, currency }  ->  { id, amount, currency, key }
// Creates a Razorpay order so the checkout popup can take payment in the donor's currency.
// Secrets (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) live in the host's settings, never in the repo.
// Set ALLOWED_ORIGIN (e.g. https://yourname.github.io) when the site is hosted somewhere else.
const OK = new Set(["INR", "USD", "EUR", "GBP", "AUD", "CAD", "SGD", "AED"]);
const cors = env => ({ "access-control-allow-origin": env.ALLOWED_ORIGIN || "", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type" });

export const onRequestOptions = ({ env }) => new Response(null, { status: 204, headers: cors(env) });

export async function onRequestPost({ request, env }) {
  const out = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", ...cors(env) } });
  const origin = request.headers.get("origin");   // browsers always send this; refuse other websites
  if (env.ALLOWED_ORIGIN && origin && origin !== env.ALLOWED_ORIGIN) return out({ error: "forbidden" }, 403);
  let b; try { b = await request.json(); } catch { return out({ error: "bad request" }, 400); }
  const cur = String(b.currency || "").toUpperCase(), amount = Math.round(Number(b.amount) * 100);
  if (!OK.has(cur) || !(amount >= 100) || amount > 5000000) return out({ error: "invalid amount" }, 400);
  const r = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Basic " + btoa(env.RAZORPAY_KEY_ID + ":" + env.RAZORPAY_KEY_SECRET) },
    body: JSON.stringify({ amount, currency: cur, receipt: "coffee_" + Date.now() })
  });
  const o = await r.json();

if (!r.ok) {
  // Log the gateway's response for debugging.
  // Do not log your Razorpay key or secret.
  console.error("Razorpay order creation failed:", r.status, o);

  return out({
    error: "gateway",
    status: r.status,
    reason: o?.error?.description || o?.error?.reason || "Unknown Razorpay error"
  }, 502);
}
  return out({
  order_id: o.id,
  amount: o.amount,
  currency: o.currency,
  key: env.RAZORPAY_KEY_ID
});
}
