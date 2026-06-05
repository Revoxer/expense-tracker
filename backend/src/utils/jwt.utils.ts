import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not set in .env");

interface JwtPayload {
  userId: string;
}

export const generateToken = (userId: string): string => {
  const payload: JwtPayload = { userId };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });

  return token;
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
