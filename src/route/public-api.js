import express from "express";
import userController from "../controller/user-controller.js";
import productController from "../controller/product-controller.js";
import { prismaClient } from "../application/database.js";
import IORedis from "ioredis";

const publicRouter = new express.Router();

// Health check route
publicRouter.get("/api/health", async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
    services: {
      database: "DOWN",
      redis: "DOWN"
    }
  };

  try {
    // Check PostgreSQL/Prisma Connection
    await prismaClient.$queryRaw`SELECT 1`;
    healthcheck.services.database = "UP";

    // Check Redis Connection
    const redis = new IORedis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      maxRetriesPerRequest: 1
    });
    await redis.ping();
    healthcheck.services.redis = "UP";
    redis.disconnect();

    return res.status(200).json(healthcheck);

  } catch (error) {
    healthcheck.message = error.message;
    return res.status(503).json(healthcheck);
  }
});

// public user route
publicRouter.post("/api/users/register", userController.register);
publicRouter.post("/api/users/login", userController.login);

// public product route
publicRouter.get("/api/products", productController.search);
publicRouter.get("/api/products/:productId", productController.get);

export { publicRouter };
