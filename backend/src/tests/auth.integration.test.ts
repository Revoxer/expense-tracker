import { describe, test, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import app from "../index";
import { cleanDatabase, prisma } from "./setup";

describe("POST /api/v1/auth/register", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("should register a new user and return 201", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "test@example.com", password: "password123" });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe("test@example.com");
    expect(response.body.passwordHash).toBeUndefined();
  });

  test("should return 400, when empty email", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "", password: "password123" });

    expect(response.status).toBe(400);
  });

  test("should return 400, when to short password", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "test@example.com", password: "pass" });

    expect(response.status).toBe(400);
  });

  test("should return 409, when the same email", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "test@example.com", password: "password123" });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "test@example.com", password: "password123" });

    expect(response.status).toBe(409);
  });
});

describe("POST /api/v1/auth/login", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("should login and return 200 with token", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "test@example.com", password: "password123" });

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe("test@example.com");
  });

  test("should return 401 for wrong password", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "test@example.com", password: "password123" });

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "wrongpassword" });

    expect(response.status).toBe(401);
  });

  test("should return 401 for non-existent user", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "nobody@example.com", password: "password123" });

    expect(response.status).toBe(401);
  });
});
