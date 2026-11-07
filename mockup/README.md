# WingLift dashboard — clickable prototype

> **This is a prototype.** Static HTML/CSS/JS with hardcoded fake data. No backend, no auth, no persistence. Nothing publishes anywhere. It exists to demo the product concept before building it.

Live at `/mockup/` on the existing Cloudflare Pages deploy (`wrangler.toml` serves the repo root as static assets). Run locally with any static server, e.g. `python3 -m http.server` from the repo root, then open `http://localhost:8000/mockup/`.

## Product model (final decisions)

- **Pure SaaS for small business owners.** WingLift does **not** rebuild sites, host sites, or hand over code.
- **The owner keeps their own developer.** The developer does the code work and is invited to the dashboard as a **guest** (sees technical/deploy info, can propose changes, never sees billing).
- **One plan: €99/month, everything included.**
- **Positioning:** “Your website, your code, your dashboard — your developer works for you again.”
- **Audit data** comes from the existing **Wren AI Visibility Audit**.
- **Publishing:** WordPress sites are edited via the **WordPress REST API** (scoped application password, every edit is a WP revision). Non-WordPress sites get **copy-paste** code/instructions for their developer.
- **Nothing goes live without owner approval** — site edits, FAQs, social posts and review replies all go through one approval queue (dashboard or WhatsApp).

### No “AI visibility score”

Do **not** show a numeric score anywhere. Show concrete findings instead:

- Per-AI status for ChatGPT, Claude, Gemini: *mentioned* / *not mentioned* / *inaccurate info*
- The verbatim text each AI says for real customer searches
- Accuracy flags (e.g. “Gemini lists your old address”)
- Competitor comparison (e.g. “ChatGPT names 3 competitors for ‘plumber in Drogheda’, not you”)
- A prioritised, plain-English fix list (who does it: owner / WingLift / developer)
- Change events over time (“Claude started mentioning you this week”, “a competitor just appeared in ChatGPT results”)

## Fake business used throughout

**Murphy & Sons Plumbing & Heating**, Drogheda, Co. Louth — `murphyplumbing.ie` (WordPress). Owner **Declan Murphy**; developer guest **Aoife Byrne** (Byrne Web Studio). All data lives in `data.js`.

## Screens (hash routes)

| Route | Screen |
|---|---|
| `#/home` | Dashboard — per-AI status cards, fix-first list, weekly changes, activity feed, pending approvals badge |
| `#/audit` (`#/audit/claude`, `#/audit/gemini`) | AI audit report — per-AI verbatim answers, accuracy issues, competitor table, fix list, timeline |
| `#/vibe` | Vibe Update Agent — demo: type “change Sunday hours to 10–4” → preview → Approve → Published. Toggle WordPress vs copy-paste |
| `#/approvals` | Unified approval queue — site edit, FAQ, social, review reply, developer proposal; approve / reject / edit |
| `#/faq` | FAQ manager — 5 slots, weekly deploy allowance counter |
| `#/reviews` | Google review inbox with AI drafts, flagged negative review + de-escalation draft, review-request composer (Google + Trustpilot links, QR) |
| `#/social` | Social manager — Meta / LinkedIn / Google Business Profile drafts, approve & schedule |
| `#/whatsapp` | Phone-frame previews — daily suggestion template (Approve/Edit/Skip), review alert, vibe-edit chat |
| `#/team` | Team — invite-developer modal, permissions |
| `#/developer` | Developer guest view (switch “View as → Developer guest”) — deploy log, connection, propose changes, no billing |
| `#/billing` | Plan & billing (owner only) |

## Files

- `index.html` — shell (banner, sidebar, topbar, role switch)
- `styles.css` — brand styles (navy `#13234A`, gold `#E3A72F`, Inter + Manrope, matching the main site)
- `data.js` — all fake data
- `app.js` — hash router, in-memory state, screen renderers, click actions

State is in memory only: reload or click **Restart demo** to reset.
