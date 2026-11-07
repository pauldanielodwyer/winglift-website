/* Fake data for the WingLift dashboard prototype. Nothing here is real. */
window.WL_DATA = {
  business: {
    name: 'Murphy & Sons Plumbing & Heating',
    short: 'Murphy & Sons Plumbing',
    site: 'murphyplumbing.ie',
    town: 'Drogheda, Co. Louth',
    address: 'Unit 4, Donore Road Business Park, Drogheda, A92 X7K2',
    oldAddress: '14 West Street, Drogheda',
    phone: '041 983 2210',
    cms: 'WordPress'
  },
  owner: { name: 'Declan Murphy', first: 'Declan', initials: 'DM', email: 'declan@murphyplumbing.ie' },
  developer: { name: 'Aoife Byrne', first: 'Aoife', initials: 'AB', email: 'aoife@byrnewebstudio.ie', company: 'Byrne Web Studio' },

  hours: [
    ['Monday', '08:00 – 18:00'],
    ['Tuesday', '08:00 – 18:00'],
    ['Wednesday', '08:00 – 18:00'],
    ['Thursday', '08:00 – 18:00'],
    ['Friday', '08:00 – 18:00'],
    ['Saturday', '09:00 – 14:00'],
    ['Sunday', 'Emergency call-outs only']
  ],

  audit: {
    runAt: 'Thu 5 Nov 2026, 07:00',
    nextRun: 'Thu 12 Nov 2026',
    queries: ['plumber in Drogheda', 'emergency plumber near Drogheda', 'boiler service Co. Louth', 'heat pump installer Drogheda'],
    ais: {
      chatgpt: {
        name: 'ChatGPT', cls: 'ai-chatgpt', letter: 'G',
        status: 'not', statusLabel: 'Not mentioned',
        headline: 'Names 3 competitors for “plumber in Drogheda” — not you.',
        summary: 'ChatGPT recommends Boyne Valley Plumbing, Drogheda Heating Services and QuickFix Plumbers Louth. When asked about Murphy & Sons directly, it says it has no reliable information.',
        results: [
          { q: 'plumber in Drogheda', status: 'not', text: 'Here are some well-reviewed plumbers in Drogheda: <mark>Boyne Valley Plumbing</mark> — offers general plumbing and bathroom fitting, with strong Google reviews. <mark>Drogheda Heating Services</mark> — specialises in boilers and central heating. <mark>QuickFix Plumbers Louth</mark> — a newer company covering Drogheda and Dundalk with 24/7 call-outs. It’s worth checking recent reviews and asking for a written quote.', competitors: ['Boyne Valley Plumbing', 'Drogheda Heating Services', 'QuickFix Plumbers Louth'] },
          { q: 'emergency plumber near Drogheda', status: 'not', text: 'For urgent issues near Drogheda, <mark>QuickFix Plumbers Louth</mark> advertises 24/7 emergency call-outs. <mark>Boyne Valley Plumbing</mark> also handles same-day jobs during business hours.', competitors: ['QuickFix Plumbers Louth', 'Boyne Valley Plumbing'] },
          { q: 'boiler service Co. Louth', status: 'not', text: '<mark>Drogheda Heating Services</mark> and <mark>Louth Gas Care</mark> both offer annual boiler servicing in Co. Louth. Make sure your engineer is RGII registered for gas boilers.', competitors: ['Drogheda Heating Services', 'Louth Gas Care'] },
          { q: 'heat pump installer Drogheda', status: 'not', text: 'SEAI-registered heat pump installers serving Drogheda include <mark>Boyne Energy Solutions</mark> and <mark>GreenHeat Meath</mark>. Ask for a heat loss survey before getting quotes.', competitors: ['Boyne Energy Solutions', 'GreenHeat Meath'] },
          { q: 'Tell me about Murphy & Sons Plumbing in Drogheda', status: 'not', text: '<mark class="bad">I don’t have reliable information about a business called Murphy & Sons Plumbing in Drogheda.</mark> I’d recommend checking their website or Google Business Profile for services and contact details.', competitors: [] }
        ],
        issues: [
          { sev: 'red', title: 'You’re invisible for your main search', body: 'ChatGPT doesn’t name you for “plumber in Drogheda”, even though you have more Google reviews than two of the three businesses it does name.' },
          { sev: 'amber', title: 'It can’t describe your business', body: 'Asked directly, ChatGPT says it has no reliable information. Your website doesn’t clearly state your services and town in plain text.' }
        ]
      },
      claude: {
        name: 'Claude', cls: 'ai-claude', letter: 'C',
        status: 'yes', statusLabel: 'Mentioned', isNew: true,
        headline: 'Started mentioning you this week for “boiler service Co. Louth”.',
        summary: 'Claude describes you accurately as a family-run plumber in Drogheda. It doesn’t yet know you install heat pumps.',
        results: [
          { q: 'plumber in Drogheda', status: 'yes', text: 'Options in Drogheda include <mark>Murphy & Sons Plumbing & Heating</mark>, a family-run business offering emergency repairs, boiler servicing and bathroom installations, as well as <mark>Boyne Valley Plumbing</mark>. Check recent reviews and confirm availability for your job.', competitors: ['Boyne Valley Plumbing'] },
          { q: 'emergency plumber near Drogheda', status: 'yes', text: '<mark>Murphy & Sons Plumbing & Heating</mark> is known locally for same-day emergency call-outs in the Drogheda area. <mark>QuickFix Plumbers Louth</mark> also advertises 24/7 service.', competitors: ['QuickFix Plumbers Louth'] },
          { q: 'boiler service Co. Louth', status: 'yes', text: 'For boiler servicing in Co. Louth, <mark>Murphy & Sons Plumbing & Heating</mark> in Drogheda and <mark>Drogheda Heating Services</mark> are both options. A standard service typically takes about an hour.', competitors: ['Drogheda Heating Services'] },
          { q: 'heat pump installer Drogheda', status: 'not', text: 'For heat pump installation near Drogheda, look for SEAI-registered installers such as <mark>Boyne Energy Solutions</mark>. SEAI grants of up to €6,500 may be available.', competitors: ['Boyne Energy Solutions'] }
        ],
        issues: [
          { sev: 'amber', title: 'Missing service: heat pumps', body: 'Claude doesn’t know you’re an SEAI-registered heat pump installer, so it sends those customers to Boyne Energy Solutions.' }
        ]
      },
      gemini: {
        name: 'Gemini', cls: 'ai-gemini', letter: 'G',
        status: 'wrong', statusLabel: 'Inaccurate info',
        headline: 'Gemini lists your old address and says you’re closed on Sundays.',
        summary: 'Gemini mentions you, but sends customers to 14 West Street (you moved in March) and says you don’t do Sunday call-outs.',
        results: [
          { q: 'plumber in Drogheda', status: 'wrong', text: '<mark>Murphy & Sons Plumbing & Heating</mark> is located at <mark class="bad">14 West Street, Drogheda</mark> and offers general plumbing and boiler repairs. Other local options include <mark>Boyne Valley Plumbing</mark>.', competitors: ['Boyne Valley Plumbing'] },
          { q: 'emergency plumber near Drogheda', status: 'wrong', text: '<mark>QuickFix Plumbers Louth</mark> offers 24/7 call-outs. <mark>Murphy & Sons</mark> is open Monday to Saturday but is <mark class="bad">closed on Sundays</mark>.', competitors: ['QuickFix Plumbers Louth'] },
          { q: 'boiler service Co. Louth', status: 'yes', text: 'Boiler servicing in Co. Louth is offered by <mark>Murphy & Sons Plumbing & Heating</mark>, <mark>Drogheda Heating Services</mark> and <mark>Louth Gas Care</mark>.', competitors: ['Drogheda Heating Services', 'Louth Gas Care'] },
          { q: 'heat pump installer Drogheda', status: 'not', text: 'SEAI-registered installers near Drogheda include <mark>Boyne Energy Solutions</mark> and <mark>GreenHeat Meath</mark>.', competitors: ['Boyne Energy Solutions', 'GreenHeat Meath'] }
        ],
        issues: [
          { sev: 'red', title: 'Old address: 14 West Street', body: 'Gemini still shows the address you left in March. Customers searching on Android or Google may go to the wrong place.' },
          { sev: 'red', title: 'Says you’re closed on Sundays', body: 'You take emergency call-outs on Sundays, but Gemini says you’re closed. It’s likely reading an old Golden Pages listing.' }
        ]
      }
    },
    fixes: [
      { id: 'f1', title: 'Fix your old address on Golden Pages and Google Business Profile', why: 'Gemini is reading 14 West Street from an old Golden Pages listing. Updating it is the fastest way to stop customers going to the wrong place.', who: 'You', effort: '10 min', action: 'queue' },
      { id: 'f2', title: 'Add a clear “Plumber in Drogheda” section to your homepage', why: 'ChatGPT can’t tell what you do or where. One plain-English paragraph naming your services and towns fixes that.', who: 'WingLift', effort: 'We draft it, you approve', action: 'vibe' },
      { id: 'f3', title: 'Add a heat pump services page', why: 'Claude and Gemini send heat pump customers to Boyne Energy Solutions because your site never mentions heat pumps.', who: 'Your developer', effort: '1–2 hours', action: 'dev' },
      { id: 'f4', title: 'Answer “Are you open on Sundays?” in your FAQ', why: 'Gemini says you’re closed on Sundays. A clear FAQ answer gives AI systems the right information.', who: 'WingLift', effort: 'Uses 1 FAQ deploy', action: 'faq' },
      { id: 'f5', title: 'Add LocalBusiness structured data (schema)', why: 'Hidden code that tells AI your address, hours and services in a format it trusts. Your developer can paste it in.', who: 'Your developer', effort: '30 min', action: 'dev' },
      { id: 'f6', title: 'Ask 5 recent customers for a Google review', why: 'ChatGPT names businesses with recent reviews that mention the town. Your newest review is three weeks old.', who: 'You', effort: '5 min', action: 'reviews' }
    ],
    events: [
      { d: 'Thu 5 Nov', type: 'good', ai: 'Claude', text: 'Claude started mentioning you for “boiler service Co. Louth”.' },
      { d: 'Wed 4 Nov', type: 'bad', ai: 'ChatGPT', text: 'A competitor just appeared in ChatGPT results: QuickFix Plumbers Louth now shows for “plumber in Drogheda”.' },
      { d: 'Thu 29 Oct', type: 'good', ai: 'Gemini', text: 'Gemini picked up your new phone number (041 983 2210).' },
      { d: 'Thu 29 Oct', type: 'bad', ai: 'Gemini', text: 'Gemini started saying you’re closed on Sundays.' },
      { d: 'Thu 22 Oct', type: 'bad', ai: 'ChatGPT', text: 'ChatGPT stopped mentioning you for “boiler service Co. Louth”.' },
      { d: 'Thu 15 Oct', type: 'info', ai: 'Wren', text: 'First weekly Wren audit completed. 4 searches checked across ChatGPT, Claude and Gemini.' }
    ]
  },

  approvals: [
    { id: 'a1', type: 'site', title: 'Homepage: add “Plumber in Drogheda” intro paragraph', source: 'Wren fix #2', when: '2h ago',
      before: 'Welcome to Murphy & Sons. Quality work you can trust.',
      after: 'Murphy & Sons Plumbing & Heating is a family-run plumber in Drogheda, Co. Louth. We handle emergency repairs, boiler servicing, bathroom installs and SEAI-registered heat pump installation across Drogheda, Termonfeckin, Laytown and Duleek.' },
    { id: 'a2', type: 'faq', title: 'New FAQ: “Are you open on Sundays?”', source: 'Wren fix #4', when: '3h ago',
      after: 'Yes — we take emergency call-outs every Sunday. Ring 041 983 2210 and we’ll get to you as quickly as we can.' },
    { id: 'a3', type: 'review', title: 'Reply to Mark D. (2★) — flagged', source: 'Google review', when: '5h ago', flagged: true,
      quote: 'Quoted one price, invoice came in €80 higher. The work itself was fine but nobody explained the extra.',
      after: 'Hi Mark, thanks for taking the time to tell us — you’re right that any change to the price should have been explained before we finished, and I’m sorry it wasn’t. The extra was for a replacement valve we found on the day, but that’s no excuse for not talking it through. I’d like to sort this out properly: please give me a ring on 041 983 2210. — Declan' },
    { id: 'a4', type: 'social', title: 'Google Business Profile post: boiler service season', source: 'Social manager', when: 'Yesterday', platform: 'Google Business Profile',
      after: 'Is your boiler ready for winter? Book your annual service before the cold snap — from €95 inc. VAT, RGII registered. Serving Drogheda and all of Co. Louth.' },
    { id: 'a5', type: 'review', title: 'Reply to Sarah K. (5★)', source: 'Google review', when: 'Yesterday',
      quote: 'Declan came out the same evening for a burst pipe under the sink. Tidy, fair price, explained everything.',
      after: 'Thanks a million Sarah! Burst pipes are never fun — glad we could get to you the same evening. Give us a shout any time. — Declan' },
    { id: 'a6', type: 'site', title: 'Add LocalBusiness schema to site header', source: 'Proposed by Aoife Byrne (developer)', when: '2 days ago', fromDev: true,
      after: 'Adds JSON-LD structured data with your address, opening hours, phone, service area and services. Invisible to visitors; read by Google and AI systems.' },
    { id: 'a7', type: 'social', title: 'Facebook & Instagram: meet the team — Ciarán', source: 'Social manager', when: '2 days ago', platform: 'Meta',
      after: 'Meet Ciarán, our newest qualified plumber! Ciarán finished his apprenticeship with us this summer and already has a reputation for leaving every kitchen cleaner than he found it.' }
  ],

  faqs: [
    { q: 'Do you offer emergency call-outs?', a: 'Yes. We cover emergency leaks, burst pipes and no-heat call-outs across Drogheda and surrounding areas, 7 days a week.', live: true },
    { q: 'What areas do you cover?', a: 'Drogheda, Termonfeckin, Laytown, Bettystown, Duleek, Clogherhead and most of Co. Louth and east Meath.', live: true },
    { q: 'How much does a boiler service cost?', a: 'A standard gas or oil boiler service is €95 including VAT. We’re RGII registered.', live: true },
    { q: 'Are you SEAI registered for heat pump grants?', a: 'Yes. We’re an SEAI-registered installer and can help you apply for grants of up to €6,500.', live: false },
    null
  ],
  faqSuggestion: { q: 'Are you open on Sundays?', a: 'We take emergency call-outs every Sunday. Ring 041 983 2210.' },
  faqAllowance: { total: 3, used: 1, resets: 'Monday' },

  reviews: [
    { id: 'r1', name: 'Mark Doyle', initials: 'MD', stars: 2, when: '5 hours ago', flagged: true,
      text: 'Quoted one price, invoice came in €80 higher. The work itself was fine but nobody explained the extra.',
      draft: 'Hi Mark, thanks for taking the time to tell us — you’re right that any change to the price should have been explained before we finished, and I’m sorry it wasn’t. The extra was for a replacement valve we found on the day, but that’s no excuse for not talking it through. I’d like to sort this out properly: please give me a ring on 041 983 2210. — Declan' },
    { id: 'r2', name: 'Sarah Kelly', initials: 'SK', stars: 5, when: 'Yesterday',
      text: 'Declan came out the same evening for a burst pipe under the sink. Tidy, fair price, explained everything.',
      draft: 'Thanks a million Sarah! Burst pipes are never fun — glad we could get to you the same evening. Give us a shout any time. — Declan' },
    { id: 'r3', name: 'Tom Gallagher', initials: 'TG', stars: 4, when: '3 days ago',
      text: 'Great job on the new bathroom. Took a day longer than planned but the finish is excellent.',
      draft: 'Thanks Tom, really appreciate it. Sorry again about the extra day — the tiles arrived late from the supplier — but we’re glad you’re happy with the finish. Enjoy the new bathroom! — Declan' },
    { id: 'r4', name: 'Niamh O’Brien', initials: 'NO', stars: 5, when: '3 weeks ago', replied: true,
      text: 'Boiler service was quick and tidy. Ciarán was very friendly and explained what he’d checked.',
      draft: 'Thanks Niamh! I’ll pass that on to Ciarán. See you next year. — Declan' }
  ],

  posts: [
    { id: 'p1', platform: 'gbp', name: 'Google Business Profile', status: 'draft', when: 'Tue 10 Nov, 11:00', color: '#34A853', img: 'Boiler service season · from €95', imgBg: 'linear-gradient(135deg,#13234A,#2B3D6B)',
      text: 'Is your boiler ready for winter? Book your annual service before the cold snap — from €95 inc. VAT, RGII registered. Serving Drogheda and all of Co. Louth.' },
    { id: 'p2', platform: 'meta', name: 'Facebook & Instagram', status: 'draft', when: 'Wed 11 Nov, 19:00', color: '#1877F2', img: 'Meet Ciarán', imgBg: 'linear-gradient(135deg,#E3A72F,#C8921A)',
      text: 'Meet Ciarán, our newest qualified plumber! Ciarán finished his apprenticeship with us this summer and already has a reputation for leaving every kitchen cleaner than he found it.' },
    { id: 'p3', platform: 'li', name: 'LinkedIn', status: 'draft', when: 'Thu 12 Nov, 09:00', color: '#0A66C2', img: 'We’re hiring: apprentice plumber', imgBg: 'linear-gradient(135deg,#0A66C2,#13234A)',
      text: 'We’re hiring! Murphy & Sons is looking for an apprentice plumber to join our Drogheda team. Full SOLAS apprenticeship, van provided, and a family business that’s been looking after Louth homes for over 25 years.' },
    { id: 'p4', platform: 'gbp', name: 'Google Business Profile', status: 'scheduled', when: 'Fri 13 Nov, 10:00', color: '#34A853', img: 'Heat pump grants explained', imgBg: 'linear-gradient(135deg,#1F9D6B,#13234A)',
      text: 'Thinking about a heat pump? SEAI grants of up to €6,500 are available. As an SEAI-registered installer, we handle the paperwork for you.' }
  ],

  activity: [
    { ico: 'good', text: 'Claude started mentioning you for “boiler service Co. Louth”', when: 'Thu 5 Nov' },
    { ico: 'bad', text: 'New 2★ Google review from Mark D. — reply drafted', when: '5 hours ago' },
    { ico: 'navy', text: 'Aoife Byrne (developer) proposed: Add LocalBusiness schema', when: '2 days ago' },
    { ico: 'bad', text: 'A competitor appeared in ChatGPT results: QuickFix Plumbers Louth', when: 'Wed 4 Nov' },
    { ico: 'gold', text: 'FAQ “How much does a boiler service cost?” published to your site', when: 'Mon 2 Nov' },
    { ico: 'good', text: 'Google Business Profile post “Heat pump grants” scheduled', when: 'Mon 2 Nov' }
  ],

  team: [
    { name: 'Declan Murphy', email: 'declan@murphyplumbing.ie', role: 'Owner', initials: 'DM', color: '#13234A' },
    { name: 'Aoife Byrne', email: 'aoife@byrnewebstudio.ie', role: 'Developer guest', initials: 'AB', color: '#4A6CB7', note: 'Byrne Web Studio · joined 12 Oct' }
  ],

  deployLog: [
    { id: 'chg_8f21', when: 'Mon 2 Nov, 14:02', what: 'FAQ added: “How much does a boiler service cost?”', how: 'WP REST · POST /wp/v2/pages/42', by: 'Declan (approved)', rev: 'rev 4171' },
    { id: 'chg_8e97', when: 'Thu 29 Oct, 09:15', what: 'Phone number updated in footer widget', how: 'WP REST · POST /wp/v2/widgets/text-3', by: 'Declan (approved)', rev: 'rev 4158' },
    { id: 'chg_8d40', when: 'Tue 20 Oct, 17:41', what: 'FAQPage JSON-LD regenerated', how: 'WP REST · POST /wp/v2/pages/42 (meta)', by: 'Auto (FAQ deploy)', rev: 'rev 4133' },
    { id: 'chg_8c02', when: 'Mon 12 Oct, 11:20', what: 'WingLift connected (application password)', how: 'WP REST · auth check', by: 'Aoife (setup)', rev: '—' }
  ]
};
