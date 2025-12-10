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
    console.log("Signup - User created:", { _id: user._id.toString(), email: user.email });

    // Verify user was saved by fetching it back from database
    const userId = user._id.toString();
    console.log("Signup - Verifying user with userId:", userId);
    
    // Also try direct database query
    const { connectToDatabase } = await import('$lib/db/mongodb.js');
    const { ObjectId } = await import('mongodb');
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    try {
      const directUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
      console.log("Signup - Direct DB query result:", directUser ? "Found" : "Not found");
      if (directUser) {
        console.log("Signup - Direct DB user:", { _id: directUser._id.toString(), email: directUser.email });
      }
    } catch (directError) {
      console.error("Signup - Direct DB query error:", directError.message);
    }
    
    const verifiedUser = await User.findById(userId);
    
    if (!verifiedUser) {
      console.error('Signup - User creation verification failed: User not found after creation, userId:', userId);
      // List all users to debug
      try {
        const allUsers = await usersCollection.find({}).limit(10).toArray();
        console.log("Signup - All users in DB:", allUsers.map(u => ({ _id: u._id.toString(), email: u.email })));
      } catch (listError) {
        console.error("Signup - Error listing users:", listError.message);
      }
      return json(
        { error: 'Failed to create user account. Please try again.' },
        { status: 500 }
      );
    }

    console.log("Signup - User verified:", { _id: verifiedUser._id.toString(), email: verifiedUser.email });

    // Create session
    const token = await createSession(userId);
    console.log("Signup - Session created for userId:", userId);

    // Set cookie
    const headers = new Headers();
    setSessionCookie(headers, token);

    return json(
      {
        success: true,
        user: {
          _id: verifiedUser._id.toString(),
          name: verifiedUser.name,
          email: verifiedUser.email,
          username: verifiedUser.username
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

