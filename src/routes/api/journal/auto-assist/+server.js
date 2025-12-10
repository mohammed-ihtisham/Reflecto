import { json } from '@sveltejs/kit';
import { getSession } from '$lib/auth/session.js';
import { AutoAssistAgent } from '$lib/agents/AutoAssistAgent.js';

/**
 * Generate a concise, tailored auto-assist reflection question for the current journal text.
 */
export async function POST({ request }) {
  try {
    const session = await getSession(request);
    if (!session || !session.userId) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const text = String(body?.text || '').trim();

    if (!text) {
      return json({ error: 'Text is required' }, { status: 400 });
    }

    const agent = new AutoAssistAgent();
    const contents = [{ role: 'user', parts: [{ text }] }];

    const { text: prompt } = await agent.respond(contents);

    return json({ prompt: prompt || '' });
  } catch (err) {
    const message = String(err?.message || err || '');
    console.error('Auto-assist API error:', err);
    const lower = message.toLowerCase();
    const isKeyError = lower.includes('gemini_api_key') || lower.includes('api key') || lower.includes('apikey');
    const status = isKeyError ? 400 : 500;
    return json({ error: 'Failed to generate auto-assist prompt', details: message }, { status });
  }
}
