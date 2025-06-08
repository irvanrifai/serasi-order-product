import express from "express"
import userController from "../controller/user-controller.js";

const publicRouter = new express.Router();

// public route
publicRouter.post("/api/users", userController.register);
publicRouter.post("/api/users/login", userController.login);

export {
  publicRouter
}