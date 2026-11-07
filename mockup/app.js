/* WingLift dashboard prototype — hash-routed, in-memory state, no backend. */
(function () {
  'use strict';

  /* ── Helpers ── */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
    check: '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>',
    faq: '<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    report: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    down: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'
  };
  const icon = (n, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${ICONS[n] || ''}</svg>`;
  const FEATHER = '<svg viewBox="0 0 56 72" aria-hidden="true"><path d="M8 68 C8 68 6 52 18 28 C26 12 36 4 40 2 C40 2 34 8 30 22 C24 42 22 62 22 68 Z" fill="#fff"/><path d="M18 70 C18 70 20 54 32 32 C40 16 50 8 54 6 C54 6 46 14 42 28 C36 48 34 66 34 70 Z" fill="#4A6CB7"/><path d="M26 72 C26 72 34 60 44 46 C50 38 56 32 56 32 C56 32 50 40 46 50 C40 62 38 72 38 72 Z" fill="#E3A72F"/></svg>';

  /* ── State ── */
  let S;
  function resetState() {
    S = clone(window.WL_DATA);
    S.role = 'owner';
    S.approvalFilter = 'all';
    S.auditAi = 'chatgpt';
    S.siteMode = 'wp';
    S.chat = [];
    S.pending = null; // pending vibe change {day, from, to, msgId}
    S.vibeBusy = false;
    S.invites = [];
    S.rr = { name: 'Sarah', channel: 'whatsapp' };
    S.wa = { nudge: null, review: null, extra: [] };
    S.seq = 100;
  }
  resetState();
  const uid = (p) => p + (++S.seq);

  /* ── Navigation ── */
  const OWNER_NAV = [
    { group: 'Overview' },
    { r: 'home', label: 'Dashboard', ico: 'home' },
    { r: 'audit', label: 'AI audit report', ico: 'report' },
    { r: 'approvals', label: 'Approval queue', ico: 'check', badge: 'approvals' },
    { group: 'Agents' },
    { r: 'vibe', label: 'Vibe Update Agent', ico: 'chat' },
    { r: 'faq', label: 'FAQ manager', ico: 'faq' },
    { r: 'reviews', label: 'Reviews', ico: 'star', badge: 'reviews' },
    { r: 'social', label: 'Social', ico: 'share' },
    { r: 'whatsapp', label: 'WhatsApp', ico: 'phone' },
    { group: 'Account' },
    { r: 'team', label: 'Team', ico: 'users' },
    { r: 'billing', label: 'Plan & billing', ico: 'card' }
  ];
  const DEV_NAV = [
    { group: 'Developer guest' },
    { r: 'developer', label: 'Developer workspace', ico: 'code' },
    { r: 'audit', label: 'AI audit report', ico: 'report' },
    { r: 'faq', label: 'FAQ (view only)', ico: 'faq' }
  ];
  const DEV_ROUTES = ['developer', 'audit', 'faq'];
  const TITLES = {
    home: 'Dashboard', vibe: 'Vibe Update Agent', approvals: 'Approval queue', faq: 'FAQ manager', reviews: 'Reviews',
    social: 'Social manager', whatsapp: 'WhatsApp', team: 'Team', audit: 'AI audit report', billing: 'Plan & billing', developer: 'Developer workspace'
  };

  function counts() {
    return {
      approvals: S.approvals.length,
      reviews: S.reviews.filter((r) => !r.replied).length
    };
  }

  function renderShell(route) {
    const nav = S.role === 'dev' ? DEV_NAV : OWNER_NAV;
    const c = counts();
    $('#sideNav').innerHTML = nav.map((n) => n.group
      ? `<div class="group">${n.group}</div>`
      : `<a href="#/${n.r}" class="${n.r === route ? 'active' : ''}">${icon(n.ico)}<span>${n.label}</span>${n.badge ? `<span class="count" ${c[n.badge] ? '' : 'data-zero'}>${c[n.badge] || ''}</span>` : ''}</a>`).join('');
    $('#sideFoot').innerHTML = S.role === 'dev'
      ? `Guest access granted by <strong>${S.owner.name}</strong>.<br>Billing &amp; account settings are hidden.`
      : `<strong>WingLift</strong> · one plan<br><span class="plan-pill">€99 / month · everything included</span>`;
    const u = S.role === 'dev' ? S.developer : S.owner;
    $('#userChip').innerHTML = `<span class="av" style="background:${S.role === 'dev' ? '#4A6CB7' : '#E3A72F'};color:${S.role === 'dev' ? '#fff' : '#13234A'}">${u.initials}</span><span class="nm">${u.name}</span>`;
    $('#topbarTitle').textContent = TITLES[route] || '';
    $$('.role-switch button').forEach((b) => b.classList.toggle('active', b.dataset.role === S.role));
    $$('.owner-only').forEach((el) => (el.hidden = S.role === 'dev'));
    $$('[data-badge]').forEach((el) => {
      const n = c[el.dataset.badge] || 0;
      el.textContent = n || '';
      el.toggleAttribute('data-zero', !n);
    });
    document.title = `${TITLES[route] || 'Dashboard'} — WingLift prototype`;
  }

  function parseHash() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    return { route: parts[0] || 'home', param: parts[1] || null };
  }

  function go(path) { location.hash = '#/' + path; }

  function render() {
    let { route, param } = parseHash();
    if (!SCREENS[route]) route = 'home';
    if (S.role === 'dev' && !DEV_ROUTES.includes(route)) {
      if (route !== 'home') toast('Developer guests can’t see that page');
      route = 'developer';
      history.replaceState(null, '', '#/developer');
    }
    if (S.role === 'owner' && route === 'developer') { route = 'team'; history.replaceState(null, '', '#/team'); }
    if (route === 'audit' && param && S.audit.ais[param]) S.auditAi = param;
    renderShell(route);
    const app = $('#app');
    app.innerHTML = SCREENS[route]();
    if (AFTER[route]) AFTER[route]();
    $('#sidebar').classList.remove('open');
    window.scrollTo(0, 0);
  }

  function refresh() { // re-render current screen without scroll reset
    const y = window.scrollY;
    const { route } = parseHash();
    renderShell(route || 'home');
    $('#app').innerHTML = SCREENS[route] ? SCREENS[route]() : SCREENS.home();
    const r = route || 'home';
    if (AFTER[r]) AFTER[r]();
    window.scrollTo(0, y);
  }

  /* ── Toast & modal ── */
  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<span class="ok">✓</span><span>${msg}</span>`;
    $('#toasts').appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }
  function openModal(html) { $('#modalBody').innerHTML = html; $('#modal').hidden = false; const f = $('#modalBody input, #modalBody textarea'); if (f) f.focus(); }
  function closeModal() { $('#modal').hidden = true; }

  /* ── Shared bits ── */
  const aiBadge = (key) => { const a = S.audit.ais[key]; return `<span class="ai-badge ${a.cls}">${a.name[0]}</span>`; };
  const statusChip = (st, label) => {
    const map = { yes: ['chip-green', 'Mentioned'], not: ['chip-red', 'Not mentioned'], wrong: ['chip-amber', 'Inaccurate info'] };
    const [cls, def] = map[st];
    return `<span class="chip ${cls}">${label || def}</span>`;
  };
  const stars = (n) => `<span class="stars" aria-label="${n} stars">${'★'.repeat(n)}<span class="off">${'★'.repeat(5 - n)}</span></span>`;
  const TYPE = {
    site: { label: 'Site edit', ico: 'globe', cls: 'ico-navy' },
    faq: { label: 'FAQ', ico: 'faq', cls: 'ico-gold' },
    social: { label: 'Social post', ico: 'share', cls: 'ico-green' },
    review: { label: 'Review reply', ico: 'star', cls: 'ico-gold' }
  };
  const feedIco = { good: ['ico-green', 'up'], bad: ['ico-red', 'alert'], gold: ['ico-gold', 'faq'], navy: ['ico-navy', 'code'] };

  function addActivity(ico, text) { S.activity.unshift({ ico, text, when: 'Just now' }); }

  /* ── Screens ── */
  const SCREENS = {};
  const AFTER = {};

  /* 1. Dashboard home */
  SCREENS.home = () => {
    const c = counts();
    const ais = S.audit.ais;
    const card = (k, extra) => {
      const a = ais[k];
      return `<div class="card ai-card">
        <div class="top">${aiBadge(k)}<div><div class="name">${a.name}</div><div class="q">Wren audit · ${S.audit.runAt}</div></div></div>
        <div class="row">${statusChip(a.status, a.statusLabel)}${a.isNew ? '<span class="chip chip-gold no-dot">New this week</span>' : ''}</div>
        <div class="line"><strong>${esc(a.headline)}</strong></div>
        ${extra}
        <div class="foot"><span class="muted">${a.issues.length} issue${a.issues.length === 1 ? '' : 's'} found</span><a href="#/audit/${k}">See what it says →</a></div>
      </div>`;
    };
    return `
      <div class="hero-card">
        <div style="flex:1;min-width:260px">
          <h1>Good morning, ${S.owner.first}</h1>
          <p>Here’s what ChatGPT, Claude and Gemini are saying about ${esc(S.business.short)} this week.</p>
        </div>
        <a href="#/vibe" class="btn btn-gold">${icon('chat')} Update my website</a>
        <a href="#/audit" class="btn" style="background:transparent;color:#fff">Full audit report</a>
      </div>

      ${c.approvals ? `<div class="approve-strip">
        <span class="big">${c.approvals}</span>
        <div style="flex:1"><strong>item${c.approvals === 1 ? '' : 's'} waiting for your OK</strong><div class="small muted">Site edits, FAQ answers, social posts and review replies. Nothing goes live until you approve it.</div></div>
        <a href="#/approvals" class="btn btn-primary">Review now</a>
      </div>` : `<div class="approve-strip" style="background:var(--green-soft);border-color:#BFE6D4"><strong>You’re all caught up.</strong><span class="small muted">Nothing waiting for approval.</span></div>`}

      <div class="grid g-3">
        ${card('chatgpt', `<div class="small">Recommends instead:</div><div class="row" style="gap:4px">${ais.chatgpt.results[0].competitors.map((n) => `<span class="name-tag">${esc(n)}</span>`).join('')}</div>`)}
        ${card('claude', `<div class="quote small">“…<mark>Murphy &amp; Sons Plumbing &amp; Heating</mark>, a family-run business offering emergency repairs, boiler servicing and bathroom installations…”</div>`)}
        ${card('gemini', `<div class="alert alert-red small">${icon('alert', 'width="16" height="16"')}<span>Gemini sends customers to <strong>${esc(S.business.oldAddress)}</strong> — you moved in March.</span></div>`)}
      </div>

      <div class="grid g-main mt-3">
        <div class="stack">
          <div class="card">
            <div class="card-head"><h2>What to fix first</h2><a href="#/audit" class="small">All ${S.audit.fixes.length} fixes →</a></div>
            <ul class="list-plain">${S.audit.fixes.slice(0, 3).map((f, i) => fixItem(f, i)).join('')}</ul>
          </div>
          <div class="card">
            <div class="card-head"><h2>What changed this week</h2><span class="sub">Compared with last week’s audit</span></div>
            <ul class="timeline">${S.audit.events.slice(0, 3).map(evItem).join('')}</ul>
          </div>
        </div>
        <div class="stack">
          <div class="card">
            <div class="card-head"><h2>Activity</h2></div>
            <ul class="list-plain feed">${S.activity.slice(0, 7).map((a) => {
              const [cls, ic] = feedIco[a.ico];
              return `<li><span class="ico ${cls}">${icon(ic)}</span><div><div class="t">${esc(a.text)}</div><div class="when">${a.when}</div></div></li>`;
            }).join('')}</ul>
          </div>
          <div class="card">
            <div class="card-head"><h2>Quick actions</h2></div>
            <div class="stack">
              <a href="#/vibe" class="btn" style="width:100%;justify-content:flex-start">${icon('chat')} Change something on my website</a>
              <a href="#/reviews" class="btn" style="width:100%;justify-content:flex-start">${icon('star')} Ask a customer for a review</a>
              <a href="#/whatsapp" class="btn" style="width:100%;justify-content:flex-start">${icon('phone')} See WingLift on WhatsApp</a>
              <a href="#/team" class="btn" style="width:100%;justify-content:flex-start">${icon('users')} Invite my developer</a>
            </div>
          </div>
        </div>
      </div>`;
  };

  const WHO_CHIP = { 'You': 'chip-gold', 'WingLift': 'chip-navy', 'Your developer': 'chip-green' };
  function fixItem(f, i) {
    const act = {
      queue: `<button class="btn btn-sm" data-action="fix-queue" data-id="${f.id}">Remind me on WhatsApp</button>`,
      vibe: `<a class="btn btn-sm btn-primary" href="#/approvals">Draft ready — review</a>`,
      dev: `<button class="btn btn-sm" data-action="fix-dev" data-id="${f.id}">Send to ${S.developer.first}</button>`,
      faq: `<a class="btn btn-sm btn-primary" href="#/faq">Add to FAQ</a>`,
      reviews: `<a class="btn btn-sm btn-primary" href="#/reviews">Request reviews</a>`
    }[f.action];
    return `<li class="fix-item"><span class="fix-num">${i + 1}</span><div style="flex:1">
      <div class="row" style="gap:6px"><strong>${esc(f.title)}</strong></div>
      <div class="why">${esc(f.why)}</div>
      <div class="acts"><span class="chip ${WHO_CHIP[f.who]} no-dot">Who: ${f.who}</span><span class="chip no-dot">${esc(f.effort)}</span>${S.role === 'owner' ? act : ''}</div>
    </div></li>`;
  }
  const evItem = (e) => `<li class="${e.type}"><div class="d">${e.d} · ${e.ai}</div><div>${esc(e.text)}</div></li>`;

  /* 2. Vibe Update Agent */
  function agentIntro() {
    if (S.chat.length) return;
    S.chat.push({ id: uid('m'), from: 'agent', html: `Hi ${S.owner.first} — tell me what you’d like to change on <strong>${S.business.site}</strong> in plain English. I’ll show you a preview first, and nothing goes live until you approve it.` });
  }
  SCREENS.vibe = () => {
    agentIntro();
    const wp = S.siteMode === 'wp';
    return `
      <div class="page-head"><div><h1>Vibe Update Agent</h1><p>Change your website by describing it. You approve every edit.</p></div>
        <div class="seg" role="group" aria-label="Site type (demo)">
          <button data-action="site-mode" data-mode="wp" class="${wp ? 'active' : ''}">WordPress site</button>
          <button data-action="site-mode" data-mode="other" class="${!wp ? 'active' : ''}">Other site (copy-paste)</button>
        </div>
      </div>
      <div class="chat-wrap">
        <div class="chat">
          <div class="chat-head"><span class="agent-av">${FEATHER}</span><div><strong>WingLift agent</strong><div class="tiny muted">Editing ${S.business.site} · ${wp ? 'publishes via WordPress' : 'gives you copy-paste code'}</div></div></div>
          <div class="chat-log" id="chatLog">${S.chat.map(msgHtml).join('')}</div>
          <div class="suggests" id="suggests">
            <button class="suggest" data-action="suggest">change Sunday hours to 10–4</button>
            <button class="suggest" data-action="suggest">make Saturday 9–1</button>
            <button class="suggest" data-action="suggest">add Laytown to the areas we cover</button>
          </div>
          <form class="chat-input" id="chatForm" autocomplete="off">
            <input class="input" id="chatText" placeholder="e.g. change Sunday hours to 10–4" aria-label="Message">
            <button class="btn btn-primary" type="submit">${icon('send')} Send</button>
          </form>
        </div>
        <div class="stack">
          <div class="card">
            <h3>How it works</h3>
            <ol class="small mt-2" style="padding-left:18px;color:var(--fg-soft)">
              <li>You describe the change.</li>
              <li>The agent finds every place it appears on your site.</li>
              <li>You see a before/after preview.</li>
              <li>You approve — it goes live.</li>
            </ol>
          </div>
          <div class="card">
            <h3>Connection</h3>
            ${wp ? `<div class="row mt-2"><span class="chip chip-green">Connected</span><span class="small">WordPress REST API</span></div>
              <p class="small muted mt-1">Using a scoped application password set up by ${S.developer.name}. Every edit is saved as a WordPress revision, so it can be undone.</p>`
              : `<div class="row mt-2"><span class="chip chip-amber">Copy-paste mode</span></div>
              <p class="small muted mt-1">Your site isn’t on WordPress, so the agent prepares the exact code change and you (or your developer) paste it in. WingLift never needs access to your hosting.</p>`}
          </div>
          <div class="card">
            <h3>Current opening hours</h3>
            <table class="hours-tbl small mt-2">${S.hours.map(([d, h]) => `<tr><td>${d}</td><td>${esc(h)}</td></tr>`).join('')}</table>
          </div>
        </div>
      </div>`;
  };
  AFTER.vibe = () => {
    const log = $('#chatLog');
    log.scrollTop = log.scrollHeight;
    $('#chatForm').addEventListener('submit', (e) => { e.preventDefault(); const t = $('#chatText').value.trim(); if (t) sendChat(t); });
  };

  function msgHtml(m) {
    if (m.typing) return `<div class="msg agent typing"><span></span><span></span><span></span></div>`;
    let html = m.html;
    if (m.kind === 'preview') html += previewActions(m);
    return `<div class="msg ${m.from} ${m.wide ? 'wide' : ''}" data-id="${m.id}">${html}</div>`;
  }
  function previewActions(m) {
    const live = S.pending && S.pending.msgId === m.id && !S.vibeBusy;
    if (!live) return m.resolved ? `<div class="mt-2 small muted">${m.resolved}</div>` : '';
    return `<div class="row mt-2">
      <button class="btn btn-green" data-action="vibe-approve">${S.siteMode === 'wp' ? 'Approve &amp; publish' : 'Approve &amp; get code'}</button>
      <button class="btn" data-action="vibe-edit">${icon('edit')} Edit</button>
      <button class="btn btn-ghost" data-action="vibe-cancel">Cancel</button>
    </div>`;
  }
  function redrawChat() {
    const log = $('#chatLog');
    if (!log) return;
    log.innerHTML = S.chat.map(msgHtml).join('');
    log.scrollTop = log.scrollHeight;
  }

  const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  function fmtHour(h, m) { return String(h).padStart(2, '0') + ':' + (m || '00'); }
  function parseHoursRequest(t) {
    const lower = t.toLowerCase();
    let dayIdx = DAYS.findIndex((d) => lower.includes(d) || lower.includes(d.slice(0, 3) + ' '));
    const m = lower.match(/(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\s*(?:-|–|—|to|until|till)\s*(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?/);
    if (lower.includes('closed') && dayIdx >= 0) return { dayIdx, to: 'Closed' };
    if (!m || dayIdx < 0) return null;
    let o = +m[1], c = +m[4];
    if (m[3] === 'pm' && o < 12) o += 12;
    if (m[6] === 'pm' && c < 12) c += 12;
    if (!m[6] && c <= o && c < 12) c += 12;
    if (o > 23 || c > 24) return null;
    return { dayIdx, to: `${fmtHour(o, m[2])} – ${fmtHour(c, m[5])}` };
  }

  async function sendChat(text) {
    if (S.vibeBusy) return;
    if (S.pending) { const pm = S.chat.find((x) => x.id === S.pending.msgId); if (pm) pm.resolved = 'Replaced by a newer request.'; S.pending = null; }
    S.chat.push({ id: uid('m'), from: 'user', html: esc(text) });
    const input = $('#chatText'); if (input) input.value = '';
    const typing = { id: uid('m'), typing: true, from: 'agent' };
    S.chat.push(typing); redrawChat();
    S.vibeBusy = true;
    await sleep(1100);
    S.chat = S.chat.filter((x) => x !== typing);
    S.vibeBusy = false;
    const req = parseHoursRequest(text);
    if (req) {
      const day = S.hours[req.dayIdx][0];
      const from = S.hours[req.dayIdx][1];
      if (from === req.to) {
        S.chat.push({ id: uid('m'), from: 'agent', html: `${day} is already set to <strong>${esc(req.to)}</strong> — nothing to change.` });
      } else {
        const id = uid('m');
        S.pending = { day, dayIdx: req.dayIdx, from, to: req.to, msgId: id };
        S.chat.push({ id, from: 'agent', wide: true, kind: 'preview', html: previewHtml(S.pending) });
      }
    } else if (/laytown|area|cover/i.test(text)) {
      S.chat.push({ id: uid('m'), from: 'agent', html: `Good idea — that also helps with Wren fix #2. I’ve drafted a new “Areas we cover” paragraph and put it in your <a href="#/approvals">approval queue</a> so you can check the wording.` });
      if (!S.approvals.find((a) => a.id === 'a-areas')) {
        S.approvals.unshift({ id: 'a-areas', type: 'site', title: 'Homepage: update “Areas we cover”', source: 'Vibe Update Agent', when: 'Just now',
          before: 'We cover Drogheda and surrounding areas.', after: 'We cover Drogheda, Termonfeckin, Laytown, Bettystown, Duleek and Clogherhead.' });
        renderShell('vibe');
      }
    } else {
      S.chat.push({ id: uid('m'), from: 'agent', html: `In the full product I’d find and draft that change for you. In this demo, try an opening-hours change — for example <em>“change Sunday hours to 10–4”</em>.` });
    }
    redrawChat();
  }

  function previewHtml(p) {
    const rows = S.hours.map(([d, h], i) => `<tr class="${i === p.dayIdx ? 'changed' : ''}"><td>${d}</td><td>${esc(i === p.dayIdx ? p.to : h)}</td></tr>`).join('');
    return `Here’s what I’ll change. I found your ${p.day} hours in <strong>2 places</strong> on your site:
      <div class="diff">
        <div class="diff-row head"><div>Where</div><div>Before</div><div>After</div></div>
        <div class="diff-row"><div class="day">Contact page</div><div class="old">${p.day}: ${esc(p.from)}</div><div class="new">${p.day}: ${esc(p.to)}</div></div>
        <div class="diff-row"><div class="day">Footer</div><div class="old">${p.day}: ${esc(p.from)}</div><div class="new">${p.day}: ${esc(p.to)}</div></div>
      </div>
      <div class="site-preview">
        <div class="bar"><i></i><i></i><i></i><span style="margin-left:6px">${S.business.site}/contact — preview</span></div>
        <div class="body"><strong>Opening hours</strong><table class="hours-tbl mt-1">${rows}</table></div>
      </div>
      <div class="tiny muted mt-1">I’ll also update the opening hours in your structured data so AI systems pick up the change.</div>`;
  }

  async function vibeApprove() {
    const p = S.pending; if (!p) return;
    const pm = S.chat.find((x) => x.id === p.msgId);
    S.vibeBusy = true;
    if (pm) pm.resolved = '✓ Approved by ' + S.owner.first;
    if (S.siteMode === 'other') {
      S.chat.push({ id: uid('m'), from: 'agent', wide: true, html: `Approved. Your site isn’t on WordPress, so here’s the exact change to paste in (or forward to ${S.developer.first}):
        <div class="code mt-2">&lt;!-- Contact page &amp; footer: replace --&gt;
&lt;li&gt;${p.day}: ${esc(p.from)}&lt;/li&gt;
&lt;!-- with --&gt;
&lt;li&gt;${p.day}: ${esc(p.to)}&lt;/li&gt;</div>
        <div class="row mt-2"><button class="btn btn-sm" data-action="copy-code">${icon('copy')} Copy code</button><button class="btn btn-sm" data-action="fix-dev" data-id="vibe">Send to ${S.developer.first}</button><button class="btn btn-sm btn-green" data-action="vibe-done" data-day="${p.day}" data-to="${esc(p.to)}">Mark as done</button></div>` });
      S.vibeBusy = false;
      redrawChat();
      return;
    }
    const steps = ['Connecting to WordPress REST API', 'Updating Contact page (page #42)', 'Updating footer widget', 'Updating opening-hours structured data', 'Checking the live page'];
    const id = uid('m');
    const m = { id, from: 'agent', wide: true, html: '' };
    S.chat.push(m);
    for (let i = 0; i <= steps.length; i++) {
      m.html = `<strong>Publishing…</strong><ul class="steps">${steps.map((s, j) => `<li class="${j < i ? 'done' : j === i ? 'run' : ''}"><span class="s"></span>${s}</li>`).join('')}</ul>`;
      redrawChat();
      await sleep(550);
    }
    S.hours[p.dayIdx][1] = p.to;
    m.html = publishedHtml(p);
    finishPublish(p);
  }
  function publishedHtml(p) {
    return `<div class="alert alert-green">${icon('check', 'width="18" height="18"')}<div><strong>Published.</strong> ${p.day} hours are now <strong>${esc(p.to)}</strong> on ${S.business.site}.<div class="tiny muted mt-1">${S.siteMode === 'wp' ? 'WordPress revision #4182 · ' : ''}Change ID chg_${(9000 + S.seq).toString(16)} · can be undone any time</div></div></div>
      <div class="mt-2">Want me to update your Google Business Profile hours and let customers know on Facebook too? I’ve put a draft post in your <a href="#/approvals">approval queue</a>.</div>
      <div class="row mt-2"><a class="btn btn-sm" href="#/approvals">Review draft post</a><a class="btn btn-sm btn-ghost" href="#/home">Back to dashboard</a></div>`;
  }
  function finishPublish(p) {
    addActivity('good', `Published: ${p.day} hours changed to ${p.to}`);
    if (!S.approvals.find((a) => a.id === 'a-hours')) {
      S.approvals.unshift({ id: 'a-hours', type: 'social', title: `Facebook & Google: announce new ${p.day} hours`, source: 'Vibe Update Agent', when: 'Just now', platform: 'Meta + Google Business Profile',
        after: `New ${p.day} hours! We’re now open ${p.day}s ${p.to.replace(' – ', '–')} for bookings, call-outs and advice. Ring 041 983 2210.` });
    }
    S.pending = null;
    S.vibeBusy = false;
    if (parseHash().route === 'vibe') refresh(); else renderShell(parseHash().route);
    toast('Published to ' + S.business.site);
  }

  /* 3. Approval queue */
  SCREENS.approvals = () => {
    const f = S.approvalFilter;
    const types = ['all', 'site', 'faq', 'social', 'review'];
    const label = { all: 'All', site: 'Site edits', faq: 'FAQ', social: 'Social', review: 'Review replies' };
    const list = S.approvals.filter((a) => f === 'all' || a.type === f);
    return `
      <div class="page-head"><div><h1>Approval queue</h1><p>Everything WingLift or your developer wants to publish waits here. Nothing goes live without your OK.</p></div>
        ${S.approvals.length ? `<button class="btn" data-action="approve-all">Approve all ${list.length === S.approvals.length ? '' : 'shown '}(${list.length})</button>` : ''}
      </div>
      <div class="tabs">${types.map((t) => {
        const n = t === 'all' ? S.approvals.length : S.approvals.filter((a) => a.type === t).length;
        return `<button data-action="filter" data-f="${t}" class="${f === t ? 'active' : ''}">${label[t]}<span class="count">${n}</span></button>`;
      }).join('')}</div>
      ${list.length ? list.map(qCard).join('') : `<div class="card empty"><div class="big">✓</div><h3>All caught up</h3><p class="mt-1">Nothing waiting for approval here. We’ll message you on WhatsApp when something new arrives.</p></div>`}`;
  };
  function qCard(a) {
    const t = TYPE[a.type];
    let body = '';
    if (a.editing) {
      body = `<textarea class="textarea mt-2" id="edit-${a.id}">${esc(a.after)}</textarea>`;
    } else if (a.type === 'site' && a.before) {
      body = `<div class="diff"><div class="diff-row head" style="grid-template-columns:1fr 1fr"><div>Before</div><div>After</div></div><div class="diff-row" style="grid-template-columns:1fr 1fr"><div class="old">${esc(a.before)}</div><div class="new">${esc(a.after)}</div></div></div>`;
    } else if (a.type === 'review') {
      body = `<div class="quote">“${esc(a.quote)}”</div><div class="reply-box"><div class="lbl">${icon('sparkle', 'width="13" height="13"')} AI-drafted reply</div>${esc(a.after)}</div>`;
    } else if (a.type === 'faq') {
      body = `<div class="reply-box"><div class="lbl">Answer</div>${esc(a.after)}</div><div class="tiny muted mt-1">Uses 1 of your ${S.faqAllowance.total - S.faqAllowance.used} remaining FAQ deploys this week.</div>`;
    } else {
      body = `<div class="reply-box">${a.platform ? `<div class="lbl">${esc(a.platform)}</div>` : ''}${esc(a.after)}</div>`;
    }
    if (a.code && !a.editing) body += `<div class="code mt-2">${esc(a.code)}</div>`;
    return `<div class="card q-card" id="q-${a.id}">
      <span class="q-ico ${t.cls}">${icon(t.ico)}</span>
      <div>
        <div class="q-meta"><span class="chip no-dot">${t.label}</span>${a.flagged ? '<span class="chip chip-red">Negative review</span>' : ''}${a.fromDev ? '<span class="chip chip-navy no-dot">From your developer</span>' : ''}<span>${esc(a.source)}</span><span>· ${a.when}</span></div>
        <h3 class="mt-1">${esc(a.title)}</h3>
        <div class="q-body">${body}</div>
        <div class="q-acts">
          ${a.editing
            ? `<button class="btn btn-primary" data-action="q-save" data-id="${a.id}">Save changes</button><button class="btn btn-ghost" data-action="q-edit" data-id="${a.id}">Cancel</button>`
            : `<button class="btn btn-green" data-action="q-approve" data-id="${a.id}">${a.type === 'social' ? 'Approve &amp; schedule' : 'Approve'}</button>
               <button class="btn" data-action="q-edit" data-id="${a.id}">${icon('edit')} Edit</button>
               <button class="btn btn-ghost btn-danger" data-action="q-reject" data-id="${a.id}">Reject</button>`}
        </div>
      </div>
    </div>`;
  }
  async function resolveApproval(id, verb) {
    const a = S.approvals.find((x) => x.id === id); if (!a) return;
    if (verb === 'approved' && a.type === 'faq' && !faqHasCapacity()) { toast('No FAQ deploys or empty slots left this week — free a slot or wait for Monday'); return; }
    const el = $('#q-' + id);
    if (el) { el.classList.add('leaving'); await sleep(280); }
    S.approvals = S.approvals.filter((x) => x.id !== id);
    if (verb === 'approved') {
      if (a.type === 'review') { const r = S.reviews.find((r) => a.quote && r.text === a.quote); if (r) r.replied = true; }
      if (a.type === 'faq') applyFaqApproval(a);
      if (a.type === 'social') { const p = S.posts.find((p) => p.text === a.after); if (p) p.status = 'scheduled'; }
      addActivity(a.type === 'review' ? 'gold' : 'good', `Approved: ${a.title}`);
    }
    toast(verb === 'approved' ? `Approved — ${a.type === 'social' ? 'scheduled' : a.type === 'review' ? 'reply posted to Google' : 'published'}` : 'Rejected — we won’t publish it');
    refresh();
  }
  function faqHasCapacity() { return S.faqs.some((x) => !x) && S.faqAllowance.used < S.faqAllowance.total; }
  function applyFaqApproval(a) {
    const idx = S.faqs.findIndex((x) => !x);
    if (idx >= 0 && S.faqAllowance.used < S.faqAllowance.total) {
      S.faqs[idx] = { q: a.title.replace(/^New FAQ: “|”$/g, ''), a: a.after, live: true };
      S.faqAllowance.used++;
    }
  }

  /* 4. FAQ manager */
  SCREENS.faq = () => {
    const al = S.faqAllowance;
    const left = al.total - al.used;
    const ro = S.role === 'dev';
    return `
      <div class="page-head"><div><h1>FAQ manager</h1><p>Five questions that AI systems should be able to answer about you. Published to your site with FAQ structured data.</p></div></div>
      <div class="card allowance">
        <div style="flex:1"><h3>Weekly deploy allowance</h3><p class="small muted">Each publish to your live site uses one deploy. Resets ${al.resets} 00:00.</p></div>
        <div class="pips">${Array.from({ length: al.total }, (_, i) => `<span class="pip ${i < al.used ? 'used' : ''}"></span>`).join('')}</div>
        <div style="text-align:right"><div style="font-family:Manrope;font-weight:800;font-size:1.3rem">${left} of ${al.total}</div><div class="tiny muted">deploys left this week</div></div>
      </div>
      ${ro ? '<div class="alert alert-navy mt-2">You’re viewing as a developer guest. FAQ changes are made by the owner.</div>' : ''}
      <div class="mt-2">${S.faqs.map((f, i) => faqSlot(f, i, left, ro)).join('')}</div>`;
  };
  function faqSlot(f, i, left, ro) {
    if (!f) {
      const s = S.faqSuggestion;
      return `<div class="card faq-slot empty-slot"><span class="slot-n">${i + 1}</span><div>
        <div class="row"><span class="chip chip-gold no-dot">Empty slot</span><span class="small muted">Wren suggests (fixes Gemini’s “closed on Sundays” error):</span></div>
        <div class="faq-q mt-1">${esc(s.q)}</div><div class="faq-a">${esc(s.a)}</div>
      </div><div class="row">${ro ? '' : `<button class="btn btn-primary btn-sm" data-action="faq-use" data-i="${i}" ${left ? '' : 'disabled'}>Use &amp; deploy</button><button class="btn btn-sm" data-action="faq-edit" data-i="${i}">Write my own</button>`}</div></div>`;
    }
    return `<div class="card faq-slot"><span class="slot-n">${i + 1}</span><div>
      <div class="row">${f.live ? '<span class="chip chip-green">Live on site</span>' : '<span class="chip chip-amber">Draft — not deployed</span>'}</div>
      <div class="faq-q mt-1">${esc(f.q)}</div><div class="faq-a">${esc(f.a)}</div>
    </div><div class="row">${ro ? '' : `${f.live ? '' : `<button class="btn btn-primary btn-sm" data-action="faq-deploy" data-i="${i}" ${left ? '' : 'disabled'}>Deploy</button>`}<button class="btn btn-sm" data-action="faq-edit" data-i="${i}">${icon('edit')} Edit</button>`}</div></div>`;
  }
  function faqDeploy(i) {
    const al = S.faqAllowance;
    if (al.used >= al.total) { toast('No deploys left this week — resets Monday'); return; }
    al.used++;
    S.faqs[i].live = true;
    addActivity('gold', `FAQ “${S.faqs[i].q}” published to your site`);
    toast('FAQ deployed to ' + S.business.site);
    refresh();
  }
  function faqEditModal(i) {
    const f = S.faqs[i] || { q: '', a: '' };
    openModal(`<h2>Edit FAQ slot ${i + 1}</h2><p class="small muted">Keep it short and specific. Mention your town and services where it’s natural.</p>
      <div class="field mt-2"><label for="fq">Question</label><input class="input" id="fq" value="${esc(f.q)}"></div>
      <div class="field"><label for="fa">Answer</label><textarea class="textarea" id="fa">${esc(f.a)}</textarea></div>
      <div class="modal-acts"><button class="btn btn-ghost" data-action="modal-close">Cancel</button><button class="btn btn-primary" data-action="faq-save" data-i="${i}">Save as draft</button></div>`);
  }

  /* 5. Reviews */
  SCREENS.reviews = () => {
    const pending = S.reviews.filter((r) => !r.replied);
    return `
      <div class="page-head"><div><h1>Reviews</h1><p>Google reviews with replies drafted for you. Negative reviews are flagged straight away.</p></div>
        <div class="row"><span class="chip chip-gold no-dot">${stars(5)} 4.7 on Google · 63 reviews</span></div></div>
      <div class="grid g-main">
        <div>
          <div class="card-head"><h2>Inbox</h2><span class="sub">${pending.length} awaiting reply</span></div>
          ${S.reviews.map(reviewCard).join('')}
        </div>
        <div class="stack">${rrComposer()}</div>
      </div>`;
  };
  function reviewCard(r) {
    return `<div class="card review ${r.flagged && !r.replied ? 'flagged' : ''}">
      <div class="row"><span class="member" style="padding:0"><span class="av" style="background:#6B7A99;width:34px;height:34px;font-size:.78rem">${r.initials}</span></span>
        <div><strong>${esc(r.name)}</strong><div class="row" style="gap:6px">${stars(r.stars)}<span class="tiny muted">${r.when} · Google</span></div></div>
        <span class="spacer"></span>
        ${r.replied ? '<span class="chip chip-green">Replied</span>' : r.flagged ? '<span class="chip chip-red">Flagged: negative</span>' : '<span class="chip chip-amber">Needs reply</span>'}
      </div>
      <p class="mt-2">${esc(r.text)}</p>
      ${r.flagged && !r.replied ? `<div class="alert alert-red mt-2 small">${icon('alert', 'width="16" height="16"')}<span><strong>De-escalation draft.</strong> Acknowledges the problem, apologises without arguing, explains briefly and moves the conversation offline. We’ve also sent you a WhatsApp alert.</span></div>` : ''}
      <div class="reply-box"><div class="lbl">${r.replied ? 'Your reply' : `${icon('sparkle', 'width="13" height="13"')} AI-drafted reply`}</div>
        ${r.editing ? `<textarea class="textarea" id="rv-${r.id}">${esc(r.draft)}</textarea>` : esc(r.draft)}
      </div>
      ${r.replied ? '' : `<div class="q-acts">${r.editing
        ? `<button class="btn btn-primary" data-action="rv-save" data-id="${r.id}">Save</button>`
        : `<button class="btn btn-green" data-action="rv-approve" data-id="${r.id}">Approve &amp; post</button><button class="btn" data-action="rv-edit" data-id="${r.id}">${icon('edit')} Edit</button><button class="btn btn-ghost" data-action="rv-regen" data-id="${r.id}">${icon('sparkle')} Rewrite</button>`}</div>`}
    </div>`;
  }
  function rrComposer() {
    const n = S.rr.name || 'there';
    const ch = S.rr.channel;
    const msg = `Hi ${n}, thanks for choosing Murphy & Sons! If you were happy with the job, would you mind leaving us a quick review? It really helps a small local business.\n\nGoogle: g.page/r/murphyplumbing/review\nTrustpilot: trustpilot.com/evaluate/murphyplumbing.ie\n\n— Declan`;
    return `<div class="card">
      <div class="card-head"><h2>Ask for a review</h2></div>
      <div class="field"><label for="rrName">Customer first name</label><input class="input" id="rrName" value="${esc(S.rr.name)}"></div>
      <div class="field"><label for="rrTo">Mobile or email</label><input class="input" id="rrTo" value="087 555 0192"></div>
      <div class="field"><label>Send by</label><div class="seg">${['whatsapp', 'sms', 'email'].map((c) => `<button data-action="rr-ch" data-ch="${c}" class="${ch === c ? 'active' : ''}">${{ whatsapp: 'WhatsApp', sms: 'SMS', email: 'Email' }[c]}</button>`).join('')}</div></div>
      <div class="field"><label>Preview</label><div class="rr-preview" id="rrPreview">${esc(msg)}</div></div>
      <button class="btn btn-primary" style="width:100%" data-action="rr-send">${icon('send')} Send review request</button>
      <hr class="sep">
      <h3>Shareable QR code</h3>
      <p class="small muted mt-1">Print it on invoices or the van. Customers scan and choose Google or Trustpilot.</p>
      <div class="row mt-2" style="align-items:flex-start">
        <div class="qr">${qrSvg('winglift.io/r/murphy-sons')}</div>
        <div class="stack small" style="flex:1;min-width:140px">
          <div><strong>winglift.io/r/murphy-sons</strong></div>
          <button class="btn btn-sm" data-action="copy-link">${icon('copy')} Copy link</button>
          <button class="btn btn-sm" data-action="toast" data-msg="QR code PNG downloaded (demo)">Download PNG</button>
        </div>
      </div>
    </div>`;
  }
  function qrSvg(seed) {
    const N = 25; let h = 0;
    for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
    const finder = (x, y) => [[0, 0], [N - 7, 0], [0, N - 7]].some(([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7);
    let r = '';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!finder(x, y) && rnd() > 0.52) r += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    const f = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
    return `<svg viewBox="0 0 ${N} ${N}" shape-rendering="crispEdges" fill="#13234A" aria-label="QR code">${f(0, 0)}${f(N - 7, 0)}${f(0, N - 7)}${r}</svg>`;
  }

  /* 6. Social */
  SCREENS.social = () => {
    const days = [['Mon', 9], ['Tue', 10], ['Wed', 11], ['Thu', 12], ['Fri', 13], ['Sat', 14], ['Sun', 15]];
    return `
      <div class="page-head"><div><h1>Social manager</h1><p>Posts drafted for Facebook &amp; Instagram, LinkedIn and Google Business Profile. Approve, tweak or reschedule.</p></div>
        <button class="btn btn-primary" data-action="toast" data-msg="New post drafted — see below (demo)">${icon('sparkle')} Draft a new post</button></div>
      <div class="card">
        <div class="card-head"><h2>Week of 9 November</h2><div class="row small"><span class="chip chip-amber">Draft</span><span class="chip chip-green">Scheduled</span></div></div>
        <div class="week">${days.map(([d, n]) => {
          const ps = S.posts.filter((p) => p.when.includes(`${d} ${n} `) || p.when.startsWith(`${d} ${n}`));
          return `<div class="day-col ${n === 9 ? 'today' : ''}"><div class="dn">${d}</div><div class="dd">${n}</div>${ps.map((p) => `<span class="slot-pill" style="background:${p.status === 'scheduled' ? p.color : '#B7791F'}">${p.status === 'scheduled' ? '✓ ' : ''}${esc(p.name.split(' ')[0])}</span>`).join('')}</div>`;
        }).join('')}</div>
      </div>
      <div class="grid g-2 mt-2">${S.posts.map(postCard).join('')}</div>`;
  };
  function postCard(p) {
    const ico = { gbp: ['p-gbp', 'G'], meta: ['p-meta', 'f'], li: ['p-li', 'in'] }[p.platform];
    return `<div class="card post-card">
      <div class="row"><span class="plat"><span class="plat-ico ${ico[0]}">${ico[1]}</span>${p.name}</span><span class="spacer"></span>${p.status === 'scheduled' ? '<span class="chip chip-green">Scheduled</span>' : '<span class="chip chip-amber">Draft</span>'}</div>
      <div class="post-preview">
        <div class="ph"><span class="biz-avatar">M</span><div><strong>${esc(S.business.short)}</strong><div class="tiny muted">${p.when}</div></div></div>
        <div class="pt">${p.editing ? `<textarea class="textarea" id="pt-${p.id}">${esc(p.text)}</textarea>` : esc(p.text)}</div>
        <div class="post-img" style="background:${p.imgBg}">${esc(p.img)}</div>
      </div>
      <div class="row mt-2">
        ${p.editing ? `<button class="btn btn-primary btn-sm" data-action="post-save" data-id="${p.id}">Save</button>` : p.status === 'scheduled'
          ? `<span class="small muted">${icon('calendar', 'width="14" height="14"')} Goes out ${p.when}</span><span class="spacer"></span><button class="btn btn-sm btn-ghost" data-action="post-unschedule" data-id="${p.id}">Unschedule</button>`
          : `<input type="datetime-local" class="input" style="width:auto;padding:5px 8px;font-size:.8rem" value="${dtLocal(p.when)}" aria-label="Schedule time">
             <button class="btn btn-green btn-sm" data-action="post-approve" data-id="${p.id}">Approve &amp; schedule</button>
             <button class="btn btn-sm" data-action="post-edit" data-id="${p.id}">${icon('edit')} Edit</button>`}
      </div>
    </div>`;
  }
  function fmtWhen(v) {
    const d = new Date(v);
    return `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]} ${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]}, ${v.slice(11, 16)}`;
  }
  function dtLocal(when) {
    const m = when.match(/(\d+) Nov, (\d\d:\d\d)/);
    return m ? `2026-11-${m[1].padStart(2, '0')}T${m[2]}` : '';
  }

  /* 7. WhatsApp */
  SCREENS.whatsapp = () => `
    <div class="page-head"><div><h1>WingLift on WhatsApp</h1><p>Most owners never open the dashboard. They approve things from WhatsApp in between jobs. Tap the buttons to try it.</p></div></div>
    <div class="phones">
      <div class="phone-col"><h3>Daily suggestion</h3>${phone(waNudge(), 'nudge')}<span class="tiny muted">Template message · sent 08:00 each weekday</span></div>
      <div class="phone-col"><h3>Review alert</h3>${phone(waReview(), 'review')}<span class="tiny muted">Sent within minutes of a new review</span></div>
      <div class="phone-col"><h3>Vibe edit by chat</h3>${phone(waVibe(), 'vibe', true)}<span class="tiny muted">Owner texts a change in plain English</span></div>
    </div>`;
  function phone(body, key, withInput) {
    return `<div class="phone"><div class="screen">
      <div class="wa-status"><span>9:41</span><span>●●● 5G</span></div>
      <div class="wa-head"><span style="font-size:1.1rem">‹</span><span class="av">${FEATHER}</span><div><div class="nm">WingLift</div><div class="st">Business account</div></div></div>
      <div class="wa-body" id="wa-${key}">${body}</div>
      <form class="wa-input" data-wa="${key}" autocomplete="off"><input placeholder="Message" ${withInput ? '' : 'disabled'} aria-label="WhatsApp message"><button type="submit" aria-label="Send">${icon('send', 'width="15" height="15"')}</button></form>
    </div></div>`;
  }
  const waBtns = (key, state, labels) => `<div class="wa-btns">${labels.map((l) => `<button data-action="wa" data-k="${key}" data-v="${l}" ${state ? 'disabled' : ''}>${l}</button>`).join('')}</div>`;
  function waNudge() {
    const st = S.wa.nudge;
    const replies = { Approve: 'Done — it’ll go out on Google Business Profile at 11:00 today.', Edit: 'Sure — reply with what you’d like changed, or tap below to edit in the dashboard.\nwinglift.io/a/p1', Skip: 'No problem. I’ll have a new suggestion tomorrow morning.' };
    return `<span class="wa-day">TODAY</span>
      <div class="wa-msg wa-tpl"><div class="tb"><div class="hdr">Today’s suggestion</div>Good morning Declan. ChatGPT is favouring plumbers with recent Google posts. Here’s one ready to go:<br><br><i>“Is your boiler ready for winter? Book your annual service — from €95 inc. VAT. Serving Drogheda &amp; all of Co. Louth.”</i><span class="tm">08:00</span></div>${waBtns('nudge', st, ['Approve', 'Edit', 'Skip'])}</div>
      ${st ? `<div class="wa-msg out">${st}<span class="tm">08:14 ✓✓</span></div><div class="wa-msg">${replies[st].replace(/\n/g, '<br>')}<span class="tm">08:14</span></div>` : ''}`;
  }
  function waReview() {
    const st = S.wa.review;
    const replies = { 'Approve reply': 'Reply posted to Google. I’ll let you know if Mark responds.', Edit: 'Open the draft here: winglift.io/a/r1', Skip: 'OK — I’ll leave it in your approval queue for now.' };
    return `<span class="wa-day">TODAY</span>
      <div class="wa-msg wa-tpl"><div class="tb"><div class="hdr">New 2★ review</div><b>Mark D.</b> on Google:<br>“Quoted one price, invoice came in €80 higher. Nobody explained the extra.”<br><br>I’ve drafted a calm reply that apologises and asks him to ring you:<br><i>“Hi Mark, you’re right that any change to the price should have been explained before we finished, and I’m sorry it wasn’t…”</i><span class="tm">13:22</span></div>${waBtns('review', st, ['Approve reply', 'Edit', 'Skip'])}</div>
      ${st ? `<div class="wa-msg out">${st}<span class="tm">13:30 ✓✓</span></div><div class="wa-msg">${replies[st]}<span class="tm">13:30</span></div>` : ''}`;
  }
  function waVibe() {
    return `<span class="wa-day">YESTERDAY</span>
      <div class="wa-msg out">can u put up that we're closed 24-26 dec<span class="tm">18:02 ✓✓</span></div>
      <div class="wa-msg">Here’s the change for murphyplumbing.ie:<br><br><b>Contact page + banner</b><br>+ “Closed 24–26 December. Emergency call-outs: 041 983 2210.”<br><br>Reply <b>APPROVE</b> to publish, or tell me what to change.<span class="tm">18:02</span></div>
      <div class="wa-msg out">APPROVE<span class="tm">18:05 ✓✓</span></div>
      <div class="wa-msg">Published. It’s live on your Contact page and banner. I’ll remove the banner on 27 December.<span class="tm">18:05</span></div>
      ${S.wa.extra.map((m) => `<div class="wa-msg ${m.out ? 'out' : ''}">${m.html}<span class="tm">${m.out ? 'now ✓✓' : 'now'}</span></div>`).join('')}`;
  }
  AFTER.whatsapp = () => {
    $$('.wa-body').forEach((b) => (b.scrollTop = b.scrollHeight));
    $$('form[data-wa]').forEach((f) => f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const inp = $('input', f); const t = inp.value.trim(); if (!t) return;
      inp.value = '';
      S.wa.extra.push({ out: true, html: esc(t) });
      const body = $('#wa-vibe'); body.innerHTML = waVibe(); body.scrollTop = body.scrollHeight;
      await sleep(900);
      const approve = /^approve$/i.test(t);
      S.wa.extra.push({ out: false, html: approve ? 'Published. It’s live on murphyplumbing.ie.' : `Here’s what I’ll change on murphyplumbing.ie:<br><br>+ “${esc(t)}”<br><br>Reply <b>APPROVE</b> to publish, or tell me what to change.` });
      body.innerHTML = waVibe(); body.scrollTop = body.scrollHeight;
    }));
  };

  /* 8. Team */
  SCREENS.team = () => `
    <div class="page-head"><div><h1>Team</h1><p>Your website, your code, your dashboard — invite your own developer as a guest so they can see what needs doing.</p></div>
      <div class="row"><button class="btn" data-action="as-dev">Preview developer guest view</button><button class="btn btn-primary" data-action="invite">${icon('plus')} Invite developer</button></div></div>
    <div class="grid g-main">
      <div class="stack">
        <div class="card">
          <div class="card-head"><h2>People</h2></div>
          <ul class="list-plain">
            ${S.team.map((m) => `<li class="member"><span class="av" style="background:${m.color}">${m.initials}</span><div style="flex:1"><strong>${esc(m.name)}</strong><div class="small muted">${esc(m.email)}${m.note ? ' · ' + esc(m.note) : ''}</div></div><span class="chip ${m.role === 'Owner' ? 'chip-gold' : 'chip-navy'} no-dot">${m.role}</span></li>`).join('')}
            ${S.invites.map((m) => `<li class="member"><span class="av" style="background:#B6BFD0">${esc(m.initials)}</span><div style="flex:1"><strong>${esc(m.name || m.email)}</strong><div class="small muted">${esc(m.email)} · invite sent just now</div></div><span class="chip chip-amber">Pending</span></li>`).join('')}
          </ul>
        </div>
        <div class="card">
          <div class="card-head"><h2>What each role can do</h2></div>
          <table class="perm-tbl">
            <thead><tr><th></th><th class="c">Owner</th><th class="c">Developer guest</th></tr></thead>
            <tbody>
              ${[['See AI audit report & fix list', 1, 1], ['See technical &amp; deploy info', 1, 1], ['Propose site changes', 1, 1], ['Approve &amp; publish changes', 1, 0], ['Reviews, social &amp; WhatsApp', 1, 0], ['Billing &amp; plan', 1, 0], ['Remove people / close account', 1, 0]]
                .map(([l, o, d]) => `<tr><td>${l}</td><td class="c ${o ? 'yes' : 'no'}">${o ? '✓' : '—'}</td><td class="c ${d ? 'yes' : 'no'}">${d ? '✓' : '—'}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <h3>Why invite your developer?</h3>
        <p class="small mt-1" style="color:var(--fg-soft)">WingLift doesn’t rebuild or host your website, and we never take over your code. Your developer keeps doing the technical work — now with a clear, prioritised list of exactly what AI systems are getting wrong.</p>
        <ul class="small mt-2" style="padding-left:18px;color:var(--fg-soft)">
          <li>They see the audit findings and technical fixes</li>
          <li>They propose changes; you approve them</li>
          <li>They never see your billing</li>
        </ul>
      </div>
    </div>`;
  function inviteModal() {
    openModal(`<h2>Invite your developer</h2><p class="small muted">They’ll get an email to join as a guest on ${esc(S.business.short)}. Free — guests don’t count towards your plan.</p>
      <div class="field mt-2"><label for="invName">Name</label><input class="input" id="invName" placeholder="e.g. Pádraig Walsh"></div>
      <div class="field"><label for="invEmail">Email</label><input class="input" id="invEmail" type="email" placeholder="dev@example.ie"></div>
      <div class="field"><label>Guest access</label>
        <label class="check"><input type="checkbox" checked> See AI audit findings &amp; fix list</label>
        <label class="check"><input type="checkbox" checked> See technical &amp; deploy info (CMS, connection, change log)</label>
        <label class="check"><input type="checkbox" checked> Propose site changes to my approval queue</label>
        <label class="check locked"><input type="checkbox" disabled> Billing &amp; plan <span class="tiny">(never shared with guests)</span></label>
      </div>
      <div class="field"><label for="invMsg">Personal note (optional)</label><textarea class="textarea" id="invMsg" style="min-height:60px">Hi — I’m using WingLift to keep an eye on how AI tools describe the business. Can you take a look at the technical fixes?</textarea></div>
      <div class="modal-acts"><button class="btn btn-ghost" data-action="modal-close">Cancel</button><button class="btn btn-primary" data-action="invite-send">Send invite</button></div>`);
  }

  /* 8b. Developer guest view */
  SCREENS.developer = () => {
    const devFixes = S.audit.fixes.filter((f) => f.who === 'Your developer');
    return `
      <div class="dev-banner">${icon('code', 'width="20" height="20"')}<div style="flex:1">You’re viewing <strong>${esc(S.business.short)}</strong> as <strong>${S.developer.name}</strong> (developer guest). Billing and account settings are hidden. Changes you propose go to ${S.owner.first}’s approval queue.</div><button class="btn btn-sm" data-action="as-owner">Back to owner view</button></div>
      <div class="page-head"><div><h1>Developer workspace</h1><p>Technical details, deploy history and the fixes that need a developer.</p></div></div>
      <div class="grid g-2">
        <div class="card"><div class="card-head"><h2>Site &amp; connection</h2><span class="chip chip-green">Healthy</span></div>
          <dl class="kv">
            <dt>Site</dt><dd>https://${S.business.site}</dd>
            <dt>CMS</dt><dd>WordPress 6.6.2 · Astra child theme</dd>
            <dt>Hosting</dt><dd>Owner’s own (Blacknight) — WingLift has no hosting access</dd>
            <dt>Publish method</dt><dd>WP REST API · application password “WingLift”</dd>
            <dt>WP user / role</dt><dd class="mono">winglift-bot / editor</dd>
            <dt>Last connection check</dt><dd>Today 07:00 · 200 OK</dd>
            <dt>Rollback</dt><dd>Every change saved as a WP revision</dd>
          </dl>
        </div>
        <div class="card"><div class="card-head"><h2>AI crawler &amp; markup checks</h2><span class="sub">from Wren audit</span></div>
          <ul class="list-plain small">
            ${[['robots.txt allows GPTBot, ClaudeBot, Google-Extended', 'green', 'Pass'], ['FAQPage JSON-LD on /faq', 'green', 'Pass'], ['LocalBusiness / Plumber schema', 'red', 'Missing'], ['Opening hours in markup match site', 'amber', 'Mismatch'], ['llms.txt', 'amber', 'Not found'], ['Heat pump service page', 'red', 'Missing'], ['NAP consistency (Golden Pages)', 'red', 'Old address']]
              .map(([l, c, s]) => `<li class="row" style="padding:8px 0"><span style="flex:1">${l}</span><span class="chip chip-${c}">${s}</span></li>`).join('')}
          </ul>
        </div>
      </div>
      <div class="grid g-main mt-2">
        <div class="stack">
          <div class="card"><div class="card-head"><h2>Fixes that need a developer</h2></div>
            <ul class="list-plain">${devFixes.map((f) => `<li class="fix-item"><span class="fix-num">${S.audit.fixes.indexOf(f) + 1}</span><div style="flex:1"><strong>${esc(f.title)}</strong><div class="why">${esc(f.why)}</div><div class="acts"><span class="chip no-dot">${esc(f.effort)}</span><button class="btn btn-sm btn-primary" data-action="dev-prefill" data-id="${f.id}">Propose a change</button></div></div></li>`).join('')}</ul>
          </div>
          <div class="card"><div class="card-head"><h2>Deploy log</h2><span class="sub">Every change WingLift has published</span></div>
            <div style="overflow-x:auto"><table class="log-tbl"><thead><tr><th>When</th><th>Change</th><th>Method</th><th>By</th></tr></thead><tbody>
              ${S.deployLog.map((l) => `<tr><td class="small">${l.when}<div class="mono tiny muted">${l.id}</div></td><td>${esc(l.what)}</td><td class="mono tiny">${esc(l.how)}<div class="muted">${l.rev}</div></td><td class="small">${esc(l.by)}</td></tr>`).join('')}
            </tbody></table></div>
          </div>
        </div>
        <div class="card" id="proposeCard"><h2>Propose a change</h2><p class="small muted mt-1">Goes to ${S.owner.first}’s approval queue. Once approved, you deploy it — or WingLift publishes it via the REST API.</p>
          <div class="field mt-2"><label for="pTitle">Title</label><input class="input" id="pTitle" placeholder="e.g. Add LocalBusiness schema"></div>
          <div class="field"><label for="pType">Type</label><select class="select" id="pType"><option>Code / markup</option><option>Content</option><option>Plugin or settings</option></select></div>
          <div class="field"><label for="pDesc">What and why (plain English for ${S.owner.first})</label><textarea class="textarea" id="pDesc"></textarea></div>
          <div class="field"><label for="pCode">Code / diff (optional)</label><textarea class="textarea mono" id="pCode" style="min-height:100px"></textarea></div>
          <button class="btn btn-primary" style="width:100%" data-action="dev-propose">${icon('send')} Send to ${S.owner.first} for approval</button>
        </div>
      </div>`;
  };

  /* 9. AI audit report */
  SCREENS.audit = () => {
    const k = S.auditAi; const a = S.audit.ais[k];
    return `
      <div class="page-head"><div><h1>AI audit report</h1><p>Wren checked ${S.audit.queries.length} real customer searches (plus a direct question about you) across ChatGPT, Claude and Gemini on ${S.audit.runAt}. Next check: ${S.audit.nextRun}.</p></div>
        ${S.role === 'owner' ? `<button class="btn" data-action="toast" data-msg="Wren audit queued — results in about 60 seconds (demo)">Run audit now</button>` : ''}</div>
      <div class="ai-tabs">${Object.keys(S.audit.ais).map((key) => {
        const x = S.audit.ais[key];
        return `<button class="ai-tab ${key === k ? 'active' : ''}" data-action="audit-ai" data-k="${key}">${aiBadge(key)}<div><div class="n">${x.name}</div>${statusChip(x.status, x.statusLabel)}</div></button>`;
      }).join('')}</div>

      <div class="grid g-main">
        <div class="stack">
          <div class="card">
            <div class="card-head"><div class="row">${aiBadge(k)}<h2>What ${a.name} says about you</h2></div></div>
            <p style="color:var(--fg-soft)">${esc(a.summary)}</p>
            ${a.results.map((r) => `<div class="mt-3"><div class="row"><span class="small"><strong>Search:</strong> “${esc(r.q)}”</span><span class="spacer"></span>${statusChip(r.status)}</div>
              <blockquote class="quote mt-1">${r.text}<span class="src">${a.name} response, verbatim · ${S.audit.runAt}</span></blockquote></div>`).join('')}
          </div>
        </div>
        <div class="stack">
          <div class="card"><div class="card-head"><h2>Accuracy issues</h2></div>
            ${a.issues.map((i) => `<div class="issue"><span class="chip chip-${i.sev} no-dot">${i.sev === 'red' ? 'Fix now' : 'Worth fixing'}</span><div><strong>${esc(i.title)}</strong><div class="small muted mt-1">${esc(i.body)}</div></div></div>`).join('')}
          </div>
          <div class="card"><div class="card-head"><h2>Competitors ${a.name} names</h2></div>
            ${competitorList(a)}
          </div>
        </div>
      </div>

      <div class="card mt-3">
        <div class="card-head"><h2>Who gets recommended, search by search</h2><span class="sub">Businesses each AI names</span></div>
        <div style="overflow-x:auto"><table class="cmp-tbl"><thead><tr><th>Customer search</th>${Object.values(S.audit.ais).map((x) => `<th>${x.name}</th>`).join('')}</tr></thead><tbody>
          ${S.audit.queries.map((q) => `<tr><td><strong>“${esc(q)}”</strong></td>${Object.values(S.audit.ais).map((x) => {
            const r = x.results.find((r) => r.q === q);
            if (!r) return '<td class="muted">—</td>';
            const you = r.status !== 'not';
            return `<td><div class="names">${you ? `<span class="name-tag you">You${r.status === 'wrong' ? ' (wrong info)' : ''}</span>` : '<span class="name-tag missing">Not you</span>'}${r.competitors.map((c) => `<span class="name-tag">${esc(c)}</span>`).join('')}</div></td>`;
          }).join('')}</tr>`).join('')}
        </tbody></table></div>
      </div>

      <div class="grid g-main mt-3">
        <div class="card"><div class="card-head"><h2>Fix list</h2><span class="sub">In priority order, plain English</span></div>
          <ul class="list-plain">${S.audit.fixes.map((f, i) => fixItem(f, i)).join('')}</ul>
        </div>
        <div class="card"><div class="card-head"><h2>Changes over time</h2></div>
          <ul class="timeline">${S.audit.events.map(evItem).join('')}</ul>
        </div>
      </div>`;
  };
  function competitorList(a) {
    const tally = {};
    a.results.forEach((r) => r.competitors.forEach((c) => { (tally[c] = tally[c] || []).push(r.q); }));
    const names = Object.keys(tally);
    if (!names.length) return '<p class="small muted">None.</p>';
    return `<ul class="list-plain small">${names.map((n) => `<li style="padding:8px 0"><strong>${esc(n)}</strong><div class="muted">Named for: ${tally[n].map((q) => `“${esc(q)}”`).join(', ')}</div></li>`).join('')}</ul>`;
  }

  /* Billing */
  SCREENS.billing = () => `
    <div class="page-head"><div><h1>Plan &amp; billing</h1><p>One plan. Everything included. Cancel any time — your website and code stay yours.</p></div></div>
    <div class="grid g-main">
      <div class="card">
        <div class="row"><h2>WingLift</h2><span class="chip chip-green">Active</span></div>
        <div class="price mt-2">€99<small> / month</small></div>
        <p class="small muted">Excl. VAT · billed monthly · next invoice 1 Dec 2026</p>
        <p class="mt-2" style="font-family:Manrope;font-weight:700">Your website, your code, your dashboard — your developer works for you again.</p>
        <ul class="incl mt-3">
          <li>Weekly Wren AI audit (ChatGPT, Claude, Gemini)</li><li>Vibe Update Agent</li><li>Unified approval queue</li><li>FAQ manager (5 slots, 3 deploys/week)</li>
          <li>Google review replies &amp; requests</li><li>Social posts: Meta, LinkedIn, Google</li><li>WhatsApp approvals &amp; alerts</li><li>Free developer guest seats</li>
        </ul>
        <div class="alert alert-navy mt-3 small">WingLift is software only. We don’t rebuild or host your website and there’s no code handover — your site stays exactly where it is.</div>
      </div>
      <div class="stack">
        <div class="card"><h3>Payment method</h3><div class="row mt-2"><span class="chip no-dot">VISA</span><span>•••• 4242 · exp 08/28</span><span class="spacer"></span><button class="btn btn-sm" data-action="toast" data-msg="Card update opened (demo)">Update</button></div></div>
        <div class="card"><h3>Invoices</h3><ul class="list-plain small mt-1">${['1 Nov 2026', '1 Oct 2026'].map((d) => `<li class="row" style="padding:8px 0"><span style="flex:1">${d}</span><span>€121.77 inc. VAT</span><a href="#/billing" data-action="toast" data-msg="Invoice PDF downloaded (demo)">PDF</a></li>`).join('')}</ul></div>
      </div>
    </div>`;

  function copyText(text, msg) {
    const fail = () => toast('Couldn’t copy — select the text and copy it manually');
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast(msg), fail); else fail();
  }

  /* ── Actions ── */
  const ACTIONS = {
    'site-mode': (el) => { S.siteMode = el.dataset.mode; if (S.pending) { const pm = S.chat.find((x) => x.id === S.pending.msgId); if (pm) pm.resolved = 'Cancelled — site type changed.'; S.pending = null; } refresh(); },
    suggest: (el) => sendChat(el.textContent),
    'vibe-approve': vibeApprove,
    'vibe-cancel': () => { const pm = S.chat.find((x) => x.id === S.pending.msgId); if (pm) pm.resolved = 'Cancelled.'; S.pending = null; S.chat.push({ id: uid('m'), from: 'agent', html: 'No problem — nothing was changed.' }); redrawChat(); },
    'vibe-edit': () => { const p = S.pending; const pm = S.chat.find((x) => x.id === p.msgId); if (pm) pm.resolved = 'Editing…'; S.pending = null; S.chat.push({ id: uid('m'), from: 'agent', html: `Sure — what should ${p.day} be instead? For example <em>“make ${p.day} 11–3”</em>.` }); redrawChat(); const i = $('#chatText'); i.value = `make ${p.day} 11–3`; i.focus(); },
    'vibe-done': (el) => { const p = { day: el.dataset.day, to: el.dataset.to, dayIdx: DAYS.indexOf(el.dataset.day.toLowerCase()) }; if (p.dayIdx >= 0) S.hours[p.dayIdx][1] = p.to; S.chat.push({ id: uid('m'), from: 'agent', wide: true, html: publishedHtml(p) }); finishPublish(p); },
    'copy-code': (el) => copyText(el.parentElement.previousElementSibling.textContent, 'Code copied to clipboard'),
    'copy-link': () => copyText('https://winglift.io/r/murphy-sons', 'Link copied: winglift.io/r/murphy-sons'),
    toast: (el) => toast(el.dataset.msg),

    filter: (el) => { S.approvalFilter = el.dataset.f; refresh(); },
    'q-approve': (el) => resolveApproval(el.dataset.id, 'approved'),
    'q-reject': (el) => resolveApproval(el.dataset.id, 'rejected'),
    'q-edit': (el) => { const a = S.approvals.find((x) => x.id === el.dataset.id); a.editing = !a.editing; refresh(); },
    'q-save': (el) => { const a = S.approvals.find((x) => x.id === el.dataset.id); const prev = a.after; a.after = $('#edit-' + a.id).value; a.editing = false; if (a.type === 'review') { const r = S.reviews.find((r) => r.text === a.quote); if (r) r.draft = a.after; } if (a.type === 'social') { const p = S.posts.find((p) => p.text === prev); if (p) p.text = a.after; } toast('Changes saved — still waiting for your approval'); refresh(); },
    'approve-all': async () => { const ids = S.approvals.filter((a) => S.approvalFilter === 'all' || a.type === S.approvalFilter).map((a) => a.id); for (const id of ids) await resolveApproval(id, 'approved'); },

    'faq-deploy': (el) => faqDeploy(+el.dataset.i),
    'faq-use': (el) => { const i = +el.dataset.i; S.faqs[i] = { ...S.faqSuggestion, live: false }; S.approvals = S.approvals.filter((a) => a.type !== 'faq'); faqDeploy(i); },
    'faq-edit': (el) => faqEditModal(+el.dataset.i),
    'faq-save': (el) => { const i = +el.dataset.i; const q = $('#fq').value.trim(); const a = $('#fa').value.trim(); if (!q || !a) { toast('Add a question and an answer'); return; } S.faqs[i] = { q, a, live: false }; closeModal(); toast('Saved as draft — deploy when ready'); refresh(); },

    'rv-approve': (el) => { const r = S.reviews.find((x) => x.id === el.dataset.id); r.replied = true; S.approvals = S.approvals.filter((a) => a.quote !== r.text); addActivity('gold', `Replied to ${r.name}’s ${r.stars}★ review`); toast('Reply posted to Google'); refresh(); },
    'rv-edit': (el) => { const r = S.reviews.find((x) => x.id === el.dataset.id); r.editing = true; refresh(); },
    'rv-save': (el) => { const r = S.reviews.find((x) => x.id === el.dataset.id); r.draft = $('#rv-' + r.id).value; r.editing = false; S.approvals.forEach((a) => { if (a.type === 'review' && a.quote === r.text) a.after = r.draft; }); refresh(); },
    'rv-regen': (el) => { const r = S.reviews.find((x) => x.id === el.dataset.id); r.draft = r.draft.replace(/^(Hi|Thanks)[^,!]*[,!]/, (m) => m.startsWith('Hi') ? `Hello ${r.name.split(' ')[0]},` : `Thank you so much, ${r.name.split(' ')[0]}!`); toast('Draft rewritten'); refresh(); },
    'rr-ch': (el) => { S.rr.channel = el.dataset.ch; S.rr.name = $('#rrName').value; refresh(); },
    'rr-send': () => { const n = $('#rrName').value || 'customer'; toast(`Review request sent to ${esc(n)} by ${{ whatsapp: 'WhatsApp', sms: 'SMS', email: 'email' }[S.rr.channel]}`); addActivity('gold', `Review request sent to ${n}`); },

    'post-approve': (el) => { const p = S.posts.find((x) => x.id === el.dataset.id); const dt = el.parentElement.querySelector('input[type="datetime-local"]'); if (dt && dt.value) p.when = fmtWhen(dt.value); p.status = 'scheduled'; S.approvals = S.approvals.filter((a) => a.after !== p.text); toast(`Scheduled for ${p.when}`); refresh(); },
    'post-unschedule': (el) => { S.posts.find((x) => x.id === el.dataset.id).status = 'draft'; refresh(); },
    'post-edit': (el) => { S.posts.find((x) => x.id === el.dataset.id).editing = true; refresh(); },
    'post-save': (el) => { const p = S.posts.find((x) => x.id === el.dataset.id); const prev = p.text; p.text = $('#pt-' + p.id).value; p.editing = false; S.approvals.forEach((a) => { if (a.type === 'social' && a.after === prev) a.after = p.text; }); refresh(); },

    wa: (el) => { S.wa[el.dataset.k] = el.dataset.v; if (el.dataset.k === 'review' && el.dataset.v === 'Approve reply') { const r = S.reviews.find((x) => x.id === 'r1'); r.replied = true; S.approvals = S.approvals.filter((a) => a.id !== 'a3'); } if (el.dataset.k === 'nudge' && el.dataset.v === 'Approve') { S.posts[0].status = 'scheduled'; S.approvals = S.approvals.filter((a) => a.id !== 'a4'); } refresh(); },

    invite: inviteModal,
    'invite-send': () => {
      const email = $('#invEmail').value.trim(); const name = $('#invName').value.trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) { toast('Enter a valid email'); $('#invEmail').focus(); return; }
      const initials = (name || email).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join('');
      S.invites.push({ name, email, initials }); closeModal(); toast(`Invite sent to ${esc(email)}`); refresh();
    },
    'as-dev': () => setRole('dev'),
    'as-owner': () => setRole('owner'),
    'modal-close': closeModal,

    'audit-ai': (el) => { S.auditAi = el.dataset.k; history.replaceState(null, '', '#/audit/' + el.dataset.k); refresh(); },
    'fix-dev': (el) => { toast(`Sent to ${S.developer.name} — she’ll see it in her developer workspace`); addActivity('navy', `Sent to developer: ${(S.audit.fixes.find((f) => f.id === el.dataset.id) || { title: 'code change' }).title}`); },
    'fix-queue': () => toast('We’ll remind you on WhatsApp tomorrow at 08:00'),

    'dev-prefill': (el) => {
      const f = S.audit.fixes.find((x) => x.id === el.dataset.id);
      $('#pTitle').value = f.title; $('#pDesc').value = f.why;
      if (f.id === 'f5') $('#pCode').value = '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Plumber",\n  "name": "Murphy & Sons Plumbing & Heating",\n  "address": { "@type": "PostalAddress", "streetAddress": "Unit 4, Donore Road Business Park", "addressLocality": "Drogheda", "postalCode": "A92 X7K2", "addressCountry": "IE" },\n  "telephone": "+353419832210"\n}\n</script>';
      $('#proposeCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    'dev-propose': () => {
      const t = $('#pTitle').value.trim(); const d = $('#pDesc').value.trim(); const c = $('#pCode').value.trim();
      if (!t) { toast('Add a title'); $('#pTitle').focus(); return; }
      S.approvals.unshift({ id: uid('a'), type: 'site', title: t, source: `Proposed by ${S.developer.name} (developer)`, when: 'Just now', fromDev: true, after: d || 'See code attached.', code: c || undefined });
      addActivity('navy', `${S.developer.name} (developer) proposed: ${t}`);
      ['#pTitle', '#pDesc', '#pCode'].forEach((s) => ($(s).value = ''));
      toast(`Sent to ${S.owner.first}’s approval queue`);
    }
  };

  function setRole(role) {
    S.role = role;
    toast(role === 'dev' ? `Now viewing as ${S.developer.name} (developer guest)` : `Back to owner view`);
    const target = role === 'dev' ? 'developer' : 'team';
    if (parseHash().route === target) render(); else go(target);
  }

  document.addEventListener('click', (e) => {
    const reset = e.target.closest('[data-reset]');
    if (reset) { resetState(); if (location.hash === '#/home') render(); toast('Demo restarted'); return; }
    const roleBtn = e.target.closest('.role-switch button');
    if (roleBtn) { if (roleBtn.dataset.role !== S.role) setRole(roleBtn.dataset.role); return; }
    const el = e.target.closest('[data-action]');
    if (el && ACTIONS[el.dataset.action]) { e.preventDefault(); ACTIONS[el.dataset.action](el); return; }
    if (e.target.id === 'modal') closeModal();
  });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'rrName') {
      S.rr.name = e.target.value;
      const p = $('#rrPreview'); if (p) p.textContent = p.textContent.replace(/^Hi [^,]*,/, `Hi ${S.rr.name || 'there'},`);
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });
  $('#menuBtn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  window.addEventListener('hashchange', render);
  if (!location.hash) history.replaceState(null, '', '#/home');
  render();
})();
