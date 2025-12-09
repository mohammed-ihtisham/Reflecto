import { serialize } from 'cookie';
import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'reflecto_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Get JWT secret from environment
// In production, you MUST set JWT_SECRET in your .env file
// This is server-only code, so process.env is available
const SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production-change-this';

/**
 * Create a session token for a user
 * @param {string} userId
 * @returns {Promise<string>} JWT token
 */
export async function createSession(userId) {
  const secret = new TextEncoder().encode(SECRET);
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .sign(secret);

  return token;
}

/**
 * Verify and decode a session token
 * @param {string} token
 * @returns {Promise<Object|null>} Decoded token payload or null
 */
export async function verifySession(token) {
  try {
    const secret = new TextEncoder().encode(SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Get session from request cookies
 * @param {Request} request - SvelteKit request object
 * @returns {Promise<Object|null>} Session data or null
 */
export async function getSession(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {});
  
  const token = cookies[COOKIE_NAME];

  if (!token) {
    return null;
  }

  return await verifySession(token);
}

/**
 * Set session cookie in response headers
 * @param {Headers} headers
 * @param {string} token
 */
export function setSessionCookie(headers, token) {
  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  });

  headers.append('Set-Cookie', cookie);
}

/**
 * Clear session cookie
 * @param {Headers} headers
 */
export function clearSessionCookie(headers) {
  const cookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });

  headers.append('Set-Cookie', cookie);
}

