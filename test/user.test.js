import supertest from "supertest";
import { web } from "../src/application/web.js";
import { createUser, loginUser, removeUserByUsername } from "./test-util.js";
import { prismaClient } from "../src/application/database.js";

const TEST_USER = {
  username: "test-user",
  email: "test-user@example.com",
  password: "testing",
  name: "Test User",
};

describe("User API", () => {
  afterEach(async () => {
    await removeUserByUsername(TEST_USER.username);
  });

  it("should register a new user", async () => {
    const response = await supertest(web)
      .post("/api/users/register")
      .send(TEST_USER);

    expect(response.status).toBe(200);
    expect(response.body.data.username).toBe(TEST_USER.username);
    expect(response.body.data.email).toBe(TEST_USER.email);
    expect(response.body.data.name).toBe(TEST_USER.name);
  });

  it("should reject invalid registration request", async () => {
    const response = await supertest(web)
      .post("/api/users/register")
      .send({ username: "", email: "invalid", password: "123", name: "" });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it("should reject duplicate username or email registration", async () => {
    await supertest(web).post("/api/users/register").send(TEST_USER);

    const response = await supertest(web)
      .post("/api/users/register")
      .send(TEST_USER);

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it("should login with username", async () => {
    await createUser(TEST_USER);
    const response = await loginUser({
      username_or_email: TEST_USER.username,
      password: TEST_USER.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeDefined();
  });

  it("should login with email", async () => {
    await createUser(TEST_USER);
    const response = await loginUser({
      username_or_email: TEST_USER.email,
      password: TEST_USER.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeDefined();
  });

  it("should reject invalid login payload", async () => {
    const response = await loginUser({ username_or_email: "", password: "" });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it("should reject wrong credentials", async () => {
    await createUser(TEST_USER);
    const response = await loginUser({
      username_or_email: TEST_USER.username,
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it("should get current user with valid token", async () => {
    await createUser(TEST_USER);
    const loginResponse = await loginUser({
      username_or_email: TEST_USER.username,
      password: TEST_USER.password,
    });
    const token = loginResponse.body.data.token;

    const response = await supertest(web)
      .get("/api/users/current")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.username).toBe(TEST_USER.username);
    expect(response.body.data.email).toBe(TEST_USER.email);
  });

  it("should reject current user request with invalid token", async () => {
    const response = await supertest(web)
      .get("/api/users/current")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it("should update current user name and password", async () => {
    await createUser(TEST_USER);
    const loginResponse = await loginUser({
      username_or_email: TEST_USER.username,
      password: TEST_USER.password,
    });
    const token = loginResponse.body.data.token;

    const response = await supertest(web)
      .patch("/api/users/current")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Name", password: "newpassword" });

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("Updated Name");
    expect(response.body.data.username).toBe(TEST_USER.username);
  });

  it("should reject invalid update payload", async () => {
    await createUser(TEST_USER);
    const loginResponse = await loginUser({
      username_or_email: TEST_USER.username,
      password: TEST_USER.password,
    });
    const token = loginResponse.body.data.token;

    const response = await supertest(web)
      .patch("/api/users/current")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "", password: "" });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });
});

afterAll(async () => {
  await prismaClient.$disconnect();
});
