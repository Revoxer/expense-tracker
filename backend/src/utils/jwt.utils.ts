import jwt from "jsonwebtoken";
import { config } from "../config/env";

interface JwtPayload {
  userId: string;
}

export const generateToken = (userId: string): string => {
  const payload: JwtPayload = { userId };

  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: "7d",
  });

  return token;
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
};
