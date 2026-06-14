import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/errors";
import { CategoryResponse } from "../types/category.types";

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
