import { json } from '@sveltejs/kit';
import { clearSessionCookie } from '$lib/auth/session.js';

/**
 * Handle user logout
 */
export async function POST() {
  const headers = new Headers();
  clearSessionCookie(headers);

  return json({ success: true }, { headers });
}

