import supertest from "supertest";
import { web } from "../src/application/web.js";
import {
  createUser,
  loginUser,
  removeProductsByMerchantUsername,
  removeUserByUsername,
} from "./test-util.js";
import { prismaClient } from "../src/application/database.js";

const MERCHANT = {
  username: "merchant-test",
  email: "merchant-test@example.com",
  password: "testing",
  name: "Merchant Test",
  role: "MERCHANT",
};

const PRODUCT_PAYLOAD = {
  sku: "PROD-001",
  name: "Test Product",
  description: "Product description",
  price: 15000,
  stock: 10,
};

describe("Product API", () => {
  let merchantToken;

  beforeEach(async () => {
    await createUser(MERCHANT);
    const loginResponse = await loginUser({
      username_or_email: MERCHANT.username,
      password: MERCHANT.password,
    });
    merchantToken = loginResponse.body.data.token;
  });

  afterEach(async () => {
    await removeProductsByMerchantUsername(MERCHANT.username);
    await removeUserByUsername(MERCHANT.username);
  });

  it("should create a product as merchant", async () => {
    const response = await supertest(web)
      .post("/api/products")
      .set("Authorization", `Bearer ${merchantToken}`)
      .send(PRODUCT_PAYLOAD);

    expect(response.status).toBe(200);
    expect(response.body.data.sku).toBe(PRODUCT_PAYLOAD.sku);
    expect(response.body.data.name).toBe(PRODUCT_PAYLOAD.name);
    expect(response.body.data.price).toBe(PRODUCT_PAYLOAD.price);
    expect(response.body.data.stock).toBe(PRODUCT_PAYLOAD.stock);
  });

  it("should search products and return created product", async () => {
    await supertest(web)
      .post("/api/products")
      .set("Authorization", `Bearer ${merchantToken}`)
      .send(PRODUCT_PAYLOAD);

    const response = await supertest(web)
      .get("/api/products")
      .query({ name: "Test Product" });

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].name).toBe(PRODUCT_PAYLOAD.name);
    expect(response.body.paging.page).toBe(1);
  });

  it("should get a product detail", async () => {
    const createResponse = await supertest(web)
      .post("/api/products")
      .set("Authorization", `Bearer ${merchantToken}`)
      .send(PRODUCT_PAYLOAD);

    const productId = createResponse.body.data.id;
    const response = await supertest(web).get(`/api/products/${productId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(productId);
    expect(response.body.data.sku).toBe(PRODUCT_PAYLOAD.sku);
  });

  it("should update a product as merchant", async () => {
    const createResponse = await supertest(web)
      .post("/api/products")
      .set("Authorization", `Bearer ${merchantToken}`)
      .send(PRODUCT_PAYLOAD);

    const productId = createResponse.body.data.id;
    const updatedPayload = {
      sku: "PROD-001-UPDATED",
      name: "Test Product Updated",
      description: "Updated description",
      price: 20000,
      stock: 5,
    };

    const response = await supertest(web)
      .put(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${merchantToken}`)
      .send(updatedPayload);

    expect(response.status).toBe(200);
    expect(response.body.data.sku).toBe(updatedPayload.sku);
    expect(response.body.data.name).toBe(updatedPayload.name);
    expect(response.body.data.price).toBe(updatedPayload.price);
    expect(response.body.data.stock).toBe(updatedPayload.stock);
  });

  it("should soft delete a product as merchant", async () => {
    const createResponse = await supertest(web)
      .post("/api/products")
      .set("Authorization", `Bearer ${merchantToken}`)
      .send(PRODUCT_PAYLOAD);

    const productId = createResponse.body.data.id;
    const deleteResponse = await supertest(web)
      .delete(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${merchantToken}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.data.id).toBe(productId);

    const searchResponse = await supertest(web)
      .get("/api/products")
      .query({ name: "Test Product" });
    expect(searchResponse.status).toBe(200);
    expect(
      searchResponse.body.data.find((product) => product.id === productId),
    ).toBeUndefined();
  });
});

afterAll(async () => {
  await prismaClient.$disconnect();
});
