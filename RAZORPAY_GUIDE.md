# Razorpay: how it works and how to change anything

## How the pieces fit
```
Visitor's browser (your GitHub Pages site)
   1. picks a currency and amount
   2. asks YOUR Worker: "make an order for 5 USD"          (no keys in the browser)
Cloudflare Worker (worker/index.js + functions/api/order.js)
   3. checks the request, then asks Razorpay to create the order using your secret key
   4. returns the order id and your public Key Id
Browser
   5. opens Razorpay's payment popup with that order; the visitor pays Razorpay directly
```
Your site never sees card details, and your Key Secret never leaves Cloudflare.

## Where every value lives
| Value | Secret? | Where it lives | How to change |
|---|---|---|---|
| Key Secret | Yes | `.env` on your computer, then encrypted on Cloudflare | edit `.env`, run `npm run deploy:worker` |
| Key Id | No (Razorpay shows it in every checkout), kept with the secret | same as above | same |
| Your site address | No | `.env` as `SITE_ORIGIN`, set on the Worker as `ALLOWED_ORIGIN` | edit `.env`, run `npm run deploy:worker` |
| Worker URL | No | `checkoutEndpoint` in `data.js` | written by the deploy command, then `git push` |
| UPI ID, PayPal name, email, links | No (visitors see them) | `data.js` | edit, `git push` |

`.env` never reaches GitHub, so GitHub Pages cannot read it. That is by design: a static page can only hold public values. Anything secret has to live on the server side, which is the Worker.

## First-time setup
Follow DEPLOY.md section 3.

## Changing things later

**Change or rotate the keys** (leaked, expired, or you made new ones)
1. Razorpay dashboard > Account & Settings > API Keys > regenerate (or generate new). Copy both values. Check Razorpay's note on how long the old key keeps working.
2. Put the new values in `.env`.
3. Run `npm run deploy:worker`. Done. No change to the website and no `git push` is needed, because the site gets the Key Id from the Worker at checkout time.

**Switch from test to live**
1. In Razorpay, switch to Live Mode and generate Live keys (needs KYC done).
2. In `.env`, replace both keys with the `rzp_live_...` ones.
3. `npm run deploy:worker`. The command prints "Mode: LIVE" so you know which one you are on.
To go back to test, put the test keys back and redeploy.

**Change your site address** (new domain, new repo name, switching to a custom domain)
Edit `SITE_ORIGIN` in `.env` (origin only, e.g. `https://pay.example.com`) and run `npm run deploy:worker`. If you skip this, payments fail with "Could not start payment", because the Worker only accepts requests from the address you set.

**Change the Worker name or URL**
Edit `name` in `wrangler.toml`, run `npm run deploy:worker`, then `git add data.js && git commit -m "Payment endpoint" && git push`. The command updates `checkoutEndpoint` for you. (Custom Worker domains: set `checkoutEndpoint` in `data.js` by hand.)

**Change the currencies**
Three places must agree:
1. `OK` list at the top of `functions/api/order.js` (what the server accepts).
2. `COINS` list in `app.js` (the rings visitors see; each entry is `[code, symbol]`).
3. `fallbackRates` in `data.js` (used only if the live rate lookup fails).
Then `npm run deploy:worker` and `git push`. Use currencies with two decimals. Razorpay must have enabled each currency on your account (International Payments).

**Change the amounts**
Preset amounts: `amounts` in `data.js` (in rupees; other currencies convert from them).
Smallest and largest gift: in `functions/api/order.js`, `amount >= 100` and `amount > 5000000` are in the smallest unit (100 = 1.00, 5000000 = 50,000.00). Redeploy the Worker after changing them.

**Change what the popup says or looks like**
`app.js`, in the `rzp` click handler: `name`, `description`, and `theme.color`.

**Turn the popup off**
Set `checkoutEndpoint: ""` in `data.js` and push. UPI, PayPal and the Payment Page link keep working.

**Use a Razorpay Payment Page instead of the popup**
Create the page in Razorpay, paste its link into `paymentPageUrl` in `data.js`, and leave `checkoutEndpoint` empty. It cannot receive the amount picked on your site.

## Razorpay dashboard checklist
- [ ] KYC finished (needed for Live Mode and settlements).
- [ ] International Payments requested and approved (needed for USD, EUR and other non-INR orders; Razorpay decides, and some foreign cards can still be declined).
- [ ] Payment capture set to automatic (Settings). Payments that stay only "authorized" are refunded to the payer after a few days.
- [ ] Email notifications on, so you are told about each payment.
- [ ] Optional: a webhook if you later want automatic thank-you emails. Not needed for donations.
Fees: roughly 2% + GST domestic and 3% + GST international at the time of writing. Check razorpay.com/pricing for current rates.

## Troubleshooting
Watch the Worker live while you test: `npm run logs:worker`.

| What you see | Likely cause | Fix |
|---|---|---|
| Pay button missing | `checkoutEndpoint` empty | run `npm run deploy:worker`, push `data.js` |
| "Could not start payment" at once | `SITE_ORIGIN` does not match the live site (403) | fix `.env`, redeploy Worker |
| Same, and logs show a 502 | wrong keys, or currency not enabled | check keys in `.env` (test vs live), check International Payments |
| Works in INR, fails in USD/EUR | International Payments not approved | request it in the dashboard |
| Popup opens but rejects the card | test card in live mode, or the reverse | match the key mode to the card |
| Old key still in use after changing `.env` | forgot to redeploy | `npm run deploy:worker` |
| Changes to CSS/JS not showing | browser cache | hard refresh (Ctrl+Shift+R) |

## Rules to keep it safe
- Never paste the Key Secret into `data.js`, `app.js`, chat, screenshots or GitHub.
- If it leaks, regenerate the keys at once (see above) and redeploy.
- Keep `.env` out of git: it is already listed in `.gitignore`.
