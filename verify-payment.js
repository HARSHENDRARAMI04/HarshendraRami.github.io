// POST /api/verify-payment  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Step 3 of Razorpay Standard Checkout: proves the payment really came from Razorpay.
// signature = HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET). Only the server knows the secret.
const cors = env => ({ "access-control-allow-origin": env.ALLOWED_ORIGIN || "", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type" });
const enc = new TextEncoder();

async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map(x => x.toString(16).padStart(2, "0")).join("");
}
function same(a, b) {   // constant-time compare, so timing reveals nothing about the signature
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export const onRequestOptions = ({ env }) => new Response(null, { status: 204, headers: cors(env) });

export async function onRequestPost({ request, env }) {
  const out = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", ...cors(env) } });
  const origin = request.headers.get("origin");
  if (env.ALLOWED_ORIGIN && origin && origin !== env.ALLOWED_ORIGIN) return out({ verified: false, error: "forbidden" }, 403);
  if (!env.RAZORPAY_KEY_SECRET) return out({ verified: false, error: "Payments are not configured on the server." }, 500);

  let b; try { b = await request.json(); } catch { return out({ verified: false, error: "Bad request." }, 400); }
  const o = b.razorpay_order_id, p = b.razorpay_payment_id, s = b.razorpay_signature;
  if ([o, p, s].some(v => typeof v !== "string" || !v)) return out({ verified: false, error: "Missing payment details." }, 400);

  const expected = await hmacHex(env.RAZORPAY_KEY_SECRET, o + "|" + p);
  if (!same(expected, s.toLowerCase())) return out({ verified: false, error: "Signature mismatch." }, 400);   // do not treat as paid
  return out({ verified: true, order_id: o, payment_id: p });
}
