// The same two functions, packaged as one Cloudflare Worker (for a site hosted on GitHub Pages).
//   POST /              or /create-order   -> create a Razorpay order
//   POST /verify-payment                   -> check the payment signature
import { onRequestPost as createOrder, onRequestOptions } from "../functions/api/order.js";
import { onRequestPost as verifyPayment } from "../functions/api/verify-payment.js";
export default {
  fetch(request, env) {
    if (request.method === "OPTIONS") return onRequestOptions({ env });
    const path = new URL(request.url).pathname.replace(/\/+$/, "");
    if (request.method === "POST" && path === "/verify-payment") return verifyPayment({ request, env });
    if (request.method === "POST" && (path === "" || path === "/create-order")) return createOrder({ request, env });
    return new Response("Not found", { status: 404 });
  }
};
