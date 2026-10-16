// POST /api/order  { amount, currency }  ->  { order_id, amount, currency, key }
// Step 1 of Razorpay Standard Checkout: creates an order on Razorpay using the secret key.
// Secrets (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) live in the host's settings, never in the repo.
// Set ALLOWED_ORIGIN (e.g. https://yourname.github.io) when the site is hosted somewhere else.
const OK = new Set(["INR", "USD", "EUR", "GBP", "AUD", "CAD", "SGD", "AED"]);
const cors = env => ({ "access-control-allow-origin": env.ALLOWED_ORIGIN || "", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type" });

export const onRequestOptions = ({ env }) => new Response(null, { status: 204, headers: cors(env) });

export async function onRequestPost({ request, env }) {
  const out = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", ...cors(env) } });
  const origin = request.headers.get("origin");   // browsers always send this; refuse other websites
  if (env.ALLOWED_ORIGIN && origin && origin !== env.ALLOWED_ORIGIN) return out({ error: "forbidden" }, 403);
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return out({ error: "Payments are not configured on the server." }, 500);

  let b; try { b = await request.json(); } catch { return out({ error: "Bad request." }, 400); }
  const cur = String(b.currency || "").toUpperCase(), amount = Math.round(Number(b.amount) * 100);   // smallest unit (paise for INR)
  if (!OK.has(cur)) return out({ error: "That currency is not supported." }, 400);
  if (!(amount >= 100)) return out({ error: "The smallest amount is 1.00." }, 400);
  if (amount > 5000000) return out({ error: "The largest amount is 50,000." }, 400);

  let r, o;
  try {
    r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Basic " + btoa(env.RAZORPAY_KEY_ID + ":" + env.RAZORPAY_KEY_SECRET) },
      body: JSON.stringify({ amount, currency: cur, receipt: "coffee_" + Date.now() })
    });
    o = await r.json();
  } catch { return out({ error: "Could not reach Razorpay." }, 500); }
  if (r.status === 401) return out({ error: "Razorpay rejected the server's keys." }, 401);   // wrong or mismatched key id / secret
  if (!r.ok) return out({ error: (o && o.error && o.error.description) || "Razorpay could not create the order." }, 500);
  return out({ order_id: o.id, amount: o.amount, currency: o.currency, key: env.RAZORPAY_KEY_ID });
}
