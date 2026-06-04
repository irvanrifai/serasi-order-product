import express from "express";
import userController from "../controller/user-controller.js";
import productController from "../controller/product-controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";
import { rbacMiddleware } from "../middleware/rbac-middleware.js";

const userRouter = new express.Router();
userRouter.use(authMiddleware);

// user auth route
userRouter.get("/api/users/current", userController.get);
userRouter.patch("/api/users/current", userController.update);

// product route
userRouter.post(
  "/api/products",
  rbacMiddleware("MERCHANT"),
  productController.create,
);
userRouter.put(
  "/api/products/:productId",
  rbacMiddleware("MERCHANT"),
  productController.update,
);
userRouter.delete(
  "/api/products/:productId",
  rbacMiddleware("MERCHANT"),
  productController.remove,
);

// order route

export { userRouter };
