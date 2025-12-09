import { json } from '@sveltejs/kit';
import { User } from '$lib/db/models/User.js';
import { createSession, setSessionCookie } from '$lib/auth/session.js';

/**
 * Handle user signup
 */
export async function POST({ request }) {
  try {
    const body = await request.json();
    const { name, email, password, username } = body;

    // Validation
    if (!name || !email || !password) {
      return json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Create user
    const user = await User.create({ name, email, password, username });

    // Create session
    const token = await createSession(user._id.toString());

    // Set cookie
    const headers = new Headers();
    setSessionCookie(headers, token);

    return json(
      {
        success: true,
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          username: user.username
        }
      },
      { headers }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return json(
      { error: error.message || 'Failed to create account' },
      { status: 400 }
    );
  }
}

