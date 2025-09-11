import bcrypt from 'bcrypt';
import User from '../models/User.model.js';
import { generateToken, cookieOptions } from '../utils/generateToken.js';

/**
 * POST /auth/register
 * Body: { email, password, name? }
 */
export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await User.create({ email: email.toLowerCase(), passwordHash, name: name || '' });

    const token = generateToken({ userId: created._id, email: created.email });
    res.cookie(process.env.COOKIE_NAME || 'token', token, cookieOptions());
    return res.status(201).json({ id: created._id, email: created.email, name: created.name });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/login
 * Body: { email, password }
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken({ userId: user._id, email: user.email });
    res.cookie(process.env.COOKIE_NAME || 'token', token, cookieOptions());
    return res.status(200).json({ id: user._id, email: user.email, name: user.name });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/logout
 */
export async function logout(req, res) {
  res.clearCookie(process.env.COOKIE_NAME || 'token', { path: '/' });
  return res.status(200).json({ message: 'Logged out' });
}
