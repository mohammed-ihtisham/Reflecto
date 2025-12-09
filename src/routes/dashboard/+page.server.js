import { redirect } from '@sveltejs/kit';

/**
 * Protect dashboard route - require authentication
 */
export async function load({ locals }) {
  // If user is not authenticated, redirect to auth page
  if (!locals.user) {
    throw redirect(307, '/auth');
  }

  return {
    user: locals.user
  };
}

