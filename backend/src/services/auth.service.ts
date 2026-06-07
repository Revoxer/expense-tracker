import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.utils";
import { AuthResponse, UserDto } from "../types/auth.types";
import { config } from "../config/env";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors";

const adapter = new PrismaPg({
  connectionString: config.databaseUrl,
});

const prisma = new PrismaClient({ adapter });

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

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
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
