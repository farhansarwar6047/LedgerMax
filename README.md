# The Ledger Max — website

Static website for **The Ledger Max**: remote bookkeeping, accounting and tax prep support for US small businesses and CPA firms.

Plain HTML, CSS and JavaScript. No build step, no framework, no database.

## Pages

| URL | File |
|---|---|
| `/` | `index.html` — home, services, pricing, FAQ |
| `/services` | `services.html` |
| `/industries` | `industries.html` |
| `/how-we-work` | `how-we-work.html` |
| `/us-cpa-firms` | `us-cpa-firms.html` |
| `/tax-calendar` | `tax-calendar.html` |
| `/contact` | `contact.html` — booking calendar, contact form, contact details |

Shared files live in `assets/`:

- `assets/css/styles.css` — all styles
- `assets/js/site.js` — menu, filters, tabs, checklist, booking, contact form, chat assistant
- `assets/js/config.js` — **your settings** (booking link, form endpoint, contact details)
- `assets/img/` — logos and the ProAdvisor badge

## Settings you need to fill in

Open `assets/js/config.js` and paste:

1. **`calendlyUrl`** — your Calendly event link (create a free 20-minute "Free Discovery Call" event at calendly.com). The booking section on the Contact page embeds it automatically.
2. **`formspreeEndpoint`** — create a free form at formspree.io and paste its endpoint (looks like `https://formspree.io/f/xxxxxxx`). Contact form messages are emailed to you.

Until these are set, the booking section shows "Request a call by email" and the contact form opens an email to sales@theledgermax.com, so nothing is broken.

## Deploy on Vercel

1. Go to vercel.com → **Add New… → Project**.
2. Import this GitHub repository.
3. Framework preset: **Other**. Leave Build Command and Output Directory empty.
4. Click **Deploy**.
5. To use your own domain: Project → **Settings → Domains** → add `theledgermax.com` and follow the DNS instructions Vercel shows.

Every push to the `main` branch redeploys the site automatically.

## Preview locally

Any static server works, for example:

```bash
npx serve .
```

Clean URLs (`/services` instead of `/services.html`) are handled by `vercel.json` on Vercel; `npx serve` supports them too.
