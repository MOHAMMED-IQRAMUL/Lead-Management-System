import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '6h';

if (!JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('⚠️  JWT_SECRET not set. Set process.env.JWT_SECRET for production use.');
}

/**
 * Generate a signed JWT token for a user payload.
 * @param {{ userId: string, email?: string, [key: string]: any }} payload
 * @param {Object} [options] - jwt.sign options override
 * @returns {string} token
 */

export function generateToken(payload = {}, options = {}) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }

  const signOptions = { expiresIn: JWT_EXPIRES_IN, ...options };
  const token = jwt.sign(payload, JWT_SECRET, signOptions);
  return token;
}

/**
 * Helper to create cookie options for httpOnly cookie set on response.
 * Callers can use this to set the cookie after login/register.
 * @returns {{ httpOnly: boolean, secure: boolean, sameSite: string, maxAge: number, path: string }}
 */

export function cookieOptions() {
  const secure = process.env.NODE_ENV === 'production';
  const maxAgeSeconds = (() => {
    try {
      if (/^\d+$/.test(JWT_EXPIRES_IN)) {
        return parseInt(JWT_EXPIRES_IN, 10);
      }
      const match = JWT_EXPIRES_IN.match(/^(\d+)([smhd])$/i);
      if (match) {
        const val = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        if (unit === 's') return val;
        if (unit === 'm') return val * 60;
        if (unit === 'h') return val * 3600;
        if (unit === 'd') return val * 86400;
      }
    } catch (e) {
    }
    return 6 * 3600; 
  })();

  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'strict' : 'lax', 
    maxAge: maxAgeSeconds * 1000, 
    path: '/',
  };
}
