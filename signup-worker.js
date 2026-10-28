// WingLift signup notification worker
// Deployed at: https://winglift-signup.winglift.workers.dev

// RESEND_API_KEY is set as a Cloudflare Worker secret (not stored in code)
// To set it: in Cloudflare Workers dashboard → winglift-signup → Settings → Variables → Add secret
// Name: RESEND_API_KEY, Value: your Resend API key
const NOTIFY_EMAIL = 'info@winglift.io';
const FROM_EMAIL = 'onboarding@resend.dev';

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://winglift.io',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    let email;
    try {
      const body = await request.json();
      email = body.email;
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://winglift.io' },
      });
    }

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://winglift.io' },
      });
    }

    // Send notification email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: NOTIFY_EMAIL,
        subject: `New WingLift signup: ${email}`,
        html: `<p>New early access signup on winglift.io</p><p><strong>Email:</strong> ${email}</p><p><em>Signed up at ${new Date().toISOString()}</em></p>`,
      }),
    });

    if (!resendResponse.ok) {
      const err = await resendResponse.text();
      console.error('Resend error:', err);
      // Still return success to user - don't block their signup experience
    }


    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://winglift.io',
      },
    });
  },
};
