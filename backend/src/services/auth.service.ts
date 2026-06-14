import { prisma } from "../db/prisma";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.utils";
import { AuthResponse, UserDto } from "../types/auth.types";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors";

export const registerUser = async (
  email: string,
  password: string,
): Promise<UserDto> => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError("Email already in use");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user
    .create({
      data: { email, passwordHash },
    })
    .catch((error) => {
      if (error.code === "P2002") {
        throw new ConflictError("Email already in use");
      }
      throw error;
    });

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const checkPassword: boolean = await bcrypt.compare(
    password,
    existingUser.passwordHash,
  );

  if (!checkPassword) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const token = generateToken(existingUser.id);

  return {
    token,
    user: {
      id: existingUser.id,
      email: existingUser.email,
      createdAt: existingUser.createdAt,
    },
  };
};

export const getMe = async (userId: string): Promise<UserDto> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new NotFoundError("User not found");

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
};
