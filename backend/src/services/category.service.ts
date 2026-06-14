import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "../config/env";
import { NotFoundError } from "../utils/errors";
import { CategoryResponse } from "../types/category.types";

const adapter = new PrismaPg({
  connectionString: config.databaseUrl,
});

const prisma = new PrismaClient({ adapter });

export const findAllCategories = async (): Promise<CategoryResponse[]> => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return categories;
};

export const findCategoryById = async (
  categoryId: string,
): Promise<CategoryResponse> => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return category;
};
