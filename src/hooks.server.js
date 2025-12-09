import { getSession } from '$lib/auth/session.js';
import { User } from '$lib/db/models/User.js';

/**
 * SvelteKit hooks for server-side session management
 */
export async function handle({ event, resolve }) {
  // Get session from cookies
  const session = await getSession(event.request);

  if (session && session.userId) {
    // Fetch user and attach to event.locals
    try {
      const user = await User.findById(session.userId);
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        event.locals.user = {
          _id: userWithoutPassword._id.toString(),
          name: userWithoutPassword.name,
          email: userWithoutPassword.email,
          username: userWithoutPassword.username
        };
      }
    } catch (error) {
      console.error('Error fetching user in hooks:', error);
    }
  }

  return resolve(event);
}

