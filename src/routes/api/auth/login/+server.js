import { json } from "@sveltejs/kit";
import { User } from "$lib/db/models/User.js";
import { createSession, setSessionCookie } from "$lib/auth/session.js";

/**
 * Handle user login
 */
export async function POST({ request }) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validation
    if (!username || !password) {
      return json(
        { error: "Username/email and password are required" },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await User.authenticate(username, password);

    if (!user) {
      return json({ error: "Invalid credentials" }, { status: 401 });
    }

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
          username: user.username,
        },
      },
      { headers }
    );
  } catch (error) {
    console.error("Login error:", error);
    return json({ error: error.message || "Failed to login" }, { status: 500 });
  }
}
