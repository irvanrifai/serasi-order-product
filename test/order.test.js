import supertest from "supertest";
import { web } from "../src/application/web.js";
import {
  createUser,
  loginUser,
  removeOrdersByUserUsername,
  removeProductsByMerchantUsername,
  removeUserByUsername,
} from "./test-util.js";
import { prismaClient } from "../src/application/database.js";

const MERCHANT = {
  username: "merchant-order-test",
  email: "merchant-order-test@example.com",
  password: "testing",
  name: "Merchant Order",
  role: "MERCHANT",
};

const CUSTOMER = {
  username: "customer-order-test",
  email: "customer-order-test@example.com",
  password: "testing",
  name: "Customer Order",
  role: "CUSTOMER",
};

const ORDER_PRODUCTS = [
  {
    sku: "ORDER-PROD-001",
    name: "Order Product A",
    description: "Description A",
    price: 10000,
    stock: 5,
  },
  {
    sku: "ORDER-PROD-002",
    name: "Order Product B",
    description: "Description B",
    price: 20000,
    stock: 3,
  },
];

const createOrder = async ({ token, idempotencyKey, items }) => {
  return supertest(web)
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .set("x-idempotency-key", idempotencyKey)
    .send({ payment_method: "QRIS", items });
};

describe("Order API", () => {
  let merchantToken;
  let customerToken;
  let products = [];

  beforeAll(async () => {
    // 1. PEMBERSIHAN AWAL: Hapus dulu user dengan username ini jika sisa test lalu masih ada
    await removeUserByUsername(MERCHANT.username);
    await removeUserByUsername(CUSTOMER.username);

    // 2. Baru buat User Merchant dan Customer dengan aman
    const merchant = await createUser(MERCHANT);
    await createUser(CUSTOMER);

    // 3. Ambil token otentikasi via login
    merchantToken = (
      await loginUser({
        username_or_email: MERCHANT.username,
        password: MERCHANT.password,
      })
    ).body.data.token;

    customerToken = (
      await loginUser({
        username_or_email: CUSTOMER.username,
        password: CUSTOMER.password,
      })
    ).body.data.token;

    // 4. Buat produk pakai Prisma cukup SEKALI saja
    products = [];
    for (const prod of ORDER_PRODUCTS) {
      const createdProd = await prismaClient.product.create({
        data: {
          sku: prod.sku,
          name: prod.name,
          description: prod.description,
          price: prod.price,
          stock: prod.stock,
          // Ganti merchantId mentah dengan objek relation connect bawaan Prisma
          merchant: {
            connect: {
              id: merchant.id,
            },
          },
        },
      });
      products.push(createdProd);
    }
  });

  // Di setiap akhir case, kita cukup bersihkan data orderan saja agar stock/state order kembali fresh
  afterEach(async () => {
    await removeOrdersByUserUsername(CUSTOMER.username);
  });

  // Hancurkan semua data secara kumulatif di paling akhir pengujian file ini
  afterAll(async () => {
    await removeUserByUsername(CUSTOMER.username);
    await removeUserByUsername(MERCHANT.username);
    await removeOrdersByUserUsername(CUSTOMER.username);
    await removeProductsByMerchantUsername(MERCHANT.username);
    await prismaClient.$disconnect();
  });

  it("should create an order and include payment_method", async () => {
    const response = await createOrder({
      token: customerToken,
      idempotencyKey: "order-key-1",
      items: [{ product_id: products[0].id, quantity: 2 }],
    });

    expect(response.status).toBe(200);
    expect(response.body.data.payment_method).toBe("QRIS");
    expect(response.body.data.total_price).toBe(20000);
    expect(response.body.data.items.length).toBe(1);
    expect(response.body.data.items[0].product.id).toBe(products[0].id);
  });

  it("should return the same order when the same idempotency key is reused", async () => {
    const firstResponse = await createOrder({
      token: customerToken,
      idempotencyKey: "order-key-2",
      items: [{ product_id: products[0].id, quantity: 1 }],
    });

    expect(firstResponse.status).toBe(200);

    const secondResponse = await createOrder({
      token: customerToken,
      idempotencyKey: "order-key-2",
      items: [{ product_id: products[0].id, quantity: 1 }],
    });

    expect(secondResponse.status).toBe(200);
    expect(secondResponse.body.data.id).toBe(firstResponse.body.data.id);
    expect(secondResponse.body.data.idempotency_key).toBe(
      firstResponse.body.data.idempotency_key,
    );
  });

  it("should return order history for the customer", async () => {
    await createOrder({
      token: customerToken,
      idempotencyKey: "order-key-3",
      items: [{ product_id: products[0].id, quantity: 1 }],
    });

    const response = await supertest(web)
      .get("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .query({ page: 1, size: 10 });

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.paging.page).toBe(1);
    expect(response.body.data[0].payment_method).toBe("QRIS");
  });

  it("should get order detail by id", async () => {
    const createResponse = await createOrder({
      token: customerToken,
      idempotencyKey: "order-key-4",
      items: [{ product_id: products[1].id, quantity: 2 }],
    });

    const orderId = createResponse.body.data.id;
    const response = await supertest(web)
      .get(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(orderId);
    expect(response.body.data.items[0].product.id).toBe(products[1].id);
    expect(response.body.data.payment_method).toBe("QRIS");
  });
});
