import { prismaClient } from "../application/database.js";
import { validate } from "../validation/validation.js";
import { ResponseError } from "../error/response-error.js";
import {
  createProductValidation,
  getProductValidation,
  searchProductValidation,
  updateProductValidation,
} from "../validation/product-validation.js";

const create = async (user, request) => {
  const product = validate(createProductValidation, request);
  const productExist = await prismaClient.product.count({
    where: {
      sku: product.sku,
      is_deleted: false,
    },
  });
  if (productExist > 0) {
    throw new ResponseError(400, "product sku is already exist");
  }

  product.merchant_id = user.id;

  return prismaClient.product.create({
    data: product,
    select: {
      id: true,
      sku: true,
      name: true,
      description: true,
      price: true,
      stock: true,
    },
  });
};

const get = async (productId) => {
  productId = validate(getProductValidation, productId);
  const product = await prismaClient.product.findFirst({
    where: {
      id: productId,
      is_deleted: false,
    },
    select: {
      id: true,
      sku: true,
      name: true,
      description: true,
      price: true,
      stock: true,
    },
  });

  if (!product) {
    throw new ResponseError(404, "product is not found");
  }

  return product;
};

const update = async (user, request) => {
  const product = validate(updateProductValidation, request);

  const productSkuExist = await prismaClient.product.count({
    where: {
      sku: product.sku,
      is_deleted: false,
      id: {
        not: product.id,
      },
    },
  });
  if (productSkuExist > 0) {
    throw new ResponseError(400, "product sku is already exist");
  }

  const productExist = await prismaClient.product.count({
    where: {
      merchant_id: user.id,
      id: product.id,
      is_deleted: false,
    },
  });

  if (productExist === 0) {
    throw new ResponseError(404, "product is not found");
  }

  return prismaClient.product.update({
    where: {
      merchant_id: user.id,
      id: product.id,
    },
    data: {
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
    },
    select: {
      id: true,
      sku: true,
      name: true,
      description: true,
      price: true,
      stock: true,
    },
  });
};

const search = async (request) => {
  request = validate(searchProductValidation, request);

  // skip and take for pagination
  const skip = (request.page - 1) * request.size;

  // filtering
  const filters = [];
  // always filter out soft-deleted products
  filters.push({ is_deleted: false });
  if (request.name) {
    filters.push({
      name: {
        contains: request.name,
      },
    });
  }

  const products = await prismaClient.product.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
    select: {
      id: true,
      sku: true,
      name: true,
      description: true,
      price: true,
      stock: true,
    },
  });

  const totalItems = await prismaClient.product.count({
    where: {
      AND: filters,
    },
  });

  return {
    data: products,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

const remove = async (user, productId) => {
  productId = validate(getProductValidation, productId);

  const productExist = await prismaClient.product.count({
    where: {
      merchant_id: user.id,
      id: productId,
      is_deleted: false,
    },
  });

  if (productExist === 0) {
    throw new ResponseError(404, "product is not found");
  }

  // perform soft-delete by marking `is_deleted` true
  return prismaClient.product.update({
    where: {
      merchant_id: user.id,
      id: productId,
    },
    data: {
      is_deleted: true,
    },
    select: {
      id: true,
      sku: true,
      name: true,
      description: true,
      price: true,
      stock: true,
    },
  });
};

export default {
  create,
  get,
  update,
  search,
  remove,
};
