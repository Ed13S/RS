// OPTIONAL but recommended: a tiny Cloudflare Worker that keeps your Anthropic API key SECRET.
// Deploy at dash.cloudflare.com -> Workers & Pages -> Create -> paste this -> Settings -> Variables:
//   ANTHROPIC_KEY = your key (as a Secret)      ALLOWED_ORIGIN = https://YOURNAME.github.io
// Then put the worker URL in js/config.js as CLUE_PROXY_URL and leave CLUE_API_KEY empty.
export default {
  async fetch(req, env) {
    const cors = { 'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*', 'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return new Response('POST only', { status: 405, headers: cors });
    let body; try { body = await req.json(); } catch (e) { return new Response('bad json', { status: 400, headers: cors }); }
    body.model = 'claude-haiku-5-5'; body.max_tokens = Math.min(body.max_tokens || 180, 200); // lock model + size
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify(body) });
    return new Response(await r.text(), { status: r.status, headers: { ...cors, 'content-type': 'application/json' } });
  }
};
