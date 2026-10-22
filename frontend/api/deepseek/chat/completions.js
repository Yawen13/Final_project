// Vercel Edge Function: forwards Inkling requests to DeepSeek with the API key
// kept on the server. In development vite.config.js proxies the same path, so
// the browser only ever talks to /api/deepseek/chat/completions.
export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'DEEPSEEK_API_KEY is not configured on the server.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const upstream = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: await request.text(),
  });

  // Pass the stream straight through — Inkling reads server-sent events
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
