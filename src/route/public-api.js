import express from "express";
import userController from "../controller/user-controller.js";
import productController from "../controller/product-controller.js";

const publicRouter = new express.Router();

// Health check route
publicRouter.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// public user route
publicRouter.post("/api/users/register", userController.register);
publicRouter.post("/api/users/login", userController.login);

// public product route
publicRouter.get("/api/products", productController.search);
publicRouter.get("/api/products/:productId", productController.get);

export { publicRouter };
