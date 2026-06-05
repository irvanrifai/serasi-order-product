import { prismaClient } from "../application/database.js";
import { validate } from "../validation/validation.js";
import { ResponseError } from "../error/response-error.js";
import {
  createOrderValidation,
  getOrderValidation,
  historyOrderValidation,
} from "../validation/order-validation.js";

const create = async (user, request, idempotencyKey) => {
  const payload = validate(createOrderValidation, request);

  const created = await prismaClient.$transaction(async (tx) => {
    // Idempotency: if key exists return existing order
    if (idempotencyKey) {
      const existingOrder = await tx.order.findUnique({
        where: { idempotency_key: idempotencyKey },
        include: {
          items: {
            include: {
              product: { select: { id: true, sku: true, name: true, price: true, stock: true } },
            },
          },
        },
      });
      if (existingOrder) return existingOrder;
    }

    // Validate each item and decrement stock
    let totalOrderPrice = 0;
    const orderItemsCreate = [];

    for (const item of payload.items) {
      const product = await tx.product.findUnique({
        where: { id: item.product_id },
      });
      if (!product || product.is_deleted || product.stock < item.quantity) {
        throw new ResponseError(
          400,
          `Product stock ${product?.name || item.product_id} is not sufficient or not found`,
        );
      }

      totalOrderPrice += product.price * item.quantity;
      orderItemsCreate.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.price * item.quantity,
      });

      await tx.product.update({
        where: { id: item.product_id },
        data: { stock: product.stock - item.quantity },
      });
    }

    // Create order with nested items
    const newOrder = await tx.order.create({
      data: {
        user_id: user.id,
        total_price: totalOrderPrice,
        status: "PENDING",
        payment_method: payload.payment_method,
        idempotency_key: idempotencyKey,
        items: {
          create: orderItemsCreate,
        },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, sku: true, name: true, price: true, stock: true } },
          },
        },
      },
    });

    return newOrder;
  });

  return created;
};

const get = async (orderId, user) => {
  orderId = validate(getOrderValidation, orderId);
  const order = await prismaClient.order.findFirst({
    where: {
      id: orderId,
      user_id: user.id,
    },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, sku: true, name: true, price: true, stock: true },
          },
        },
      },
    },
  });

  if (!order) {
    throw new ResponseError(404, "order is not found");
  }

  return order;
};

const history = async (user, request) => {
  request = validate(historyOrderValidation, request);

  const skip = (request.page - 1) * request.size;

  const orders = await prismaClient.order.findMany({
    where: { user_id: user.id },
    take: request.size,
    skip: skip,
    orderBy: { created_at: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, sku: true, name: true, price: true, stock: true },
          },
        },
      },
    },
  });

  const totalItems = await prismaClient.order.count({
    where: { user_id: user.id },
  });

  return {
    data: orders,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

export default { create, get, history };
