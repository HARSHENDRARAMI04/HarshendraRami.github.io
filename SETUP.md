# Setup

## Hosting on GitHub Pages (full steps in DEPLOY.md)
The site is plain static files, so GitHub Pages works: push this folder to a repo, then Settings > Pages > deploy from the main branch. Every push updates the live site with no downtime. Pages is free for public repos. Nothing here needs a server, except the optional card popup in section 3.

## 0. Adding work
Add each new product at the top of `products` in `data.js` (newest first). The home page shows the first 2. Once you have 3 or more, a "See all work" button appears and opens `works.html`, which lists everything with type filters. Styles and scripts are shared (`style.css`, `app.js`, `moods.js`), so there is one place to change them.

## 1. Resume and contact
- **Resume:** put your PDF next to `index.html` (e.g. `resume.pdf`) and set `resume: "resume.pdf"` in `data.js`. A "Resume" link appears in the intro and the contact section.
- **Contact form (optional):** without setup, "Send message" opens the visitor's email app, addressed to you. To receive messages directly, make a free Formspree form (paste its URL in `contact.formEndpoint`) or a Web3Forms key (paste the URL in `formEndpoint` and the key in `accessKey`). Both are static-site friendly, no server of your own.

## 2. Currencies and simple payments
Currency rates load live in the visitor's browser (open.er-api.com). If that ever fails, the fallback rates in `data.js` are used.
- **UPI (INR only):** works now, free. If you change your UPI ID, replace your QR image too.
- **PayPal.Me:** put your PayPal.Me name in `paypalMe`. The button opens PayPal with the chosen amount and currency filled in. Check your PayPal account type can receive payments in India.
- **Razorpay Payment Page:** create a Payment Page in the Razorpay dashboard and paste its link in `paymentPageUrl`. It shows as "Card or international". It cannot receive the amount picked on your site.

All three are plain links, so they work on GitHub Pages as is.

## 3. Card popup in any currency
All of this is built. You only supply your Razorpay keys. See DEPLOY.md (section 3) for the steps and RAZORPAY_GUIDE.md for how to change anything later.

## 4. Moods
Nothing to configure. The eight moods play one after another from a shuffled deck, so none repeats until all eight have been seen, and the same mood never appears twice in a row. The deck is the same for the floating pickups and the "Surprise me" link. Floating pickups drift toward the mouse when it comes close. Colours live in the `:root[data-vibe="..."]` lines in `style.css`. A mood lasts 12 seconds and each click on its object adds time. Visitors with "reduce motion" on never get floating pickups, but "Surprise me" still works.

## 5. Scroll effects and the living name
Nothing to configure. Sections rise in as you reach them, a thin line across the top fills as you scroll, and the menu underlines the section you are in. The letters of your name shy away from the mouse, drift apart as you scroll, and scatter when tapped. All of it switches off for visitors with "reduce motion" on.
