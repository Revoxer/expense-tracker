import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Food", icon: "🍔", color: "#FF6B6B" },
  { name: "Transport", icon: "🚗", color: "#4ECDC4" },
  { name: "Entertainment", icon: "🎬", color: "#45B7D1" },
  { name: "Health", icon: "💊", color: "#96CEB4" },
  { name: "Home", icon: "🏠", color: "#FFEAA7" },
  { name: "Clothes", icon: "👕", color: "#DDA0DD" },
  { name: "Education", icon: "📚", color: "#98D8C8" },
  { name: "Other", icon: "📦", color: "#B0B0B0" },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
  console.log("Seeded categories successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
