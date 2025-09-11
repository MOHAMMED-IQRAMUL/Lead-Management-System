import User from '../models/User.model.js';

/**
 * GET /auth/me
 */

export async function getCurrentUser(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    return res.status(200).json({ id: user._id, email: user.email, name: user.name });
  } catch (err) {
    next(err);
  }
}
