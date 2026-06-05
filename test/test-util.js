import supertest from "supertest";
import bcrypt from "bcrypt";
import { web } from "../src/application/web.js";
import { prismaClient } from "../src/application/database.js";

const DEFAULT_PASSWORD = "testing";

export const createUser = async ({
  username = "test",
  email = "test@example.com",
  password = DEFAULT_PASSWORD,
  name = "Test User",
  role = "CUSTOMER",
} = {}) => {
  return prismaClient.user.create({
    data: {
      username,
      email,
      password: await bcrypt.hash(password, 10),
      name,
      role,
    },
  });
};

export const removeUserByUsername = async (username = "test") => {
  return prismaClient.user.deleteMany({
    where: {
      username,
    },
  });
};

export const loginUser = async ({ username_or_email = "test", password = DEFAULT_PASSWORD } = {}) => {
  const response = await supertest(web)
    .post("/api/users/login")
    .send({ username_or_email, password });

  return response;
};

export const createProductApi = async ({ token, sku, name, description, price, stock }) => {
  return supertest(web)
    .post("/api/products")
    .set("Authorization", `Bearer ${token}`)
    .send({ sku, name, description, price, stock });
};

export const updateProductApi = async ({ token, productId, sku, name, description, price, stock }) => {
  return supertest(web)
    .put(`/api/products/${productId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ sku, name, description, price, stock });
};

export const deleteProductApi = async ({ token, productId }) => {
  return supertest(web)
    .delete(`/api/products/${productId}`)
    .set("Authorization", `Bearer ${token}`);
};

export const removeProductsByMerchantUsername = async (username = "test") => {
  const merchant = await prismaClient.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!merchant) return;
  await prismaClient.product.deleteMany({
    where: { merchant_id: merchant.id },
  });
};

export const removeOrdersByUserUsername = async (username = "test") => {
  const user = await prismaClient.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!user) return;
  const orders = await prismaClient.order.findMany({
    where: { user_id: user.id },
    select: { id: true },
  });
  const orderIds = orders.map((order) => order.id);
  if (orderIds.length) {
    await prismaClient.orderItem.deleteMany({
      where: { order_id: { in: orderIds } },
    });
  }
  await prismaClient.order.deleteMany({
    where: { user_id: user.id },
  });
};
