import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const JWT_SECRET = process.env.JWT_SECRET;

export async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.[process.env.COOKIE_NAME || "token"];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    if (!JWT_SECRET) throw new Error("JWT_SECRET not set");

    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload?.userId)
      return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(payload.userId).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    req.user = { id: user._id.toString(), email: user.email, name: user.name };
    next();
  } catch (err) {
    // eslint-disable-next-line no-console
    // console.error('authMiddleware error', err);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
