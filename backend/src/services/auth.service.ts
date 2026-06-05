import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.utils";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export const registerUser = async (email: string, password: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email already in use");
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

export const loginUser = async (email: string, password: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    throw new Error("Invalid credentials");
  }

  const checkPassword: boolean = await bcrypt.compare(
    password,
    existingUser.passwordHash,
  );

  if (!checkPassword) {
    throw new Error("Invalid credentials");
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

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
};
