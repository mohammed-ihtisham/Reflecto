import { json } from '@sveltejs/kit';
import { getSession } from '$lib/auth/session.js';
import { User } from '$lib/db/models/User.js';

/**
 * Get current authenticated user
 */
export async function GET({ request }) {
  try {
    const session = await getSession(request);

    if (!session || !session.userId) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await User.findById(session.userId);

    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return json({
      user: {
        _id: userWithoutPassword._id.toString(),
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
        username: userWithoutPassword.username
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return json({ error: 'Failed to get user' }, { status: 500 });
  }
}

