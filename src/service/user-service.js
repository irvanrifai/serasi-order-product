import {
  getUserValidation,
  loginUserValidation,
  registerUserValidation,
  updateUserValidation,
} from "../validation/user-validation.js";
import { prismaClient } from "../application/database.js";
import { validate } from "../validation/validation.js";
import { ResponseError } from "../error/response-error.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";

const register = async (request) => {
  const user = validate(registerUserValidation, request);

  const countUserExists = await prismaClient.user.count({
    where: {
      OR: [{ username: user.username }, { email: user.email }],
    },
  });

  if (countUserExists > 0) {
    throw new ResponseError(400, "Username or email already exists");
  }
  user.password = await bcrypt.hash(user.password, 10);

  return prismaClient.user.create({
    data: user,
    select: {
      name: true,
      username: true,
      email: true,
    },
  });
};

const login = async (request) => {
  const loginRequest = validate(loginUserValidation, request);

  const user = await prismaClient.user.findFirst({
    where: {
      OR: [
        { username: loginRequest.username_or_email },
        { email: loginRequest.username_or_email },
      ],
    },
    select: {
      username: true,
      email: true,
      password: true,
    },
  });

  if (!user) {
    throw new ResponseError(401, "Wrong credentials");
  }

  const isPasswordValid = await bcrypt.compare(
    loginRequest.password,
    user.password,
  );
  if (!isPasswordValid) {
    throw new ResponseError(401, "Wrong credentials");
  }

  const jwtSecret = process.env.JWT_SECRET_KEY;
  const token = jwt.sign(
    {
      name: user.name,
      username: user.username,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: "24h" },
  );

  return { token };
};

const get = async (username) => {
  username = validate(getUserValidation, username);

  const user = await prismaClient.user.findUnique({
    where: {
      username: username,
    },
    select: {
      username: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    throw new ResponseError(404, "User not found");
  }

  return user;
};

const update = async (request) => {
  const user = validate(updateUserValidation, request);

  const userExists = await prismaClient.user.count({
    where: {
      username: user.username,
    },
  });

  if (!userExists) {
    throw new ResponseError(404, "User not found");
  }

  const data = {};
  if (user.password) {
    data.password = await bcrypt.hash(user.password, 10);
  }

  if (user.name) {
    data.name = user.name;
  }

  if (user.email) {
    // check if email already exists
    const countEmailExists = await prismaClient.user.count({
      where: {
        email: user.email,
        username: {
          not: user.username,
        },
      },
    });

    if (countEmailExists > 0) {
      throw new ResponseError(400, "Email already exists");
    }
    
    data.email = user.email;
  }

  if (user.phone) {
    data.phone = user.phone;
  }

  return prismaClient.user.update({
    where: {
      username: user.username,
    },
    data: data,
    select: {
      username: true,
      name: true,
      email: true,
      phone: true,
    },
  });
};

export default {
  register,
  login,
  get,
  update,
};
