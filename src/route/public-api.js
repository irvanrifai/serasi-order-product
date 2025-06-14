import express from "express"
import userController from "../controller/user-controller.js";

const publicRouter = new express.Router();

// Health check route
publicRouter.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// public route
publicRouter.post("/api/users", userController.register);
publicRouter.post("/api/users/login", userController.login);

export {
  publicRouter
}