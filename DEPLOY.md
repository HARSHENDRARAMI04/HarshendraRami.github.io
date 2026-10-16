# Deploy checklist

You need: a GitHub account, Git, Node 18 or newer, and a free Cloudflare account (for the payment function only).

## 1. Before the first push
- [ ] `data.js`: fill `resume`, `paypalMe` (if you use it), `contact.formEndpoint` (if you want direct messages), and check your UPI ID, email and links.
- [ ] Put `resume.pdf` next to `index.html` if you set `resume`.
- [ ] `.env` stays on your computer. Confirm git ignores it: `git check-ignore -v .env` should print a line.

## 2. Put the site on GitHub Pages
```
git init
git add .
git status            # .env must NOT be listed
git commit -m "First version"
git branch -M main
git remote add origin https://github.com/YOURNAME/YOURREPO.git
git push -u origin main
```
Then on GitHub: repo > Settings > Pages > Source: "Deploy from a branch", Branch: `main`, folder `/ (root)` > Save. In a minute the site is live at `https://YOURNAME.github.io/YOURREPO/`.
Every later `git push` updates the live site with no downtime. For a custom domain, add it in the same Pages screen.

## 3. Turn on card payments (any currency)
1. Razorpay dashboard > Account & Settings > API Keys > Generate Key (start in Test Mode). Copy the Key Id and the Key Secret now; the secret is shown once.
2. Open `.env` and fill the three lines:
   - `RAZORPAY_KEY_ID=rzp_test_...`
   - `RAZORPAY_KEY_SECRET=...`
   - `SITE_ORIGIN=https://YOURNAME.github.io` (origin only: no `/YOURREPO`, no trailing slash)
3. Log in to Cloudflare once: `npx wrangler login`
4. Run: `npm run deploy:worker`
   This deploys the function, stores your keys as encrypted secrets on Cloudflare, and writes the function's URL into `data.js`.
5. Publish the change: `git add data.js && git commit -m "Set payment endpoint" && git push`
6. Open your live site, pick USD or EUR, press Pay, and use a Razorpay test card. When it works, follow "Switch to live" in RAZORPAY_GUIDE.md.

## 4. After going live
- [ ] A test payment appears in Razorpay > Transactions.
- [ ] The UPI button opens your UPI app on a phone; the QR scans on a computer.
- [ ] The contact form delivers (or opens your email app if you did not set a form service).
- [ ] You tried a hard refresh after each deploy (Ctrl+Shift+R) so cached CSS/JS is replaced.

The files `worker/`, `functions/`, `scripts/` and the `.md` guides are public on GitHub Pages too. They contain no secrets, only code.
