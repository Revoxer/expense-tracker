import { describe, test, expect, beforeEach, afterAll } from "vitest";
import { registerUser, loginUser } from "../services/auth.service";
import { cleanDatabase, prisma } from "./setup";
import { ConflictError, UnauthorizedError } from "../utils/errors";

describe("auth.service", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("registerUser", () => {
    test("should register a new user", async () => {
      const email = "test@example.com";
      const password = "password123";

      const result = await registerUser(email, password);

      expect(result.email).toBe(email);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    test("should throw ConflictError when email already exists", async () => {
      const email = "test@example.com";
      const password = "password123";

      await registerUser(email, password);

      await expect(registerUser(email, password)).rejects.toThrow(
        ConflictError,
      );
    });
  });

  describe("loginUser", () => {
    beforeEach(async () => {
      await cleanDatabase();
    });

    afterAll(async () => {
      await prisma.$disconnect();
    });

    test("should login successfully", async () => {
      const email = "test@example.com";
      const password = "password123";

      await registerUser(email, password);

      const result = await loginUser("test@example.com", "password123");

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe("test@example.com");
    });

    test("should throw UnauthorizedError for wrong password", async () => {
      const email = "test@example.com";
      const password = "password123";

      await registerUser(email, password);

      await expect(
        loginUser("test@example.com", "wrongpassword"),
      ).rejects.toThrow(UnauthorizedError);
    });

    test("should throw UnauthorizedError for non-existent user", async () => {
      const email = "test@example.com";
      const password = "password123";

      await expect(loginUser(email, password)).rejects.toThrow(
        UnauthorizedError,
      );
    });
  });
});
