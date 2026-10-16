// Same function, packaged as a standalone Cloudflare Worker (for when the site lives on GitHub Pages).
import { onRequestPost, onRequestOptions } from "../functions/api/order.js";
export default {
  fetch(request, env) {
    if (request.method === "OPTIONS") return onRequestOptions({ env });
    if (request.method === "POST") return onRequestPost({ request, env });
    return new Response("Not found", { status: 404 });
  }
};
