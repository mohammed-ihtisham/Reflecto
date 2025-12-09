import { redirect } from '@sveltejs/kit';

/**
 * Check if user is already authenticated and redirect to dashboard
 */
export async function load({ locals }) {
  // If user is already authenticated, redirect to dashboard
  if (locals.user) {
    throw redirect(307, '/dashboard');
  }

  return {};
}

