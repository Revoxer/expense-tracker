import { describe, test, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import app from "../index";
import { cleanDatabase, prisma } from "./setup";

const registerAndLogin = async () => {
  await request(app)
    .post("/api/v1/auth/register")
    .send({ email: "test@example.com", password: "password123" });

  const response = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "test@example.com", password: "password123" });

  return response.body.token as string;
};

const createTransaction = async (token: string, overrides = {}) => {
  const categories = await prisma.category.findMany({ take: 1 });
  const categoryId = categories[0].id;

  const response = await request(app)
    .post("/api/v1/transactions")
    .set("Authorization", `Bearer ${token}`)
    .send({
      amount: 25.5,
      description: "McDonald's",
      date: "2024-01-15",
      categoryId,
      ...overrides,
    });

  return response.body;
};

describe("POST /api/v1/transactions", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("should create a transaction with AI categorization", async () => {
    const token = await registerAndLogin();

    const response = await request(app)
      .post("/api/v1/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 25.5,
        description: "McDonald's",
        date: "2024-01-15",
      });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(25.5);
    expect(response.body.description).toBe("McDonald's");
    expect(response.body.aiSuggested).toBe(true);
  }, 15000);

  test("should create a transaction with provided categoryId", async () => {
    const token = await registerAndLogin();
    const transaction = await createTransaction(token);

    expect(transaction.aiSuggested).toBe(false);
    expect(transaction.categoryId).toBeDefined();
  });

  test("should return 401 without token", async () => {
    const response = await request(app).post("/api/v1/transactions").send({
      amount: 25.5,
      description: "McDonald's",
      date: "2024-01-15",
    });

    expect(response.status).toBe(401);
  });

  test("should return 400 when missing required fields", async () => {
    const token = await registerAndLogin();

    const response = await request(app)
      .post("/api/v1/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "McDonald's" });

    expect(response.status).toBe(400);
  });
});

describe("GET /api/v1/transactions", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("should return 200 with list of transactions", async () => {
    const token = await registerAndLogin();
    await createTransaction(token);

    const response = await request(app)
      .get("/api/v1/transactions")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
  });

  test("should return 401 without token", async () => {
    const response = await request(app).get("/api/v1/transactions");

    expect(response.status).toBe(401);
  });
});

describe("GET /api/v1/transactions/:id", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("should return 200 with transaction data", async () => {
    const token = await registerAndLogin();
    const transaction = await createTransaction(token);

    const response = await request(app)
      .get(`/api/v1/transactions/${transaction.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(transaction.id);
  });

  test("should return 404 for non-existent transaction", async () => {
    const token = await registerAndLogin();

    const response = await request(app)
      .get("/api/v1/transactions/non-existent-id")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});

describe("PATCH /api/v1/transactions/:id", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("should return 200 with updated transaction", async () => {
    const token = await registerAndLogin();
    const transaction = await createTransaction(token);

    const response = await request(app)
      .patch(`/api/v1/transactions/${transaction.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 99.99 });

    expect(response.status).toBe(200);
    expect(response.body.amount).toBe(99.99);
  });

  test("should return 404 for non-existent transaction", async () => {
    const token = await registerAndLogin();

    const response = await request(app)
      .patch("/api/v1/transactions/non-existent-id")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 99.99 });

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/v1/transactions/:id", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("should return 200 with success message", async () => {
    const token = await registerAndLogin();
    const transaction = await createTransaction(token);

    const response = await request(app)
      .delete(`/api/v1/transactions/${transaction.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Transaction deleted successfully");
  });

  test("should return 404 after deletion", async () => {
    const token = await registerAndLogin();
    const transaction = await createTransaction(token);

    await request(app)
      .delete(`/api/v1/transactions/${transaction.id}`)
      .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
      .get(`/api/v1/transactions/${transaction.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});

describe("GET /api/v1/transactions/stats", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("should return 200 with stats", async () => {
    const token = await registerAndLogin();
    await createTransaction(token);

    const response = await request(app)
      .get("/api/v1/transactions/stats?month=1&year=2024")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.totalAmount).toBeDefined();
    expect(Array.isArray(response.body.byCategory)).toBe(true);
    expect(Array.isArray(response.body.topExpenses)).toBe(true);
  });

  test("should return 400 when month or year is missing", async () => {
    const token = await registerAndLogin();

    const response = await request(app)
      .get("/api/v1/transactions/stats")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  test("should return 401 without token", async () => {
    const response = await request(app).get(
      "/api/v1/transactions/stats?month=1&year=2024",
    );

    expect(response.status).toBe(401);
  });

  test("should return empty stats when no transactions", async () => {
    const token = await registerAndLogin();

    const response = await request(app)
      .get("/api/v1/transactions/stats?month=1&year=2024")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.totalAmount).toBe(0);
    expect(response.body.byCategory).toHaveLength(0);
    expect(response.body.topExpenses).toHaveLength(0);
  });
});
