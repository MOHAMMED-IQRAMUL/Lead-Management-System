import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '6h';

if (!JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('⚠️ JWT_SECRET not set in environment variables.');
}

/**
 * Generate JWT token for payload.
 * @param {Object} payload
 */
export function generateToken(payload = {}, options = {}) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in env');
  }
  const signOptions = { expiresIn: JWT_EXPIRES_IN, ...options };
  return jwt.sign(payload, JWT_SECRET, signOptions);
}

/**
 * Cookie options for httpOnly token cookie.
 */
export function cookieOptions() {
  const secure = process.env.NODE_ENV === 'production';
  const sameSite = secure ? 'strict' : 'lax';

  const parseMaxAgeMs = () => {
    const v = JWT_EXPIRES_IN;
    if (!v) return 6 * 3600 * 1000;
    if (/^\d+$/.test(v)) return parseInt(v, 10) * 1000;
    const m = v.match(/^(\d+)([smhd])$/i);
    if (m) {
      const val = parseInt(m[1], 10);
      const unit = m[2].toLowerCase();
      if (unit === 's') return val * 1000;
      if (unit === 'm') return val * 60 * 1000;
      if (unit === 'h') return val * 3600 * 1000;
      if (unit === 'd') return val * 24 * 3600 * 1000;
    }
    return 6 * 3600 * 1000;
  };

  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: parseMaxAgeMs(),
    path: '/',
  };
}
