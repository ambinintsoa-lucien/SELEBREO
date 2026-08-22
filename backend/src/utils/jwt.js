import jwt from "jsonwebtoken";

const {
  JWT_SECRET,
  JWT_ACCESS_EXPIRES_IN = "30m",
  JWT_REFRESH_EXPIRES_IN = "30d",
} = process.env;

export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
