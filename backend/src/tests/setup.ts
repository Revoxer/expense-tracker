import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "../config/env";

const adapter = new PrismaPg({
  connectionString: config.testDatabaseUrl,
});

export const prisma = new PrismaClient({ adapter });

export const cleanDatabase = async () => {
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();
};
